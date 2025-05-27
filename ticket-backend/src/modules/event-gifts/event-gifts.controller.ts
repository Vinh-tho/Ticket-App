import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  ParseIntPipe,
  HttpException,
  HttpStatus,
  Logger,
  Put,
} from '@nestjs/common';
import { EventGiftsService } from './event-gifts.service';
import { AddGiftToEventDto, AddGiftsToEventDto } from '../../dto/event-gift.dto';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';

@Controller('events')
export class EventGiftsController {
  private readonly logger = new Logger(EventGiftsController.name);
  constructor(private readonly eventGiftsService: EventGiftsService) {}

  @Get(':eventId/gifts')
  async getGiftsByEvent(@Param('eventId', ParseIntPipe) eventId: number) {
    try {
      const gifts = await this.eventGiftsService.getGiftsByEvent(eventId);
      return {
        success: true,
        data: gifts,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Lỗi khi lấy danh sách quà tặng của sự kiện',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post(':eventId/gifts')
  async addGiftToEvent(
    @Param('eventId', ParseIntPipe) eventId: number,
    @Body() dto: AddGiftToEventDto,
  ) {
    try {
      const eventGift = await this.eventGiftsService.addGiftToEvent(eventId, dto);
      return {
        success: true,
        message: 'Thêm quà tặng vào sự kiện thành công',
        data: eventGift,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Lỗi khi thêm quà tặng vào sự kiện',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post(':eventId/gifts/batch')
  async addMultipleGiftsToEvent(
    @Param('eventId', ParseIntPipe) eventId: number,
    @Body() body: any,
  ) {
    try {
      this.logger.log(`Received request body: ${JSON.stringify(body)}`);
      
      // Kiểm tra và đảm bảo giftIds là một mảng
      let giftIds: number[] = [];
      if (Array.isArray(body.giftIds)) {
        giftIds = body.giftIds;
      } else if (typeof body.giftIds === 'string') {
        try {
          giftIds = JSON.parse(body.giftIds);
        } catch (e) {
          throw new HttpException('giftIds phải là một mảng số', HttpStatus.BAD_REQUEST);
        }
      } else {
        throw new HttpException('giftIds phải là một mảng số', HttpStatus.BAD_REQUEST);
      }

      const dto: AddGiftsToEventDto = { giftIds };
      const eventGifts = await this.eventGiftsService.addMultipleGiftsToEvent(eventId, dto);
      
      return {
        success: true,
        message: 'Cập nhật danh sách quà tặng cho sự kiện thành công',
        data: eventGifts,
      };
    } catch (error) {
      this.logger.error(`Error in addMultipleGiftsToEvent: ${error.message}`);
      throw new HttpException(
        error.message || 'Lỗi khi cập nhật danh sách quà tặng cho sự kiện',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':eventId/gifts/:giftId')
  async removeGiftFromEvent(
    @Param('eventId', ParseIntPipe) eventId: number,
    @Param('giftId', ParseIntPipe) giftId: number,
  ) {
    try {
      await this.eventGiftsService.removeGiftFromEvent(eventId, giftId);
      return {
        success: true,
        message: 'Xóa quà tặng khỏi sự kiện thành công',
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Lỗi khi xóa quà tặng khỏi sự kiện',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get('gifts/:giftId')
  async getEventsByGift(@Param('giftId', ParseIntPipe) giftId: number) {
    try {
      const events = await this.eventGiftsService.getEventsByGift(giftId);
      return {
        success: true,
        data: events,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Lỗi khi lấy danh sách sự kiện của quà tặng',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @UseGuards(JwtAuthGuard)
  @Put(':eventId/gifts/replace')
  async replaceEventGifts(
    @Param('eventId', ParseIntPipe) eventId: number,
    @Body() body: any,
  ) {
    try {
      this.logger.log(`Received replace request body: ${JSON.stringify(body)}`);
      
      // Kiểm tra và đảm bảo giftIds là một mảng
      let giftIds: number[] = [];
      if (Array.isArray(body.giftIds)) {
        giftIds = body.giftIds;
      } else if (typeof body.giftIds === 'string') {
        try {
          giftIds = JSON.parse(body.giftIds);
        } catch (e) {
          throw new HttpException('giftIds phải là một mảng số', HttpStatus.BAD_REQUEST);
        }
      } else {
        throw new HttpException('giftIds phải là một mảng số', HttpStatus.BAD_REQUEST);
      }

      const dto: AddGiftsToEventDto = { giftIds };
      const eventGifts = await this.eventGiftsService.replaceEventGifts(eventId, dto);
      
      return {
        success: true,
        message: 'Thay thế danh sách quà tặng cho sự kiện thành công',
        data: eventGifts,
      };
    } catch (error) {
      this.logger.error(`Error in replaceEventGifts: ${error.message}`);
      throw new HttpException(
        error.message || 'Lỗi khi thay thế danh sách quà tặng cho sự kiện',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
} 