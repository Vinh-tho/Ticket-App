import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { Users } from './entities/Users';
import { Event } from './entities/Events';
import { EventDetail } from './entities/events-detail.entity';
import { Ticket } from './entities/ticket.entity';
import { Order } from './entities/order.entity';
import { OrderDetail } from './entities/order-detail.entity';
import { Payment } from './entities/Payment';
import { Notification } from './entities/Notification';
import { Seat } from './entities/Seat';
import { SeatStatus } from './entities/seat-status.entity';
import { Role } from './entities/Role';
import { Gift } from './entities/gift.entity';
import { EventGift } from './entities/event-gift.entity';
import { Organizer } from './entities/organizer.entity';
import { UserModule } from './modules/users/user.module';
import { EventsModule } from './modules/events/events.module';
import { AuthModule } from './modules/auth/auth.module';
import { TicketsModule } from './modules/ticket/tickets.module';
import { OrdersModule } from './modules/order/orders.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { SeatModule } from './modules/seat/seat.module';
import { SeatStatusModule } from './modules/seat-status/seat-status.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AdminModule } from './modules/admin/admin.module';
import { RolesModule } from './modules/roles/roles.module';
import { GiftsModule } from './modules/gifts/gifts.module';
import { EventGiftsModule } from './modules/event-gifts/event-gifts.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { OrganizerModule } from './modules/organizer/organizer.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    ScheduleModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306,
      username: process.env.DB_USERNAME || 'root',
      password: process.env.DB_PASSWORD || '12345',
      database: process.env.DB_DATABASE || 'ticket-box',
      entities: [
        Users,
        Event,
        EventDetail,
        Ticket,
        Order,
        OrderDetail,
        Payment,
        Notification,
        Seat,
        SeatStatus,
        Role,
        Gift,
        EventGift,
        Organizer,
      ],
      synchronize: true,
    }),
    UserModule,
    EventsModule,
    AuthModule,
    TicketsModule,
    OrdersModule,
    PaymentsModule,
    SeatModule,
    SeatStatusModule,
    AdminModule,
    RolesModule,
    GiftsModule,
    EventGiftsModule,
    NotificationsModule,
    OrganizerModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
