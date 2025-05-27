import { Controller, Post, Body, Inject, Get, Param } from '@nestjs/common';
import { MailService } from './mail.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Order } from '../../entities/order.entity';
import { PaymentInfo } from './interfaces';

@Controller('mail')
export class MailController {
  constructor(
    private readonly mailService: MailService,
    @InjectRepository(Order)
    private orderRepo: Repository<Order>,
    private dataSource: DataSource,
  ) {}

  /**
   * API endpoint để test gửi email xác nhận thanh toán
   * Chỉ nên sử dụng trong môi trường phát triển
   */
  @Get('test-payment-email/:orderId')
  async testPaymentEmail(@Param('orderId') orderId: string) {
    try {
      // Lấy thông tin đơn hàng với các relation cơ bản
      const order = await this.orderRepo.findOne({
        where: { id: parseInt(orderId) },
        relations: [
          'user',
          'orderDetails',
          'orderDetails.ticket',
          'orderDetails.ticket.event',
          'orderDetails.ticket.event.eventDetails',
          'orderDetails.seat'
        ],
      });

      if (!order) {
        return { success: false, message: 'Order không tồn tại' };
      }

      if (!order.user?.email) {
        return { success: false, message: 'Order không có thông tin email người dùng' };
      }

      // Truy vấn lấy thông tin sự kiện và ghế ngồi từ database
      const orderInfo = await this.dataSource.query(`
        SELECT 
          o.id as order_id,
          e.eventName as event_name,
          ed.location,
          ed.startTime,
          ed.endTime
        FROM orders o
        JOIN event_detail ed ON o.eventDetailId = ed.id
        JOIN events e ON ed.eventId = e.id
        WHERE o.id = ?
      `, [parseInt(orderId)]);

      const seatInfo = await this.dataSource.query(`
        SELECT 
          od.id as order_detail_id,
          t.type as ticket_type,
          s.zone,
          s.row,
          s.number as seat_number
        FROM order_detail od
        JOIN ticket t ON od.ticketId = t.id
        JOIN seat s ON od.seatId = s.id
        WHERE od.orderId = ?
      `, [parseInt(orderId)]);

      console.log('Order Info:', orderInfo);
      console.log('Seat Info:', seatInfo);

      // Thêm thông tin chi tiết vào đơn hàng
      if (orderInfo && orderInfo.length > 0) {
        order['eventInfo'] = {
          name: orderInfo[0].event_name,
          location: orderInfo[0].location,
          startTime: orderInfo[0].startTime,
          endTime: orderInfo[0].endTime
        };
      }

      if (seatInfo && seatInfo.length > 0) {
        // Cập nhật thông tin ghế cho từng orderDetail
        order.orderDetails.forEach(detail => {
          const matchingSeat = seatInfo.find(s => s.order_detail_id === detail.id);
          if (matchingSeat) {
            detail.seat = {
              ...detail.seat,
              zone: matchingSeat.zone,
              row: matchingSeat.row,
              number: matchingSeat.seat_number
            };
            
            // Cập nhật thông tin loại vé
            detail.ticket = {
              ...detail.ticket,
              type: matchingSeat.ticket_type
            };
          }
        });
      }

      // Tạo thông tin thanh toán giả lập
      const paymentInfo: PaymentInfo = {
        bankCode: 'VNPAY',
        transactionNo: `TEST_${Date.now()}`,
        paymentDate: new Date().toLocaleString('vi-VN'),
        amount: Number(order.totalAmount),
      };

      // Gửi email
      const emailResult = await this.mailService.sendPaymentConfirmationEmail(order, paymentInfo);

      return { 
        success: true, 
        message: 'Email đã được gửi thành công!',
        to: order.user?.email,
        emailInfo: {
          messageId: emailResult?.messageId,
          sender: process.env.EMAIL_USER,
          accepted: emailResult?.accepted || []
        },
        eventInfo: order['eventInfo'],
        seatInfo: seatInfo
      };
    } catch (error) {
      console.error('Error:', error);
      return { 
        success: false, 
        message: `Lỗi khi gửi email: ${error.message}`,
        error: JSON.stringify(error)
      };
    }
  }
} 