import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Ticket } from '../../entities/ticket.entity';
import { CreateTicketDto } from '../../dto/create-ticket.dto';
import { Event } from '../../entities/Events';
import { Seat } from '../../entities/Seat';
import { SeatStatus } from '../../entities/seat-status.entity';
import { EventDetail } from '../../entities/events-detail.entity';
import { OrderDetail } from '../../entities/order-detail.entity';
import { Order } from '../../entities/order.entity';

export interface TicketStats {
  total: number;
  sold: number;
  reserved: number;
  cancelled: number;
  revenue: number;
}

@Injectable()
export class TicketsService {
  constructor(
    @InjectRepository(Ticket)
    private ticketRepo: Repository<Ticket>,

    @InjectRepository(Event)
    private eventRepo: Repository<Event>,

    @InjectRepository(Seat)
    private seatRepo: Repository<Seat>,

    @InjectRepository(SeatStatus)
    private seatStatusRepo: Repository<SeatStatus>,

    @InjectRepository(OrderDetail)
    private orderDetailRepo: Repository<OrderDetail>,

    @InjectRepository(Order)
    private orderRepo: Repository<Order>,
  ) {}

  async create(createTicketDto: CreateTicketDto): Promise<Ticket> {
    const event = await this.eventRepo.findOneBy({
      id: createTicketDto.eventId,
    });
    if (!event) throw new NotFoundException('Event not found');

    const ticket = this.ticketRepo.create({ ...createTicketDto, event });
    return this.ticketRepo.save(ticket);
  }

  findAll(): Promise<Ticket[]> {
    return this.ticketRepo.find({ relations: ['event'] });
  }

