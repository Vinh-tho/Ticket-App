import { Controller, Get, NotFoundException, Param, Post, Body, Request, UseGuards, Patch, Delete } from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto, UpdateEventDto } from '../../dto/event.dto';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get('gifts')
  @UseGuards(JwtAuthGuard)
  findAllGifts() {
    return this.eventsService.findAllGifts();
  }

  // Lấy danh sách sự kiện
  @Get()
  findAll() {
    return this.eventsService.findAll();
  }

  // Lấy thống kê sự kiện của admin hiện tại
  @Get('my-stats')
  @UseGuards(JwtAuthGuard)
  async getMyStats(@Request() req) {
    const userId = req.user.userId;
    return this.eventsService.getStatsByCreator(userId);
  }

  // Lấy danh sách sự kiện của admin hiện tại
  @Get('my-events')
  @UseGuards(JwtAuthGuard)
  getMyEvents(@Request() req) {
    const userId = req.user.userId;
    return this.eventsService.findByCreator(userId);
  }

  // Lấy chi tiết sự kiện theo ID
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.eventsService.findOne(+id);
  }

  // Tạo sự kiện mới
  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() createEventDto: CreateEventDto, @Request() req) {
    if (!req.user || !req.user.userId) {
      throw new NotFoundException('User not found');
    }
    return this.eventsService.create(createEventDto, req.user.userId);
  }

  // Cập nhật sự kiện
  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async update(@Param('id') id: string, @Body() updateEventDto: UpdateEventDto, @Request() req) {
    if (!req.user || !req.user.userId) {
      throw new NotFoundException('User not found');
    }
    return this.eventsService.update(+id, updateEventDto, req.user.userId);
  }

  // Trả trạng thái về tự động
  @Patch(':id/auto-status')
  @UseGuards(JwtAuthGuard)
  async resetStatusToAuto(@Param('id') id: string, @Request() req) {
    if (!req.user || !req.user.userId) {
      throw new NotFoundException('User not found');
    }
    return this.eventsService.resetStatusToAuto(+id, req.user.userId);
  }

  // Xóa sự kiện và toàn bộ dữ liệu liên quan
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(@Param('id') id: string) {
    await this.eventsService.deleteEvent(+id);
    return { message: 'Event deleted' };
  }
}
