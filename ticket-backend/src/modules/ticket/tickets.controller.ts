import { Controller, Get, Post, Body, Param, Delete, ParseIntPipe, NotFoundException, Put, UseGuards, Request } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { Ticket } from '../../entities/ticket.entity';
import { CreateTicketDto } from '../../dto/create-ticket.dto';
import { TicketStats } from './tickets.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';

@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Post()
  create(@Body() createTicketDto: CreateTicketDto): Promise<Ticket> {
    return this.ticketsService.create(createTicketDto);
  }

  @Get()
  findAll(): Promise<Ticket[]> {
    return this.ticketsService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get('of-my-events')
  async getTicketsOfMyEvents(@Request() req) {
    console.log('Request user:', req.user);
    const userId = parseInt(req.user.userId, 10);
    if (!userId || isNaN(userId)) {
      throw new Error('Invalid user ID from token');
    }
    console.log('User ID from token:', userId);
    return this.ticketsService.getTicketsOfMyEvents(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('my-tickets-stats')
  async getMyTicketsStats(@Request() req) {
    const userId = Number(req.user.userId);
    return this.ticketsService.getStatsOfMyEvents(userId);
  }

  @Get('stats')
  async getStats(): Promise<TicketStats> {
    return this.ticketsService.getTicketStats();
  }

  @Put('sync-quantity/:eventId')
  updateTicketQuantityBySeatCount(@Param('eventId') eventId: string): Promise<{ message: string }> {
    return this.ticketsService.updateTicketQuantityBySeatCount(+eventId)
      .then(() => ({ message: 'Cập nhật số lượng vé thành công' }));
  }

  @Put('sync-status/:eventDetailId')
  updateTicketStatusByAvailableSeats(@Param('eventDetailId') eventDetailId: string): Promise<{ message: string }> {
    return this.ticketsService.updateTicketStatusByAvailableSeats(+eventDetailId)
      .then(() => ({ message: 'Cập nhật trạng thái vé thành công' }));
  }

  @Put('sync-all/:eventId')
  checkAndUpdateAllTicketsStatus(@Param('eventId') eventId: string): Promise<{ message: string }> {
    return this.ticketsService.checkAndUpdateAllTicketsStatus(+eventId)
      .then(() => ({ message: 'Đồng bộ hóa thông tin vé thành công' }));
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    try {
      const ticket = await this.ticketsService.findOne(id);
      return {
        success: true,
        data: ticket
      };
    } catch (error) {
      throw new NotFoundException(`Không tìm thấy vé với id ${id}`);
    }
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.ticketsService.remove(id);
  }
}
