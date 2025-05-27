import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
  ParseIntPipe,
  HttpException,
  HttpStatus,
  UseGuards,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from '../../dto/create-order.dto';
import { OrderStatus } from '../../common/enums/order-status.enum';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  async create(@Body() createOrderDto: CreateOrderDto) {
    try {
      // Log the received DTO for debugging
      console.log('Received CreateOrderDto:', JSON.stringify(createOrderDto, null, 2));

      const order = await this.ordersService.create(createOrderDto);
      return {
        success: true,
        message: 'Tạo đơn hàng thành công',
        data: order,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Lỗi tạo đơn hàng',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('my')
  async getMyOrders(@Req() req: Request) {
    try {
      // Log để debug user trong req
      console.log('req.user:', req.user);
      const user = req.user as any;
      const userId = user?.userId || user?.id;
      if (!userId) {
        throw new HttpException(
          'Không xác định được user',
          HttpStatus.UNAUTHORIZED,
        );
      }
      const orders = await this.ordersService.findByUserId(userId);
      return {
        success: true,
        data: orders,
      };
    } catch (error) {
      console.error('Lỗi getMyOrders:', error);
      throw new HttpException(
        error.message || 'Lỗi lấy danh sách vé',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Patch(':id/pay')
  async markAsPaid(@Param('id', ParseIntPipe) id: number) {
    try {
      const updatedOrder = await this.ordersService.updateOrderStatus(
        id,
        OrderStatus.PAID,
      );
      // Nếu đơn hàng đã paid thì trả về message phù hợp
      if (updatedOrder.status === OrderStatus.PAID) {
        return {
          success: true,
          message: 'Đơn hàng đã thanh toán',
          data: updatedOrder,
        };
      }
      return {
        success: true,
        message: 'Cập nhật trạng thái thanh toán thành công',
        data: updatedOrder,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Lỗi cập nhật trạng thái thanh toán',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get('sync-seat-status')
  async syncSeatStatus() {
    try {
      const result = await this.ordersService.syncAllSeatStatuses();
      return {
        success: true,
        message: `Đồng bộ thành công: ${result.total} ghế đã được cập nhật (${result.updatedPaid} SOLD, ${result.updatedCancelled} available)`,
        data: result
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Lỗi khi đồng bộ trạng thái ghế',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getOrderById(@Param('id', ParseIntPipe) id: number) {
    try {
      const order = await this.ordersService.findOne(id);
      return {
        success: true,
        data: order,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Không tìm thấy đơn hàng',
        HttpStatus.NOT_FOUND,
      );
    }
  }
}
