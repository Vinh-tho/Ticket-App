import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  BadRequestException,
  HttpException,
  HttpStatus,
  Req,
  Logger,
} from '@nestjs/common';
import { Request } from 'express';
import { PaymentsService } from './payments.service';

interface VNPayCreateDTO {
  orderId: number;
  amount: number;
  bankCode?: string;
}

@Controller('payments')
export class PaymentsController {
  private readonly logger = new Logger(PaymentsController.name);

  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('vnpay/create')
  async createPayment(@Body() body: VNPayCreateDTO, @Req() req: Request) {
    try {
      // Log dữ liệu nhận từ FE
      console.log('Body nhận từ FE:', body);
      const { orderId, amount, bankCode } = body;
      // Ép kiểu amount về number để tránh lỗi kiểu dữ liệu
      const safeAmount = Number(amount);
      if (!orderId || !safeAmount) {
        throw new BadRequestException('orderId và amount là bắt buộc');
      }
      const ipAddr =
        req.headers['x-forwarded-for']?.toString() ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        '127.0.0.1';
      this.logger.log(
        `Creating payment URL for order ${orderId} with amount ${safeAmount}`,
      );
      const url = await this.paymentsService.createPaymentUrl(
        orderId,
        safeAmount,
        ipAddr,
        bankCode, // thêm dòng này
      );
      return {
        success: true,
        paymentUrl: url,
        orderInfo: {
          orderId,
          amount: safeAmount,
          ipAddr,
          bankCode: bankCode || 'Not specified',
        },
      };
    } catch (error) {
      this.logger.error(`Error creating payment URL: ${error.message}`);
      throw new HttpException(
        error.message || 'Lỗi tạo URL thanh toán',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get('vnpay/callback')
  async handleVNPayCallback(
    @Query() query: Record<string, string>,
    @Req() req: Request,
  ) {
    this.logger.log('VNPay callback query (raw):', JSON.stringify(req.query));
    this.logger.log('VNPay callback query (parsed):', JSON.stringify(query));
    // Kiểm tra các trường bắt buộc
    if (!query.vnp_TxnRef) {
      this.logger.error('Thiếu vnp_TxnRef trong callback');
      throw new BadRequestException('Thiếu mã đơn hàng (vnp_TxnRef)');
    }
    if (!query.vnp_SecureHash) {
      this.logger.error('Thiếu vnp_SecureHash trong callback');
      throw new BadRequestException('Thiếu mã xác thực (vnp_SecureHash)');
    }
    if (!query.vnp_Amount) {
      this.logger.error('Thiếu vnp_Amount trong callback');
      throw new BadRequestException('Thiếu số tiền thanh toán (vnp_Amount)');
    }
    if (!query.vnp_ResponseCode) {
      this.logger.error('Thiếu vnp_ResponseCode trong callback');
      throw new BadRequestException('Thiếu mã phản hồi (vnp_ResponseCode)');
    }
    try {
      this.logger.log(`Received VNPay callback for order ${query.vnp_TxnRef}`);
      const result = await this.paymentsService.handleVNPayCallback(query);
      return {
        code: result.success ? '00' : '99',
        message: result.message,
        data: {
          ...result.data,
          responseCode: query.vnp_ResponseCode,
          transactionDate: query.vnp_PayDate,
        },
      };
    } catch (error) {
      this.logger.error(`Error handling callback: ${error.message}`);
      throw new HttpException(
        error.message || 'Xử lý callback thất bại',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get('vnpay/ipn')
  async handleVNPayIPN(@Query() query: Record<string, string>) {
    this.logger.log('VNPay IPN query:', JSON.stringify(query));
    // Kiểm tra các trường bắt buộc
    if (!query.vnp_TxnRef) {
      this.logger.error('Thiếu vnp_TxnRef trong IPN');
      return { RspCode: '01', Message: 'Thiếu mã đơn hàng (vnp_TxnRef)' };
    }
    if (!query.vnp_SecureHash) {
      this.logger.error('Thiếu vnp_SecureHash trong IPN');
      return { RspCode: '97', Message: 'Thiếu mã xác thực (vnp_SecureHash)' };
    }
    if (!query.vnp_Amount) {
      this.logger.error('Thiếu vnp_Amount trong IPN');
      return {
        RspCode: '04',
        Message: 'Thiếu số tiền thanh toán (vnp_Amount)',
      };
    }
    if (!query.vnp_ResponseCode) {
      this.logger.error('Thiếu vnp_ResponseCode trong IPN');
      return { RspCode: '99', Message: 'Thiếu mã phản hồi (vnp_ResponseCode)' };
    }
    try {
      const result = await this.paymentsService.handleVNPayCallback(query);
      return {
        RspCode: result.success ? '00' : '99',
        Message: result.success ? 'Confirm Success' : 'Confirm Fail',
      };
    } catch (error) {
      this.logger.error(`Error handling IPN: ${error.message}`);
      return {
        RspCode: '99',
        Message: error.message || 'Unknow error',
      };
    }
  }
}
