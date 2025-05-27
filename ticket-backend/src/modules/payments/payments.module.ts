import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { Order } from '../../entities/order.entity';
import { Payment } from '../../entities/Payment';
import { OrdersModule } from '../order/orders.module';
import { MailModule } from '../mail/mail.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, Payment]),
    OrdersModule,
    MailModule,
    NotificationsModule,
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService],
})
export class PaymentsModule {}
