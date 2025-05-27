import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { Event } from '../../entities/Events';
import { Ticket } from '../../entities/ticket.entity';
import { Seat } from '../../entities/Seat';
import { SeatStatus } from '../../entities/seat-status.entity';
import { EventDetail } from '../../entities/events-detail.entity';
import { Gift } from '../../entities/gift.entity';
import { EventGift } from '../../entities/event-gift.entity';
import { OrderDetail } from '../../entities/order-detail.entity';
import { Organizer } from '../../entities/organizer.entity';
import { Order } from '../../entities/order.entity';
import { Payment } from '../../entities/Payment';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Event,
      EventDetail,
      Ticket,
      Seat,
      SeatStatus,
      Gift,
      EventGift,
      OrderDetail,
      Order,
      Payment,
      Organizer
    ])
  ],
  providers: [EventsService],
  controllers: [EventsController],
  exports: [EventsService]
})
export class EventsModule {}
