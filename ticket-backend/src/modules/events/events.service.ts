import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from '../../entities/Events';
import { CreateEventDto, UpdateEventDto } from '../../dto/event.dto';
import { Ticket } from '../../entities/ticket.entity';
import { Seat } from '../../entities/Seat';
import { SeatStatus } from '../../entities/seat-status.entity';
import { EventDetail } from '../../entities/events-detail.entity';
import { Gift } from '../../entities/gift.entity';
import { EventGift } from '../../entities/event-gift.entity';
import { OrderDetail } from '../../entities/order-detail.entity';
import { Order } from '../../entities/order.entity';
import { Organizer } from '../../entities/organizer.entity';
import { In } from 'typeorm';
import { Payment } from '../../entities/Payment';

// Define a type that includes the seats relation for use within this service
type TicketWithSeats = Ticket & {
  seats: (Seat & { orderDetails?: OrderDetail[] })[]; // Update to orderDetails and make it optional array
};

// Define a type that includes the tickets relation with seats for event details processing
type EventWithTicketsAndDetails = Event & {
    tickets: TicketWithSeats[];
    eventDetails: EventDetail[];
};

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
    @InjectRepository(Ticket)
    private readonly ticketRepository: Repository<Ticket>,
    @InjectRepository(Seat)
    private readonly seatRepository: Repository<Seat>,
    @InjectRepository(SeatStatus)
    private readonly seatStatusRepository: Repository<SeatStatus>,
    @InjectRepository(EventDetail)
    private readonly eventDetailRepository: Repository<EventDetail>,
    @InjectRepository(Gift)
    private readonly giftRepository: Repository<Gift>,
    @InjectRepository(EventGift)
    private readonly eventGiftRepository: Repository<EventGift>,
    @InjectRepository(OrderDetail)
    private readonly orderDetailRepository: Repository<OrderDetail>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(Organizer)
    private readonly organizerRepository: Repository<Organizer>,
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
  ) {}

  async findAllGifts(): Promise<Gift[]> {
    return this.giftRepository.find();
  }

  async findAll(): Promise<Event[]> {
    return this.eventRepository.find({
      relations: ['eventDetails', 'tickets', 'eventGifts', 'createdBy', 'organizer'],
    });
  }

  async findByCreator(userId: number): Promise<Event[]> {
    return this.eventRepository.find({
      where: { createdBy: { id: userId } },
      relations: ['eventDetails', 'tickets', 'eventGifts', 'createdBy', 'organizer'],
    });
  }

  async getStatsByCreator(userId: number) {
    const events = await this.eventRepository.find({
      where: { createdBy: { id: userId } },
      relations: ['eventDetails'],
    });

    const now = new Date();
    const upcoming = events.filter(event => {
      const startTime = new Date(event.eventDetails[0]?.startTime);
      return startTime > now;
    }).length;

    const ongoing = events.filter(event => {
      const startTime = new Date(event.eventDetails[0]?.startTime);
      const endTime = new Date(event.eventDetails[0]?.endTime);
      return startTime <= now && endTime >= now;
    }).length;

    const completed = events.filter(event => {
      const endTime = new Date(event.eventDetails[0]?.endTime);
      return endTime < now;
    }).length;

    return {
      total: events.length,
      upcoming,
      ongoing,
      completed,
      cancelled: events.filter(event => event.status === 'CANCELLED').length
    };
  }

  async findOne(id: number): Promise<Event> {
    const event = await this.eventRepository.findOne({
      where: { id },
      relations: ['eventDetails', 'tickets', 'eventGifts', 'createdBy', 'organizer'],
    });

    if (!event) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }

    return event;
  }

  private generateSeatInfo(index: number, type: string) {
    const SEATS_PER_ROW = 18; // Mỗi hàng 18 ghế
    const rowIndex = Math.floor(index / SEATS_PER_ROW); // Xác định hàng (0 = A, 1 = B, ...)
    const seatNumber = (index % SEATS_PER_ROW) + 1; // Số ghế trong hàng (1-18)
    
    return {
      zone: type,
      row: String.fromCharCode(65 + rowIndex), // Chuyển số thành chữ (0 -> 'A', 1 -> 'B', ...)
      number: seatNumber
    };
  }

  private async createSeatsForTicket(
    event: EventWithTicketsAndDetails,
    ticket: Ticket,
    quantity: number,
    eventDetails: EventDetail[]
  ) {
    // Tạo mảng seats mới
    const seats: Partial<Seat>[] = [];
    
    // Tạo seats theo số lượng
    for (let i = 0; i < quantity; i++) {
      const seatInfo = this.generateSeatInfo(i, ticket.type);
      seats.push({
        event,
        ticket,
        zone: seatInfo.zone,
        row: seatInfo.row,
        number: seatInfo.number
      });
    }

    // Lưu tất cả ghế vào database
    const savedSeats = await this.seatRepository.save(seats);

    // Tạo trạng thái ghế cho mỗi ghế và mỗi lịch diễn
    const seatStatuses = savedSeats.flatMap(seat =>
      eventDetails.map(detail => ({
        event: event,
        seat,
        eventDetail: detail,
        status: 'available',
        holdUntil: null,
      }))
    );

    // Lưu tất cả trạng thái ghế vào database
    await this.seatStatusRepository.save(seatStatuses);
  }

  private async handleSeatQuantityChange(
    ticket: Ticket,
    newQuantity: number,
    oldQuantity: number,
    event: Event
  ) {
    if (!ticket || !event) {
      throw new Error('Ticket hoặc Event không tồn tại');
    }

    const SEATS_PER_ROW = 18;
    
    // Lấy tất cả ghế của ticket này, sắp xếp theo hàng và số ghế
    const existingSeats = await this.seatRepository.find({
      where: { ticket: { id: ticket.id } },
      relations: ['seatStatuses'],
      order: { row: 'ASC', number: 'ASC' }
    });

    if (newQuantity > oldQuantity) {
      // Thêm ghế
      const seatsToAdd = newQuantity - oldQuantity;
      const rows = new Map<string, number>(); // Map để lưu số ghế trong mỗi hàng

      // Tính số ghế hiện tại trong mỗi hàng
      existingSeats.forEach(seat => {
        const count = rows.get(seat.row) || 0;
        rows.set(seat.row, count + 1);
      });

      let remainingSeats = seatsToAdd;
      let currentRow = 'A';
      const newSeats: Partial<Seat>[] = [];

      while (remainingSeats > 0) {
        const currentRowSeats = rows.get(currentRow) || 0;
        
        if (currentRowSeats < SEATS_PER_ROW) {
          // Có thể thêm ghế vào hàng này
          const availableInRow = SEATS_PER_ROW - currentRowSeats;
          const seatsToAddInRow = Math.min(availableInRow, remainingSeats);
          
          for (let i = 0; i < seatsToAddInRow; i++) {
            newSeats.push({
              event: event,
              ticket: ticket,
              zone: ticket.type,
              row: currentRow,
              number: currentRowSeats + i + 1
            });
          }
          
          rows.set(currentRow, currentRowSeats + seatsToAddInRow);
          remainingSeats -= seatsToAddInRow;
        }
        
        // Chuyển sang hàng tiếp theo nếu hàng hiện tại đã đầy
        if (remainingSeats > 0 && (currentRowSeats >= SEATS_PER_ROW || currentRowSeats === 0)) {
          currentRow = String.fromCharCode(currentRow.charCodeAt(0) + 1);
        }
      }

      // Lưu các ghế mới
      if (newSeats.length > 0) {
        const savedSeats = await this.seatRepository.save(newSeats);
        
        // Tạo seat status cho mỗi ghế mới và mỗi event detail
        const eventDetails = await this.eventDetailRepository.find({
          where: { event: { id: event.id } }
        });
        
        const seatStatuses = savedSeats.flatMap(seat =>
          eventDetails.map(detail => ({
            event: event,
            seat: seat,
            eventDetail: detail,
            status: 'available',
            holdUntil: null
          }))
        );
        
        await this.seatStatusRepository.save(seatStatuses);

        // Cập nhật capacity cho event details
        await Promise.all(
          eventDetails.map(detail =>
            this.eventDetailRepository.update(
              { id: detail.id },
              { capacity: oldQuantity + seatsToAdd }
            )
          )
        );
      }
    } else if (newQuantity < oldQuantity) {
      // Giảm số ghế
      const seatsToRemove = oldQuantity - newQuantity;
      
      // Lọc ra các ghế chưa bán, sắp xếp theo thứ tự ngược (để xóa từ cuối)
      const availableSeats = await this.seatRepository
        .createQueryBuilder('seat')
        .leftJoinAndSelect('seat.orderDetails', 'orderDetails')
        .leftJoinAndSelect('seat.seatStatuses', 'seatStatuses')
        .where('seat.ticketId = :ticketId', { ticketId: ticket.id })
        .andWhere('orderDetails.id IS NULL')
        .orderBy('seat.row', 'DESC')
        .addOrderBy('seat.number', 'DESC')
        .getMany();

      if (availableSeats.length < seatsToRemove) {
        throw new Error('Không thể giảm số lượng vé vì đã có vé được bán');
      }

      const seatsToDelete = availableSeats.slice(0, seatsToRemove);

      // Xóa tất cả seat statuses liên quan
      await Promise.all(
        seatsToDelete.map(async (seat) => {
          if (seat.seatStatuses && seat.seatStatuses.length > 0) {
            await this.seatStatusRepository.remove(seat.seatStatuses);
          }
        })
      );

      // Sau đó xóa seats
      await this.seatRepository.remove(seatsToDelete);

      // Cập nhật capacity cho event details
      const eventDetails = await this.eventDetailRepository.find({
        where: { event: { id: event.id } }
      });

      await Promise.all(
        eventDetails.map(detail =>
          this.eventDetailRepository.update(
            { id: detail.id },
            { capacity: oldQuantity - seatsToRemove }
          )
        )
      );
    }

    // Cập nhật số lượng vé trong ticket
    await this.ticketRepository.update(
      { id: ticket.id },
      { quantity: newQuantity }
    );
  }

  async create(createEventDto: CreateEventDto, userId: number): Promise<Event> {
    try {
      // Kiểm tra trùng lặp loại vé trong DTO
      const ticketTypes = createEventDto.tickets.map(t => t.type);
      const uniqueTypes = new Set(ticketTypes);
      if (uniqueTypes.size !== ticketTypes.length) {
        throw new Error('Không thể tạo nhiều loại vé trùng tên trong cùng một sự kiện');
      }

      // Tạo event với đầy đủ thông tin và liên kết với organizer
      const eventData: Partial<Event> = {
        eventName: createEventDto.eventName,
        mainImageUrl: createEventDto.mainImageUrl,
        status: 'active',
        createdById: userId,
        organizerId: createEventDto.organizer.id
      };
      const savedEvent = await this.eventRepository.save(eventData);

      // Tạo event details
      const eventDetails = await Promise.all(
        createEventDto.eventDetails.map(detail => {
          const eventDetailData: Partial<EventDetail> = {
            ...detail,
            startTime: new Date(detail.startTime),
            endTime: new Date(detail.endTime),
            status: 'active',
            event: savedEvent,
            eventId: savedEvent.id,
            capacity: 0 // Set initial capacity to 0
          };
          return this.eventDetailRepository.save(eventDetailData);
        })
      );

      // Tạo tickets và seats
      let totalCapacity = 0;
      for (const ticketDto of createEventDto.tickets) {
        const ticketData: Partial<Ticket> = {
          type: ticketDto.type,
          price: ticketDto.price,
          quantity: ticketDto.quantity,
          status: 'available',
          event: savedEvent,
          eventId: savedEvent.id
        };
        const ticket = await this.ticketRepository.save(ticketData);

        // Tạo seats cho ticket
        await this.createSeatsForTicket(savedEvent, ticket, ticketDto.quantity, eventDetails);
        
        // Cộng dồn số lượng vé
        totalCapacity += ticketDto.quantity;
      }

      // Cập nhật capacity cho tất cả event details
      await Promise.all(
        eventDetails.map(detail =>
          this.eventDetailRepository.update(
            { id: detail.id },
            { capacity: totalCapacity }
          )
        )
      );

      // Tạo event gifts nếu có
      if (createEventDto.giftIds && createEventDto.giftIds.length > 0) {
        await Promise.all(
          createEventDto.giftIds.map(giftId => {
            const eventGiftData: Partial<EventGift> = {
              event: savedEvent,
              eventId: savedEvent.id,
              giftId
            };
            return this.eventGiftRepository.save(eventGiftData);
          })
        );
      }

      // Trả về event đã tạo với đầy đủ relations
      return this.findOne(savedEvent.id);
    } catch (error) {
      // Log lỗi để debug
      console.error('Error creating event:', error);
      throw error;
    }
  }

  async update(id: number, updateEventDto: UpdateEventDto, userId: number): Promise<Event> {
    // Find existing event with all relations
    const event = await this.eventRepository.findOne({
      where: { id, createdBy: { id: userId } },
      relations: ['tickets', 'eventDetails', 'eventGifts', 'organizer', 'tickets.seats', 'tickets.seats.orderDetails'],
    });

    if (!event) {
      throw new NotFoundException(`Event with ID ${id} not found or you don't have permission`);
    }

    try {
      // Update basic event fields
      if (updateEventDto.eventName) event.eventName = updateEventDto.eventName;
      if (updateEventDto.mainImageUrl) event.mainImageUrl = updateEventDto.mainImageUrl;
      if (updateEventDto.status) event.status = updateEventDto.status;

      // Save event first to ensure we have an ID
      const savedEvent = await this.eventRepository.save(event);

      // --- Handle tickets ---
      if (updateEventDto.tickets) {
        // Delete old tickets that are not in the new DTO
        const newTicketIds = new Set(updateEventDto.tickets.filter(t => t.id).map(t => t.id));
        for (const oldTicket of event.tickets) {
          if (!newTicketIds.has(oldTicket.id)) {
            await this.ticketRepository.remove(oldTicket);
          }
        }

        // Update or create tickets
        for (const ticketDto of updateEventDto.tickets) {
          if (ticketDto.id) {
            // Update existing ticket
            const existingTicket = event.tickets.find(t => t.id === ticketDto.id);
            if (existingTicket) {
              if (existingTicket.quantity !== ticketDto.quantity) {
                // Nếu số lượng vé thay đổi, cập nhật seats
                await this.handleSeatQuantityChange(existingTicket, ticketDto.quantity, existingTicket.quantity, savedEvent);
              }
              await this.ticketRepository.update(ticketDto.id, {
                ...ticketDto,
                eventId: savedEvent.id
              });
            }
          } else {
            // Create new ticket
            const newTicket = await this.ticketRepository.save({
              ...ticketDto,
              event: savedEvent,
              eventId: savedEvent.id,
              status: 'available'
            });
            // Tạo seats cho ticket mới
            await this.createSeatsForTicket(savedEvent, newTicket, ticketDto.quantity, event.eventDetails);
          }
        }
      }

      // --- Handle event details ---
      if (updateEventDto.eventDetails) {
        // Delete old details that are not in the new DTO
        const newDetailIds = new Set(updateEventDto.eventDetails.filter(d => d.id).map(d => d.id));
        for (const oldDetail of event.eventDetails) {
          if (!newDetailIds.has(oldDetail.id)) {
            await this.eventDetailRepository.remove(oldDetail);
          }
        }

        // Update or create details
        for (const detailDto of updateEventDto.eventDetails) {
          if (detailDto.id) {
            // Update existing detail
            await this.eventDetailRepository.update(detailDto.id, {
              ...detailDto,
              eventId: savedEvent.id
            });
          } else {
            // Create new detail
            await this.eventDetailRepository.save({
              ...detailDto,
              event: savedEvent,
              eventId: savedEvent.id
            });
          }
        }
      }

      // --- Handle gifts ---
      if (updateEventDto.giftIds) {
        // Remove old gift relations
        await this.eventGiftRepository.delete({ eventId: savedEvent.id });

        // Create new gift relations
        if (updateEventDto.giftIds.length > 0) {
          const eventGifts = updateEventDto.giftIds.map(giftId => ({
            eventId: savedEvent.id,
            giftId: giftId,
            event: savedEvent,
            gift: { id: giftId }
          }));
          await this.eventGiftRepository.save(eventGifts);
        }
      }

      // --- Handle organizer ---
      if (updateEventDto.organizer) {
        if (event.organizer) {
          // Update existing organizer
          await this.organizerRepository.update(event.organizer.id, {
            ...updateEventDto.organizer
          });
        } else {
          // Create new organizer
          const newOrganizer = await this.organizerRepository.save({
            ...updateEventDto.organizer,
            event: savedEvent
          });
          savedEvent.organizer = newOrganizer;
          await this.eventRepository.save(savedEvent);
        }
      }

      // Return updated event with all relations
      return this.findOne(savedEvent.id);
    } catch (error) {
      console.error('Error updating event:', error);
      throw error;
    }
  }

  async deleteEvent(id: number): Promise<void> {
    // Find the event with all relations
    const event = await this.eventRepository.findOne({
      where: { id },
      relations: [
        'eventDetails', 
        'tickets', 
        'eventGifts',
        'tickets.seats',
        'tickets.seats.orderDetails',
        'tickets.seats.orderDetails.order',
        'tickets.seats.orderDetails.order.payments',
        'eventDetails.seatStatuses',
        'organizer'
      ]
    });

    if (!event) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }

    // Delete related event gifts
    if (event.eventGifts?.length > 0) {
      await this.eventGiftRepository.remove(event.eventGifts);
    }

    // Delete related tickets and their dependencies
    if (event.tickets?.length > 0) {
      // Get all ticket IDs and seat IDs
      const ticketIds = event.tickets.map(ticket => ticket.id);
      const seatIds = event.tickets.flatMap(ticket => 
        ticket.seats?.map(seat => seat.id) || []
      );

      // Get all order IDs from order details
      const orderIds = new Set(
        event.tickets.flatMap(ticket =>
          ticket.seats?.flatMap(seat =>
            seat.orderDetails?.map(detail => detail.order.id) || []
          ) || []
        )
      );

      // Delete payments and orders
      for (const orderId of orderIds) {
        const order = await this.orderRepository.findOne({
          where: { id: orderId },
          relations: ['payments']
        });
        
        if (order?.payments) {
          // Delete payments first
          await this.paymentRepository.remove(order.payments);
        }

        // Delete order details
        await this.orderDetailRepository.delete({ order: { id: orderId } });
        
        // Delete order
        await this.orderRepository.delete(orderId);
      }

      // Delete seat statuses for all seats
      await this.seatStatusRepository.delete({ seat: { id: In(seatIds) } });

      // Delete seats after seat statuses
      await this.seatRepository.delete({ ticket: { id: In(ticketIds) } });
      
      // Delete tickets
      await this.ticketRepository.remove(event.tickets);
    }

    // Delete event details and their seat statuses
    if (event.eventDetails?.length > 0) {
      for (const eventDetail of event.eventDetails) {
        if (eventDetail.seatStatuses?.length > 0) {
          await this.seatStatusRepository.remove(eventDetail.seatStatuses);
        }
      }
      await this.eventDetailRepository.remove(event.eventDetails);
    }

    // Delete organizer if exists
    if (event.organizer) {
      await this.organizerRepository.remove(event.organizer);
    }

    // Finally delete the event
    await this.eventRepository.remove(event);
  }
}

