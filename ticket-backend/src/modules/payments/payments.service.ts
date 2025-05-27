import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '../../entities/order.entity';
import { Payment } from '../../entities/Payment';
import { OrderStatus } from '../../common/enums/order-status.enum';
import { OrdersService } from '../order/orders.service';
import { MailService } from '../mail/mail.service';
import { PaymentInfo } from '../mail/interfaces';
import { NotificationsService } from '../notifications/notifications.service';
import {
  createVNPayUrl,
  generateHMAC,
  verifyReturnUrl,
} from '../utils/vnpay.util';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    @InjectRepository(Order)
    private orderRepo: Repository<Order>,
    @InjectRepository(Payment)
    private paymentRepo: Repository<Payment>,
    private readonly ordersService: OrdersService,
    private readonly mailService: MailService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async createPaymentUrl(
    orderId: number,
    amount: number,
    ipAddr: string,
    bankCode?: string,
  ): Promise<string> {
    try {
      this.logger.log(`[DEBUG] orderId: ${orderId} (${typeof orderId}), amount: ${amount} (${typeof amount})`);
      if (!orderId || typeof orderId !== 'number' || orderId <= 0) {
        throw new BadRequestException('orderId không hợp lệ');
      }
      if (!amount || typeof amount !== 'number' || amount <= 0) {
        throw new BadRequestException('amount không hợp lệ');
      }
      const order = await this.orderRepo.findOne({ where: { id: orderId } });
      if (!order) {
        throw new BadRequestException('Đơn hàng không tồn tại');
      }
      if (order.status === OrderStatus.PAID) {
        throw new BadRequestException('Đơn hàng đã được thanh toán');
      }
      await this.orderRepo.update(orderId, { status: OrderStatus.PENDING });
      let payment = await this.paymentRepo.findOne({
        where: { order: { id: orderId }, paymentStatus: 'pending' },
      });
      if (!payment) {
        payment = this.paymentRepo.create({
          order: { id: orderId } as any,
          amount: Number(amount),
          paymentMethod: 'vnpay',
          paymentStatus: 'pending',
        });
        await this.paymentRepo.save(payment);
        this.logger.log('Created pending payment:', payment);
      }
      const safeAmount = Math.round(Math.abs(amount));
      const url = createVNPayUrl({
        orderId,
        amount: safeAmount,
        ipAddr,
        orderInfo: `Thanh toan don hang #${orderId}`,
        bankCode,
      });
      this.logger.log(`[DEBUG] VNPay URL created: ${url}`);
      return url;
    } catch (error) {
      this.logger.error(`Error creating payment URL: ${error.message}`);
      throw error;
    }
  }

  async handleVNPayCallback(query: Record<string, string>) {
    try {
      // Sử dụng verifyReturnUrl để xác thực chữ ký
      const isValid = verifyReturnUrl(query);
      if (!isValid) {
        this.logger.warn('VNPay callback: Invalid secure hash');
        throw new BadRequestException('Invalid secure hash');
      }

      const orderId = parseInt(query.vnp_TxnRef);
      const isSuccess = query.vnp_ResponseCode === '00';
      const orderStatus = isSuccess ? OrderStatus.PAID : OrderStatus.FAILED;

      // Cập nhật trạng thái đơn hàng
      const updatedOrder = await this.ordersService.updateOrderStatus(orderId, orderStatus);

      // Cập nhật bản ghi Payment khi thanh toán thành công
      if (isSuccess) {
        let payment = await this.paymentRepo.findOne({
          where: { order: { id: orderId }, paymentStatus: 'pending' },
        });
        if (payment) {
          payment.paymentStatus = 'success';
          payment.amount = Number(query.vnp_Amount) / 100;
          await this.paymentRepo.save(payment);
          this.logger.log('Payment updated to success:', payment);
          
          // Lấy thông tin đơn hàng chi tiết để gửi email
          const order = await this.orderRepo.findOne({
            where: { id: orderId },
            relations: [
              'user', 
              'orderDetails', 
              'orderDetails.ticket', 
              'orderDetails.ticket.event',
              'orderDetails.ticket.event.eventDetails',
              'orderDetails.seat'
            ],
          });
          
          if (order) {
            // Thêm thông tin sự kiện cho email
            if (order.orderDetails && order.orderDetails.length > 0 && 
                order.orderDetails[0].ticket && order.orderDetails[0].ticket.event) {
              const event = order.orderDetails[0].ticket.event;
              const eventDetail = event.eventDetails && event.eventDetails.length > 0 ? event.eventDetails[0] : null;
              
              order['eventInfo'] = {
                name: event.eventName || 'Sự kiện',
                location: eventDetail?.location || 'Địa điểm',
                startTime: eventDetail?.startTime,
                endTime: eventDetail?.endTime
              };
            }
            
            // Gửi email thông báo thanh toán thành công
            try {
              this.logger.log('Đang gửi email thông báo thanh toán thành công');
              const paymentInfo: PaymentInfo = {
                bankCode: query.vnp_BankCode,
                transactionNo: query.vnp_TransactionNo,
                paymentDate: new Date().toLocaleString('vi-VN'),
                amount: payment.amount
              };
              
              await this.mailService.sendPaymentConfirmationEmail(order, paymentInfo);
              this.logger.log('Đã gửi email thông báo thanh toán thành công');
              
              // Thêm thông báo cho người dùng trong ứng dụng
              if (order.user && order.user.id) {
                try {
                  // Tạo thông báo về vé đã mua
                  let eventName = "Sự kiện";
                  if (order.orderDetails && order.orderDetails.length > 0 && 
                      order.orderDetails[0].ticket && order.orderDetails[0].ticket.event) {
                    eventName = order.orderDetails[0].ticket.event.eventName;
                  }
                  
                  const message = `Vé của bạn cho sự kiện "${eventName}" đã được xác nhận. Vui lòng kiểm tra trong mục Vé của tôi.`;
                  await this.notificationsService.createNotification(order.user.id, message);
                  this.logger.log(`Đã gửi thông báo xác nhận vé cho user #${order.user.id}`);
                } catch (notifError) {
                  this.logger.error(`Lỗi khi gửi thông báo ứng dụng: ${notifError.message}`);
                }
              }
            } catch (emailError) {
              // Chỉ ghi log lỗi nhưng không throw lỗi để không ảnh hưởng đến quy trình thanh toán
              this.logger.error(`Lỗi khi gửi email thông báo: ${emailError.message}`);
            }
          }
        } else {
          this.logger.warn(
            'No pending payment found to update for order:',
            orderId,
          );
        }
      }

      return {
        success: isSuccess,
        message: isSuccess ? 'Thanh toán thành công' : 'Thanh toán thất bại',
        data: {
          orderId,
          amount: query.vnp_Amount,
          transactionNo: query.vnp_TransactionNo,
          bankCode: query.vnp_BankCode,
        },
      };
    } catch (error) {
      this.logger.error(`Error handling callback: ${error.message}`);
      throw error;
    }
  }
}