  async findOne(id: number): Promise<Ticket> {
    const ticket = await this.ticketRepo.findOne({
      where: { id },
      relations: ['event', 'event.eventDetails'],
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    return ticket;
  }

  async remove(id: number): Promise<void> {
    const result = await this.ticketRepo.delete(id);
    if (result.affected === 0) throw new NotFoundException('Ticket not found');
  }

  // Phương thức mới: Cập nhật số lượng vé dựa trên số ghế
  async updateTicketQuantityBySeatCount(eventId: number): Promise<void> {
    // Lấy tất cả các vé của sự kiện
    const tickets = await this.ticketRepo.find({
      where: { event: { id: eventId } },
    });

    // Lấy tất cả ghế theo loại vé
    for (const ticket of tickets) {
      // Đếm số ghế thuộc loại vé này
      const seatCount = await this.seatRepo.count({
        where: { 
          event: { id: eventId },
          ticket: { id: ticket.id }
        }
      });

      // Cập nhật số lượng vé dựa trên số ghế
      ticket.quantity = seatCount;
      await this.ticketRepo.save(ticket);
    }
  }

  // Phương thức mới: Cập nhật trạng thái vé dựa trên số ghế còn trống
  async updateTicketStatusByAvailableSeats(eventDetailId: number): Promise<void> {
    // Lấy thông tin event detail
    const eventDetail = await this.seatStatusRepo.manager.findOne(EventDetail, {
      where: { id: eventDetailId },
      relations: ['event'],
    });

    if (!eventDetail) throw new NotFoundException('Event detail not found');

    const eventId = eventDetail.event.id;

    // Lấy tất cả các vé của sự kiện
    const tickets = await this.ticketRepo.find({
      where: { event: { id: eventId } },
    });

    for (const ticket of tickets) {
      // Đếm số ghế thuộc loại vé này
      const seats = await this.seatRepo.find({
        where: { 
          event: { id: eventId },
          ticket: { id: ticket.id }
        },
        relations: ['seatStatuses'],
      });

      // Đếm số ghế còn trống
      let availableSeats = 0;
      for (const seat of seats) {
        const seatStatus = await this.seatStatusRepo.findOne({
          where: {
            seat: { id: seat.id },
            eventDetail: { id: eventDetailId }
          }
        });
        // Nếu không có seatStatus hoặc seatStatus là 'available' thì coi như ghế còn trống
        if (!seatStatus || seatStatus.status === 'available') {
          availableSeats++;
        }
      }

      // Cập nhật trạng thái vé
      if (availableSeats === 0) {
        ticket.status = 'sold_out';
      } else if (availableSeats < seats.length / 2) {
        ticket.status = 'limited';
      } else {
        ticket.status = 'available';
      }

      await this.ticketRepo.save(ticket);
    }
  }
  
  // Kiểm tra và cập nhật trạng thái tất cả các vé cho một sự kiện
  async checkAndUpdateAllTicketsStatus(eventId: number): Promise<void> {
    const event = await this.eventRepo.findOne({
      where: { id: eventId },
      relations: ['eventDetails'],
    });

    if (!event) throw new NotFoundException('Event not found');

    // Cập nhật số lượng vé dựa trên số ghế
    await this.updateTicketQuantityBySeatCount(eventId);

    // Cập nhật trạng thái vé dựa trên số ghế còn trống cho từng chi tiết sự kiện
    for (const eventDetail of event.eventDetails) {
      await this.updateTicketStatusByAvailableSeats(eventDetail.id);
    }
  }

  // Lấy thống kê vé
  async getTicketStats(): Promise<TicketStats> {
    const tickets = await this.ticketRepo.find();
    
    const stats: TicketStats = {
      total: tickets.length,
      sold: tickets.filter(ticket => ticket.status === 'sold').length,
      reserved: tickets.filter(ticket => ticket.status === 'reserved').length,
      cancelled: tickets.filter(ticket => ticket.status === 'cancelled').length,
      revenue: tickets
        .filter(ticket => ticket.status === 'sold')
        .reduce((sum, ticket) => sum + ticket.price, 0)
    };

    return stats;
  }

  async getTicketsOfMyEvents(adminId: number): Promise<Ticket[]> {
    console.log('===> getTicketsOfMyEvents CALLED', adminId);
    console.log('Getting tickets for admin:', adminId);
    
    try {
      if (!adminId || isNaN(adminId)) {
        console.error('Invalid adminId:', adminId);
        throw new Error('Invalid adminId provided');
      }

      // 1. Lấy tất cả event do admin này tạo sử dụng query builder
      const events = await this.eventRepo
        .createQueryBuilder('event')
        .where('event.createdBy = :adminId', { adminId })
        .getMany();
      
      console.log('Found events:', events.length);
      
      if (events.length === 0) {
        console.log('No events found for admin');
        return [];
      }

      // Lọc kỹ eventIds để loại bỏ các giá trị undefined/NaN
      const eventIds = events.map(e => e.id).filter(id => typeof id === 'number' && !isNaN(id));
      console.log('Filtered Event IDs:', eventIds, 'Types:', eventIds.map(e => typeof e));

      // Nếu không có event nào thì trả về mảng rỗng, tránh lỗi NaN
      if (!eventIds.length) {
        console.error('No valid eventIds found for admin:', adminId);
        return [];
      }

      // 2. Lấy tất cả ticket của các event này với đầy đủ thông tin
      const tickets = await this.ticketRepo
        .createQueryBuilder('ticket')
        .leftJoinAndSelect('ticket.event', 'event')
        .leftJoinAndSelect('event.createdBy', 'createdBy')
        .leftJoinAndSelect('event.organizer', 'organizer')
        .leftJoinAndSelect('event.eventDetails', 'eventDetails')
        .where('event.id IN (:...eventIds)', { eventIds })
        .orderBy('ticket.id', 'DESC')
        .getMany();

      console.log('Found tickets:', tickets.length);
      return tickets;
    } catch (error) {
      console.error('Error in getTicketsOfMyEvents:', error);
      throw error;
    }
  }

  async getStatsOfMyEvents(adminId: number) {
    // 1. Lấy tất cả sự kiện của admin
    const events = await this.eventRepo.find({ where: { createdBy: { id: adminId } } });
    const eventIds = events.map(e => e.id);

    if (eventIds.length === 0) {
      return { totalSold: 0, totalRevenue: 0 };
    }

    // 2. Lấy tất cả vé của các sự kiện này
    const tickets = await this.ticketRepo.find({ where: { event: { id: In(eventIds) } } });
    const ticketIds = tickets.map(t => t.id);

    if (ticketIds.length === 0) {
      return { totalSold: 0, totalRevenue: 0 };
    }

    // 3. Lấy tất cả orderDetails của các vé này, chỉ lấy đơn đã thanh toán
    const orderDetails = await this.orderDetailRepo.find({
      where: {
        ticket: { id: In(ticketIds) },
      },
      relations: ['order', 'ticket'],
    });

    // 4. Lọc orderDetails có order.status === 'paid'
    const paidOrderDetails = orderDetails.filter(od => od.order && od.order.status === 'paid');

    // 5. Tính tổng số vé đã bán và doanh thu
    const totalSold = paidOrderDetails.reduce((sum, od) => sum + od.quantity, 0);
    const totalRevenue = paidOrderDetails.reduce((sum, od) => sum + (od.unitPrice * od.quantity), 0);

    return {
      totalSold,
      totalRevenue
    };
  }
}

console.log('===> tickets.service.ts loaded');
