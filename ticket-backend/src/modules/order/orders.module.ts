import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { Order } from '../../entities/order.entity';
import { OrderDetail } from '../../entities/order-detail.entity';
import { Users } from '../../entities/Users';
import { Ticket } from '../../entities/ticket.entity';
import { EventDetail } from '../../entities/events-detail.entity';
import { Seat } from '../../entities/Seat';
import { SeatStatusModule } from '../seat-status/seat-status.module';
import { OrdersSchedulerService } from './orders-scheduler.service';
import { Payment } from '../../entities/Payment';
import { MailModule } from '../mail/mail.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderDetail, Users, Ticket, EventDetail, Seat, Payment]),
    SeatStatusModule,
    MailModule,
    NotificationsModule,
  ],
  controllers: [OrdersController],
  providers: [OrdersService, OrdersSchedulerService],
  exports: [OrdersService],
})
export class OrdersModule {}
