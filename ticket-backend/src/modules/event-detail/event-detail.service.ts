import { Injectable, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventDetail } from '../../entities/events-detail.entity';
import { CreateEventDetailDto } from '../../dto/create-event-detail.dto';
import { UpdateEventDetailDto } from '../../dto/update-event-detail.dto';
import { SeatStatus } from '../../entities/seat-status.entity';
import { Seat } from '../../entities/Seat';
import { TicketsService } from '../ticket/tickets.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class EventDetailService {
  constructor(
    @InjectRepository(EventDetail)
    private readonly eventDetailRepo: Repository<EventDetail>,
    @InjectRepository(SeatStatus)
    private readonly seatStatusRepo: Repository<SeatStatus>,
    @InjectRepository(Seat)
    private readonly seatRepo: Repository<Seat>,
    @Inject(forwardRef(() => TicketsService))
    private ticketsService: TicketsService,
    private notificationsService: NotificationsService
  ) {}

  async create(dto: CreateEventDetailDto): Promise<EventDetail> {
    const eventDetail = this.eventDetailRepo.create(dto);
    return this.eventDetailRepo.save(eventDetail);
  }

  async findAll(): Promise<EventDetail[]> {
    return this.eventDetailRepo.find({ relations: ['event'] });
  }

  async findOne(id: number): Promise<EventDetail> {
    const eventDetail = await this.eventDetailRepo.findOne({
      where: { id },
      relations: ['event', 'seatMap'],
    });
    if (!eventDetail) {
      throw new NotFoundException(`EventDetail with ID ${id} not found`);
    }
    return eventDetail;
  }

  async update(id: number, dto: UpdateEventDetailDto): Promise<EventDetail> {
    const existingEventDetail = await this.findOne(id);
    
    // Lưu các giá trị cũ để kiểm tra thay đổi
    const oldLocation = existingEventDetail.location;
    const oldStartTime = existingEventDetail.startTime;
    
    // Cập nhật từ DTO
    if (dto.location !== undefined) existingEventDetail.location = dto.location;
    if (dto.startTime !== undefined) existingEventDetail.startTime = dto.startTime;
    if (dto.endTime !== undefined) existingEventDetail.endTime = dto.endTime;
    if (dto.description !== undefined) existingEventDetail.description = dto.description;
    if (dto.image_detail !== undefined) existingEventDetail.detailImageUrl = dto.image_detail;
    
    const updatedEventDetail = await this.eventDetailRepo.save(existingEventDetail);
    
    // Kiểm tra và gửi thông báo nếu địa điểm hoặc thời gian thay đổi
    const hasLocationChanged = oldLocation !== updatedEventDetail.location;
    const hasTimeChanged = oldStartTime && updatedEventDetail.startTime && 
                          new Date(oldStartTime).getTime() !== new Date(updatedEventDetail.startTime).getTime();
    
    if (hasLocationChanged || hasTimeChanged) {
      await this.sendEventChangeNotifications(updatedEventDetail, hasLocationChanged, hasTimeChanged);
    }
    
    return updatedEventDetail;
  }

  async remove(id: number): Promise<void> {
    const eventDetail = await this.findOne(id);
    await this.eventDetailRepo.remove(eventDetail);
  }

  async updateCapacity(eventDetailId: number) {
    const eventDetail = await this.eventDetailRepo.findOne({
      where: { id: eventDetailId },
      relations: ['event'],
    });
    if (!eventDetail) return;
    const eventId = eventDetail.event.id;
    const seatCount = await this.seatRepo.count({ where: { event: { id: eventId } } });
    await this.eventDetailRepo.update(eventDetailId, { capacity: seatCount });
    
    // Cập nhật trạng thái vé sau khi cập nhật capacity
    await this.ticketsService.checkAndUpdateAllTicketsStatus(eventId);
  }

  async recalculateAllCapacities(): Promise<{ count: number }> {
    const allEventDetails = await this.eventDetailRepo.find({ relations: ['event'] });
    for (const detail of allEventDetails) {
      const eventId = detail.event.id;
      const seatCount = await this.seatRepo.count({ where: { event: { id: eventId } } });
      await this.eventDetailRepo.update(detail.id, { capacity: seatCount });
      
      // Cập nhật trạng thái vé sau khi cập nhật capacity
      await this.ticketsService.checkAndUpdateAllTicketsStatus(eventId);
    }
    return { count: allEventDetails.length };
  }

  // Gửi thông báo khi sự kiện thay đổi
  private async sendEventChangeNotifications(eventDetail: EventDetail, locationChanged: boolean, timeChanged: boolean): Promise<void> {
    try {
      // Lấy thông tin sự kiện và tất cả người dùng đã mua vé
      const event = await this.eventDetailRepo.findOne({
        where: { id: eventDetail.id },
        relations: ['event', 'event.tickets', 'event.tickets.orderDetails', 'event.tickets.orderDetails.order', 'event.tickets.orderDetails.order.user'],
      });
      
      if (!event || !event.event || !event.event.tickets) {
        return;
      }
      
      // Tìm tất cả người dùng đã mua vé
      const users = new Set();
      
      for (const ticket of event.event.tickets) {
        if (!ticket.orderDetails) continue;
        
        for (const orderDetail of ticket.orderDetails) {
          if (!orderDetail.order || !orderDetail.order.user) continue;
          
          // Chỉ gửi cho đơn hàng đã thanh toán
          if (orderDetail.order.status !== 'paid') continue;
          
          // Thêm người dùng vào danh sách
          users.add(orderDetail.order.user);
        }
      }
      
      // Định dạng thời gian
      let formattedTime = '';
      if (eventDetail.startTime) {
        const eventDate = new Date(eventDetail.startTime);
        const formattedDate = eventDate.toLocaleDateString('vi-VN');
        formattedTime = eventDate.toLocaleTimeString('vi-VN', {
          hour: '2-digit',
          minute: '2-digit',
        });
        formattedTime = `${formattedDate} ${formattedTime}`;
      }
      
      // Tạo nội dung thông báo
      let message = `Sự kiện "${event.event.eventName}" `;
      if (locationChanged && timeChanged) {
        message += `đã thay đổi địa điểm thành ${eventDetail.location} và thời gian thành ${formattedTime}. Vui lòng lưu ý!`;
      } else if (locationChanged) {
        message += `đã thay đổi địa điểm thành ${eventDetail.location}. Vui lòng lưu ý!`;
      } else if (timeChanged) {
        message += `đã thay đổi thời gian thành ${formattedTime}. Vui lòng lưu ý!`;
      }
      
      // Gửi thông báo cho mỗi người dùng
      for (const user of Array.from(users)) {
        await this.notificationsService.createNotification((user as any).id, message);
      }
    } catch (error) {
      console.error(`Error sending event change notifications: ${error.message}`);
    }
  }
}
