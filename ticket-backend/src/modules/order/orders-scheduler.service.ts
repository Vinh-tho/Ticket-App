import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression, SchedulerRegistry } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, MoreThanOrEqual, Between } from 'typeorm';
import { Order } from '../../entities/order.entity';
import { OrderStatus } from '../../common/enums/order-status.enum';
import { OrdersService } from './orders.service';
import { Payment } from '../../entities/Payment';
import { MailService } from '../mail/mail.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class OrdersSchedulerService {
  private readonly logger = new Logger(OrdersSchedulerService.name);
  
  // Thời gian tối đa một đơn hàng được phép ở trong trạng thái pending (15 phút)
  private readonly PAYMENT_TIMEOUT_MINUTES = 15;
  
  // Thời gian để gửi thông báo nhắc nhở trước khi hết hạn (5 phút)
  private readonly REMINDER_BEFORE_MINUTES = 5;

  constructor(
    @InjectRepository(Order)
    private orderRepo: Repository<Order>,
    @InjectRepository(Payment)
    private paymentRepo: Repository<Payment>,
    private readonly ordersService: OrdersService,
    private readonly mailService: MailService,
    private readonly notificationsService: NotificationsService,
    private schedulerRegistry: SchedulerRegistry,
  ) {
    // Gọi kiểm tra đơn hàng hết hạn ngay khi service được khởi tạo
    setTimeout(() => {
      this.logger.log('Chạy kiểm tra đơn hàng tự động lần đầu tiên...');
      this.handleExpiredOrders();
      this.sendPaymentReminders();
    }, 10000); // Đợi 10 giây sau khi ứng dụng khởi động
  }

  /**
   * Scheduled task chạy mỗi 30 giây, kiểm tra và cập nhật các đơn hàng chưa thanh toán quá hạn
   */
  @Cron('*/30 * * * * *') // Cron expression cho mỗi 30 giây
  async handleExpiredOrders() {
    try {
      this.logger.log('Đang kiểm tra các đơn hàng chưa thanh toán quá hạn...');
      
      // Tính thời điểm quá hạn (hiện tại - thời gian chờ)
      const now = new Date();
      const expirationTime = new Date(now);
      expirationTime.setMinutes(expirationTime.getMinutes() - this.PAYMENT_TIMEOUT_MINUTES);
      
      this.logger.log(`Thời gian hiện tại: ${now.toISOString()}`);
      this.logger.log(`Thời gian hết hạn: ${expirationTime.toISOString()}`);
      this.logger.log(`Tìm đơn hàng PENDING tạo trước: ${expirationTime.toISOString()}`);
      
      // Tìm tất cả đơn hàng ở trạng thái PENDING và đã tạo trước thời điểm expirationTime
      const expiredOrders = await this.orderRepo.find({
        where: {
          status: OrderStatus.PENDING,
          orderDate: LessThan(expirationTime),
        },
        relations: [
          'user', 
          'payments',
          'orderDetails',
          'orderDetails.ticket',
          'orderDetails.ticket.event',
          'orderDetails.seat'
        ],
      });
      
      if (expiredOrders.length === 0) {
        this.logger.log('Không có đơn hàng nào cần xử lý.');
        
        // Log thêm để debug - lấy các đơn hàng pending gần đây nhất
        const recentPendingOrders = await this.orderRepo.find({
          where: { status: OrderStatus.PENDING },
          order: { orderDate: 'DESC' },
          take: 5,
        });
        
        if (recentPendingOrders.length > 0) {
          this.logger.log(`Đã tìm thấy ${recentPendingOrders.length} đơn hàng PENDING gần đây nhất:`);
          recentPendingOrders.forEach(order => {
            this.logger.log(`ID: ${order.id}, OrderDate: ${order.orderDate.toISOString()}, UpdatedAt: ${order.updatedAt.toISOString()}`);
          });
        } else {
          this.logger.log('Không có đơn hàng PENDING nào trong hệ thống.');
        }
        
        return;
      }
      
      this.logger.log(`Tìm thấy ${expiredOrders.length} đơn hàng chưa thanh toán quá hạn.`);
      
      // Log chi tiết các đơn hàng quá hạn
      expiredOrders.forEach(order => {
        this.logger.log(`Đơn hàng quá hạn: ID=${order.id}, OrderDate=${order.orderDate.toISOString()}, UpdatedAt=${order.updatedAt.toISOString()}`);
      });
      
      // Cập nhật từng đơn hàng
      for (const order of expiredOrders) {
        try {
          // Đánh dấu đơn hàng là thanh toán thất bại
          this.logger.log(`Bắt đầu cập nhật đơn hàng ${order.id} sang FAILED...`);
          await this.ordersService.updateOrderStatus(order.id, OrderStatus.FAILED);
          
          // Cập nhật trạng thái thanh toán thành thất bại
          if (order.payments && order.payments.length > 0) {
            for (const payment of order.payments) {
              if (payment.paymentStatus === 'pending') {
                this.logger.log(`Cập nhật thanh toán ${payment.id} sang failed...`);
                payment.paymentStatus = 'failed';
                await this.paymentRepo.save(payment);
              }
            }
          } else {
            this.logger.log(`Đơn hàng ${order.id} không có bản ghi thanh toán.`);
          }
          
          // Hủy đơn hàng - logic cập nhật trạng thái ghế về available đã được thêm vào OrdersService
          this.logger.log(`Cập nhật đơn hàng ${order.id} sang CANCELLED...`);
          await this.ordersService.updateOrderStatus(order.id, OrderStatus.CANCELLED);
          
          this.logger.log(`Đã cập nhật đơn hàng #${order.id} thành thanh toán thất bại và hủy đơn.`);
          
          // Gửi email thông báo đơn hàng bị hủy
          if (order.user && order.user.email) {
            try {
              await this.mailService.sendPaymentExpiredEmail(order);
              this.logger.log(`Đã gửi email thông báo hủy đơn hàng #${order.id} đến ${order.user.email}`);
            } catch (emailError) {
              this.logger.error(`Lỗi khi gửi email thông báo hủy đơn #${order.id}: ${emailError.message}`);
            }
          }
          
          // Thêm thông báo trong ứng dụng cho người dùng
          if (order.user && order.user.id) {
            try {
              // Lấy tên sự kiện nếu có
              let eventName = "Sự kiện";
              if (order.orderDetails && order.orderDetails.length > 0 && 
                  order.orderDetails[0].ticket && order.orderDetails[0].ticket.event) {
                eventName = order.orderDetails[0].ticket.event.eventName;
              }
              
              const message = `Đơn hàng #${order.id} của bạn cho sự kiện "${eventName}" đã bị hủy do quá thời gian thanh toán.`;
              await this.notificationsService.createNotification(order.user.id, message);
              this.logger.log(`Đã tạo thông báo hủy đơn hàng cho người dùng #${order.user.id}`);
            } catch (notifError) {
              this.logger.error(`Lỗi khi tạo thông báo ứng dụng: ${notifError.message}`);
            }
          }
        } catch (error) {
          this.logger.error(`Lỗi khi xử lý đơn hàng #${order.id}: ${error.message}`);
          this.logger.error(`Chi tiết lỗi:`, error.stack);
        }
      }
      
      this.logger.log(`Đã xử lý xong ${expiredOrders.length} đơn hàng quá hạn.`);
    } catch (error) {
      this.logger.error(`Lỗi khi xử lý đơn hàng quá hạn: ${error.message}`);
      this.logger.error(`Chi tiết lỗi:`, error.stack);
    }
  }
  
  /**
   * Scheduled task chạy mỗi 30 giây, kiểm tra và gửi thông báo nhắc nhở trước khi đơn hàng hết hạn
   */
  @Cron('*/30 * * * * *')
  async sendPaymentReminders() {
    try {
      this.logger.log('Đang kiểm tra các đơn hàng cần gửi thông báo nhắc nhở...');
      
      // Tính thời điểm cần gửi thông báo nhắc nhở
      const now = new Date();
      
      // Tính thời điểm hết hạn nếu đơn hàng được tạo bây giờ
      const futureExpirationTime = new Date(now);
      futureExpirationTime.setMinutes(now.getMinutes() + this.PAYMENT_TIMEOUT_MINUTES);
      
      // Tính thời điểm nên bắt đầu gửi thông báo (lùi lại REMINDER_BEFORE_MINUTES phút từ thời điểm hết hạn)
      const reminderTime = new Date(now);
      reminderTime.setMinutes(now.getMinutes() + (this.PAYMENT_TIMEOUT_MINUTES - this.REMINDER_BEFORE_MINUTES));
      
      this.logger.log(`Thời gian hiện tại: ${now.toISOString()}`);
      this.logger.log(`Gửi thông báo cho đơn hàng sẽ hết hạn sau: ${this.REMINDER_BEFORE_MINUTES} phút`);
      
      // Tìm các đơn hàng:
      // 1. Có trạng thái PENDING
      // 2. Chưa gửi thông báo nhắc nhở (reminderSent = 'Chưa nhắc')
      // 3. Đã tạo một khoảng thời gian đủ để sắp tới hạn thanh toán
      
      // Tính thời điểm đơn hàng cần được tạo trước đó
      const orderCreatedBefore = new Date(now);
      orderCreatedBefore.setMinutes(now.getMinutes() - (this.PAYMENT_TIMEOUT_MINUTES - this.REMINDER_BEFORE_MINUTES));
      
      this.logger.log(`Tìm đơn hàng tạo trước: ${orderCreatedBefore.toISOString()}`);
      
      const ordersToRemind = await this.orderRepo.find({
        where: {
          status: OrderStatus.PENDING,
          reminderSent: 'Chưa nhắc',
          orderDate: LessThan(orderCreatedBefore),
        },
        relations: [
          'user',
          'orderDetails',
          'orderDetails.ticket',
          'orderDetails.ticket.event',
        ],
      });
      
      if (ordersToRemind.length === 0) {
        this.logger.log('Không có đơn hàng nào cần gửi thông báo nhắc nhở.');
        return;
      }
      
      this.logger.log(`Tìm thấy ${ordersToRemind.length} đơn hàng cần gửi thông báo nhắc nhở.`);
      
      // Xử lý từng đơn hàng
      for (const order of ordersToRemind) {
        try {
          // Tính thời gian còn lại để thanh toán (phút)
          const orderCreationTime = new Date(order.orderDate).getTime();
          const expirationTime = new Date(orderCreationTime + this.PAYMENT_TIMEOUT_MINUTES * 60 * 1000);
          const minutesLeft = Math.ceil((expirationTime.getTime() - now.getTime()) / (60 * 1000));
          
          // Lấy tên sự kiện nếu có
          let eventName = "Sự kiện";
          if (order.orderDetails && order.orderDetails.length > 0 && 
              order.orderDetails[0].ticket && order.orderDetails[0].ticket.event) {
            eventName = order.orderDetails[0].ticket.event.eventName;
          }
          
          // Tạo thông báo nhắc nhở
          const message = `Đơn hàng #${order.id} của bạn cho "${eventName}" còn ${minutesLeft} phút để thanh toán. Vui lòng hoàn tất thanh toán để không bị hủy.`;
          
          // Gửi thông báo đến người dùng
          if (order.user && order.user.id) {
            await this.notificationsService.createNotification(order.user.id, message);
            this.logger.log(`Đã gửi thông báo nhắc nhở cho đơn hàng #${order.id} đến người dùng #${order.user.id}`);
            
            // Đánh dấu đã gửi thông báo
            order.reminderSent = 'Đã nhắc';
            await this.orderRepo.save(order);
          }
        } catch (error) {
          this.logger.error(`Lỗi khi gửi thông báo nhắc nhở cho đơn hàng #${order.id}: ${error.message}`);
        }
      }
      
      this.logger.log(`Đã xử lý xong ${ordersToRemind.length} thông báo nhắc nhở.`);
    } catch (error) {
      this.logger.error(`Lỗi khi gửi thông báo nhắc nhở: ${error.message}`);
      this.logger.error(`Chi tiết lỗi:`, error.stack);
    }
  }
} 