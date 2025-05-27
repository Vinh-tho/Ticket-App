import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { Order } from '../../entities/order.entity';
import {
  OrderWithRelations,
  PaymentInfo,
  EventInfo,
  OrderDetailWithRelations
} from './interfaces';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter;

  constructor() {
    // Khởi tạo transporter (cấu hình này sẽ được thay thế bằng cài đặt thực tế)
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER || 'your-email@gmail.com',
        pass: process.env.EMAIL_PASSWORD || 'your-app-password',
      },
    });
    
    // Kiểm tra kết nối SMTP khi khởi động
    this.verifyConnection();
  }

  // Kiểm tra kết nối với máy chủ SMTP
  private async verifyConnection() {
    try {
      await this.transporter.verify();
      this.logger.log('Kết nối SMTP thành công, sẵn sàng gửi email');
    } catch (error) {
      this.logger.error(`Lỗi kết nối SMTP: ${error.message}`);
      if (error.message.includes('Invalid login')) {
        this.logger.error('Tài khoản hoặc mật khẩu email không đúng. Hãy kiểm tra lại EMAIL_USER và EMAIL_PASSWORD trong file .env');
      }
    }
  }

  /**
   * Gửi email thông báo thanh toán thành công
   * @param order Thông tin đơn hàng đã thanh toán
   * @param paymentInfo Thông tin thanh toán
   */
  async sendPaymentConfirmationEmail(order: OrderWithRelations, paymentInfo: PaymentInfo) {
    try {
      if (!order.user?.email) {
        this.logger.error('Không thể gửi email: Email người dùng không tồn tại');
        return;
      }
      
      this.logger.log(`Bắt đầu gửi email đến: ${order.user.email}`);
      this.logger.log(`Thông tin người gửi: ${process.env.EMAIL_USER}`);

      // Lấy thông tin sự kiện từ các dữ liệu đã được enriched từ controller
      const eventInfo = order['eventInfo'] || {};
      const eventName = eventInfo.name || 'Sự kiện';
      const eventLocation = eventInfo.location || 'Địa điểm';
      
      // Format thời gian
      let eventDate = 'Chưa xác định';
      if (eventInfo.startTime) {
        const startTime = new Date(eventInfo.startTime);
        const formattedDate = startTime.toLocaleDateString('vi-VN', {
          year: 'numeric', 
          month: '2-digit', 
          day: '2-digit'
        });
        
        const formattedStartTime = startTime.toLocaleTimeString('vi-VN', {
          hour: '2-digit',
          minute: '2-digit'
        });
        
        if (eventInfo.endTime) {
          const endTime = new Date(eventInfo.endTime);
          const formattedEndTime = endTime.toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit'
          });
          eventDate = `${formattedDate} ${formattedStartTime} - ${formattedEndTime}`;
        } else {
          eventDate = `${formattedDate} ${formattedStartTime}`;
        }
      }

      // Tạo nội dung email với đúng tên trường theo interface EventInfo
      const emailContent = this.createPaymentConfirmationEmailContent(order, paymentInfo, {
        eventName: eventName,
        eventLocation: eventLocation,
        eventDate: eventDate,
      });

      // Cấu hình email
      const mailOptions = {
        from: process.env.EMAIL_USER || 'Ticket System <your-email@gmail.com>',
        to: order.user.email,
        subject: `Xác nhận thanh toán thành công - ${eventName}`,
        html: emailContent,
      };

      this.logger.log('Chuẩn bị gửi email...');
      
      // Gửi email
      const result = await this.transporter.sendMail(mailOptions);
      this.logger.log(`Email đã được gửi thành công đến ${order.user.email}`);
      this.logger.log(`Chi tiết kết quả gửi: ${JSON.stringify(result)}`);
      return result;
    } catch (error) {
      this.logger.error(`Lỗi khi gửi email: ${error.message}`);
      this.logger.error(`Chi tiết lỗi: ${JSON.stringify(error)}`);
      throw error;
    }
  }

  /**
   * Tạo nội dung HTML cho email xác nhận thanh toán
   */
  private createPaymentConfirmationEmailContent(order: OrderWithRelations, paymentInfo: PaymentInfo, eventInfo: EventInfo) {
    // Format số tiền thành VND
    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    // Tạo bảng thông tin vé với chỗ ngồi chi tiết
    const ticketItems = order.orderDetails?.map((item: OrderDetailWithRelations) => {
      // Lấy thông tin ghế từ seat đã được enriched bởi controller
      const seat = item.seat || {} as any; // Sử dụng type assertion để tránh lỗi TypeScript
      const zone = seat.zone || '';
      const row = seat.row || '';
      const seatNumber = seat.number || '';
      
      // Tạo hiển thị ghế ngồi
      let seatDisplay = '---';
      if (zone && row && seatNumber) {
        seatDisplay = `${zone} ${row}-${seatNumber}`;
      } else if (zone) {
        seatDisplay = zone;
      }
      
      // Lấy thông tin vé
      const ticketType = item.ticket?.type || 'Vé sự kiện';
      
      return `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #ddd;">${ticketType}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd;">${seatDisplay}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.quantity}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd;">${formatCurrency(Number(item.unitPrice))}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd;">${formatCurrency(Number(item.unitPrice) * Number(item.quantity))}</td>
      </tr>
    `;
    }).join('') || '';

    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Xác nhận thanh toán thành công</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background-color: #4CAF50;
          color: white;
          padding: 10px 20px;
          text-align: center;
          border-radius: 5px 5px 0 0;
        }
        .content {
          background-color: #f9f9f9;
          padding: 20px;
          border-radius: 0 0 5px 5px;
        }
        .footer {
          text-align: center;
          margin-top: 20px;
          font-size: 12px;
          color: #777;
        }
        .event-info {
          background-color: #fff;
          border-radius: 5px;
          padding: 15px;
          margin-bottom: 20px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .order-info {
          background-color: #fff;
          border-radius: 5px;
          padding: 15px;
          margin-bottom: 20px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 15px;
        }
        th {
          background-color: #f2f2f2;
          text-align: left;
          padding: 8px;
        }
        .total {
          font-weight: bold;
          text-align: right;
        }
        .contact {
          border-top: 1px solid #ddd;
          margin-top: 20px;
          padding-top: 15px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Xác nhận thanh toán thành công</h1>
        </div>
        <div class="content">
          <p>Xin chào ${order.user?.name || 'Quý khách'}!</p>
          <p>Cảm ơn bạn đã mua vé tại hệ thống của chúng tôi. Đơn hàng của bạn đã được <strong>thanh toán thành công</strong>.</p>
          
          <div class="event-info">
            <h2>Thông tin sự kiện</h2>
            <p><strong>Tên sự kiện:</strong> ${eventInfo.eventName}</p>
            <p><strong>Địa điểm:</strong> ${eventInfo.eventLocation}</p>
            <p><strong>Thời gian:</strong> ${eventInfo.eventDate}</p>
          </div>

          <div class="order-info">
            <h2>Chi tiết đơn hàng #${order.id}</h2>
            <p><strong>Mã đơn hàng:</strong> #${order.id}</p>
            <p><strong>Ngày thanh toán:</strong> ${new Date().toLocaleString('vi-VN')}</p>
            <p><strong>Phương thức thanh toán:</strong> ${paymentInfo.bankCode || 'VNPay'}</p>
            <p><strong>Mã giao dịch:</strong> ${paymentInfo.transactionNo || 'N/A'}</p>
            
            <h3>Thông tin vé</h3>
            <table>
              <thead>
                <tr>
                  <th>Loại vé</th>
                  <th>Vị trí ghế</th>
                  <th>Số lượng</th>
                  <th>Đơn giá</th>
                  <th>Thành tiền</th>
                </tr>
              </thead>
              <tbody>
                ${ticketItems}
                <tr class="total">
                  <td colspan="4" style="text-align: right; padding: 8px;"><strong>Tổng cộng:</strong></td>
                  <td style="padding: 8px;">${formatCurrency(Number(order.totalAmount))}</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div class="contact">
            <h3>Cần hỗ trợ?</h3>
            <p>Nếu bạn có bất kỳ câu hỏi nào, vui lòng liên hệ với chúng tôi:</p>
            <p>Email: nguyenvinh1242004@gmail.com</p>
            <p>Hotline: 0867265091</p>
            <p>Thời gian hỗ trợ: 8:00 - 22:00 (Thứ 2 - Chủ Nhật)</p>
          </div>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} Ticket System. Tất cả các quyền được bảo lưu.</p>
          <p>Địa chỉ công ty: Số xx, Đường yyyy, Quận/Huyện, Thành phố</p>
        </div>
      </div>
    </body>
    </html>
    `;
  }

  /**
   * Gửi email thông báo đơn hàng bị hủy do quá thời gian thanh toán
   * @param order Thông tin đơn hàng đã bị hủy
   */
  async sendPaymentExpiredEmail(order: OrderWithRelations) {
    try {
      if (!order.user?.email) {
        this.logger.error('Không thể gửi email: Email người dùng không tồn tại');
        return;
      }
      
      this.logger.log(`Bắt đầu gửi email thông báo hủy đơn hàng đến: ${order.user.email}`);
      
      // Lấy thông tin sự kiện từ các dữ liệu đã được enriched từ controller
      const eventName = this.extractEventName(order);
      
      // Tạo nội dung email
      const emailContent = this.createPaymentExpiredEmailContent(order, eventName);

      // Cấu hình email
      const mailOptions = {
        from: process.env.EMAIL_USER || 'Ticket System <your-email@gmail.com>',
        to: order.user.email,
        subject: `Thông báo: Đơn hàng #${order.id} đã bị hủy do quá thời gian thanh toán`,
        html: emailContent,
      };
      
      // Gửi email
      const result = await this.transporter.sendMail(mailOptions);
      this.logger.log(`Email thông báo hủy đơn hàng đã được gửi thành công đến ${order.user.email}`);
      return result;
    } catch (error) {
      this.logger.error(`Lỗi khi gửi email thông báo hủy đơn: ${error.message}`);
      throw error;
    }
  }

  /**
   * Helper method để trích xuất tên sự kiện từ đơn hàng
   */
  private extractEventName(order: OrderWithRelations): string {
    // Kiểm tra nếu có trường eventInfo (được thêm từ controller)
    if (order['eventInfo'] && order['eventInfo'].name) {
      return order['eventInfo'].name;
    }
    
    // Nếu không có, thử lấy từ orderDetails
    if (order.orderDetails && order.orderDetails.length > 0) {
      const orderDetail = order.orderDetails[0];
      if (orderDetail.ticket && orderDetail.ticket.event && orderDetail.ticket.event.eventName) {
        return orderDetail.ticket.event.eventName;
      }
    }
    
    // Trường hợp không tìm thấy, trả về giá trị mặc định
    return 'Sự kiện';
  }

  /**
   * Tạo nội dung HTML cho email thông báo hủy đơn hàng
   */
  private createPaymentExpiredEmailContent(order: OrderWithRelations, eventName: string) {
    // Format số tiền thành VND
    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Thông báo hủy đơn hàng</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background-color: #e74c3c;
          color: white;
          padding: 10px 20px;
          text-align: center;
          border-radius: 5px 5px 0 0;
        }
        .content {
          background-color: #f9f9f9;
          padding: 20px;
          border-radius: 0 0 5px 5px;
        }
        .footer {
          text-align: center;
          margin-top: 20px;
          font-size: 12px;
          color: #777;
        }
        .order-info {
          background-color: #fff;
          border-radius: 5px;
          padding: 15px;
          margin-bottom: 20px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .message-box {
          padding: 15px;
          margin-bottom: 20px;
          background-color: #fff3cd;
          border-left: 4px solid #ffc107;
        }
        .action-button {
          display: inline-block;
          background-color: #4CAF50;
          color: white;
          text-decoration: none;
          padding: 10px 20px;
          margin-top: 15px;
          border-radius: 5px;
          font-weight: bold;
        }
        .contact {
          border-top: 1px solid #ddd;
          margin-top: 20px;
          padding-top: 15px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Đơn hàng đã bị hủy</h1>
        </div>
        <div class="content">
          <p>Xin chào ${order.user?.name || 'Quý khách'}!</p>
          
          <div class="message-box">
            <p>Đơn hàng <strong>#${order.id}</strong> của bạn đã bị hủy vì đã quá thời gian chờ thanh toán (30 phút).</p>
            <p>Sự kiện: <strong>${eventName}</strong></p>
            <p>Tổng giá trị đơn hàng: <strong>${formatCurrency(Number(order.totalAmount))}</strong></p>
          </div>
          
          <p>Nếu bạn vẫn muốn mua vé cho sự kiện này, vui lòng tạo đơn hàng mới và hoàn tất thanh toán trong thời gian quy định.</p>
          
          <div class="order-info">
            <h3>Đơn hàng bị hủy</h3>
            <p><strong>Mã đơn hàng:</strong> #${order.id}</p>
            <p><strong>Ngày tạo đơn:</strong> ${new Date(order.orderDate).toLocaleString('vi-VN')}</p>
            <p><strong>Ngày hủy đơn:</strong> ${new Date().toLocaleString('vi-VN')}</p>
            <p><strong>Lý do:</strong> Quá thời gian thanh toán</p>
          </div>
          
          <a href="https://ticket.example.com/events" class="action-button">Xem các sự kiện khác</a>
          
          <div class="contact">
            <h3>Cần hỗ trợ?</h3>
            <p>Nếu bạn có bất kỳ câu hỏi nào, vui lòng liên hệ với chúng tôi:</p>
            <p>Email: nguyenvinh1242004@gmail.com</p>
            <p>Hotline: 0867265091</p>
            <p>Thời gian hỗ trợ: 8:00 - 22:00 (Thứ 2 - Chủ Nhật)</p>
          </div>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} Ticket System. Tất cả các quyền được bảo lưu.</p>
        </div>
      </div>
    </body>
    </html>
    `;
  }
} 