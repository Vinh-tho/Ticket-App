import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cron } from '@nestjs/schedule';
import { Order } from '../../entities/order.entity';
import { EventDetail } from '../../entities/events-detail.entity';
import { NotificationsService } from './notifications.service';
import { OrderStatus } from '../../common/enums/order-status.enum';

@Injectable()
export class ScheduledNotificationsService {
  private readonly logger = new Logger(ScheduledNotificationsService.name);

  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(EventDetail)
    private readonly eventDetailRepository: Repository<EventDetail>,
    private readonly notificationsService: NotificationsService,
  ) {}

  // Chạy mỗi 12 giờ để kiểm tra đơn hàng chờ thanh toán
  @Cron('0 */12 * * *')
  async checkPendingOrders() {
    this.logger.log('Checking for pending orders...');
    
    try {
      // Tìm các đơn hàng chưa thanh toán, đã tạo ít nhất 1 giờ trước
      const oneHourAgo = new Date();
      oneHourAgo.setHours(oneHourAgo.getHours() - 1);
      
      const pendingOrders = await this.orderRepository.find({
        where: {
          status: OrderStatus.PENDING,
          orderDate: { $lt: oneHourAgo } as any,
        },
        relations: ['user', 'orderDetails', 'orderDetails.ticket'],
      });
      
      this.logger.log(`Found ${pendingOrders.length} pending orders`);
      
      for (const order of pendingOrders) {
        if (!order.user) continue;
        
        // Tạo thông báo nhắc nhở thanh toán
        const message = `Đơn hàng #${order.id} của bạn đang chờ thanh toán. Vui lòng thanh toán để hoàn tất mua vé.`;
        await this.notificationsService.createNotification(order.user.id, message);
        this.logger.log(`Sent payment reminder for order #${order.id} to user #${order.user.id}`);
      }
    } catch (error) {
      this.logger.error(`Error checking pending orders: ${error.message}`);
    }
  }
  
  // Chạy mỗi ngày lúc 9h sáng để kiểm tra sự kiện sắp diễn ra
  @Cron('0 9 * * *')
  async checkUpcomingEvents() {
    this.logger.log('Checking for upcoming events...');
    
    try {
      const now = new Date();
      const twoDaysLater = new Date();
      twoDaysLater.setDate(now.getDate() + 2);
      
      // Tìm các sự kiện diễn ra trong 2 ngày tới
      const upcomingEvents = await this.eventDetailRepository.find({
        where: {
          startTime: { $gte: now, $lte: twoDaysLater } as any,
        },
        relations: ['event', 'event.tickets', 'event.tickets.orderDetails', 'event.tickets.orderDetails.order', 'event.tickets.orderDetails.order.user'],
      });
      
      this.logger.log(`Found ${upcomingEvents.length} upcoming events`);
      
      for (const eventDetail of upcomingEvents) {
        if (!eventDetail.event || !eventDetail.event.tickets) continue;
        
        const event = eventDetail.event;
        
        // Tìm các người dùng đã mua vé cho sự kiện này
        const users = new Set();
        
        for (const ticket of event.tickets) {
          if (!ticket.orderDetails) continue;
          
          for (const orderDetail of ticket.orderDetails) {
            if (!orderDetail.order || !orderDetail.order.user) continue;
            
            // Chỉ gửi cho đơn hàng đã thanh toán
            if (orderDetail.order.status !== OrderStatus.PAID) continue;
            
            // Thêm người dùng vào danh sách
            users.add(orderDetail.order.user);
          }
        }
        
        // Định dạng thời gian
        const eventDate = new Date(eventDetail.startTime);
        const formattedDate = eventDate.toLocaleDateString('vi-VN');
        const formattedTime = eventDate.toLocaleTimeString('vi-VN', {
          hour: '2-digit',
          minute: '2-digit',
        });
        
        // Gửi thông báo cho mỗi người dùng
        for (const user of Array.from(users)) {
          const message = `Chỉ còn ${Math.ceil((eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))} ngày nữa đến sự kiện "${event.eventName}" mà bạn đã đăng ký. Địa điểm: ${eventDetail.location}, thời gian: ${formattedDate} ${formattedTime}.`;
          await this.notificationsService.createNotification((user as any).id, message);
          this.logger.log(`Sent event reminder for event "${event.eventName}" to user #${(user as any).id}`);
        }
      }
    } catch (error) {
      this.logger.error(`Error checking upcoming events: ${error.message}`);
    }
  }
} 