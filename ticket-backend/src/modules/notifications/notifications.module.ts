import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from '../../entities/Notification';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { PushNotificationService } from './push-notification.service';
import { Users } from '../../entities/Users';
import { ScheduledNotificationsService } from './scheduled-notifications.service';
import { Order } from '../../entities/order.entity';
import { EventDetail } from '../../entities/events-detail.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Notification, Users, Order, EventDetail])],
  controllers: [NotificationsController],
  providers: [NotificationsService, PushNotificationService, ScheduledNotificationsService],
  exports: [NotificationsService, PushNotificationService, ScheduledNotificationsService],
})
export class NotificationsModule {} 