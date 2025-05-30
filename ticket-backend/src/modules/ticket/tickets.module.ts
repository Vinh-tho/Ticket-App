import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TicketsController } from './tickets.controller';
import { TicketsService } from './tickets.service';
import { Ticket } from '../../entities/ticket.entity';
import { Event } from '../../entities/Events';
import { Seat } from '../../entities/Seat';
import { SeatStatus } from '../../entities/seat-status.entity';
import { EventDetail } from '../../entities/events-detail.entity';
import { OrderDetail } from '../../entities/order-detail.entity';
import { Order } from '../../entities/order.entity';

@Module({
  imports: [TypeOrmModule.forFeature([
    Ticket, Event, Seat, SeatStatus, EventDetail, OrderDetail, Order
  ])],
  controllers: [TicketsController],
  providers: [TicketsService],
  exports: [TicketsService],
})
export class TicketsModule {}
