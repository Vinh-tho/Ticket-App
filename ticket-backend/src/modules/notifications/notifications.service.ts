import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from '../../entities/Notification';
import { Users } from '../../entities/Users';
import { PushNotificationService } from './push-notification.service';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
    @InjectRepository(Users)
    private usersRepository: Repository<Users>,
    private pushNotificationService: PushNotificationService,
  ) {}

  /**
   * Tạo thông báo mới cho người dùng
   */
  async createNotification(userId: number, message: string): Promise<Notification> {
    // Tạo thông báo mới
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }

    const notification = this.notificationRepository.create({
      user,
      message,
      isRead: false,
    });

    // Lưu thông báo vào database
    const savedNotification = await this.notificationRepository.save(notification);

    // Gửi push notification nếu người dùng có token
    if (user.expoPushToken) {
      await this.pushNotificationService.sendPushNotifications(
        [user.expoPushToken],
        'Thông báo mới',
        message,
        { 
          notificationId: savedNotification.id,
          type: 'NEW_NOTIFICATION' 
        }
      );
    }

    return savedNotification;
  }

  /**
   * Tạo nhiều thông báo cho nhiều người dùng
   */
  async createBulkNotifications(userIds: number[], message: string): Promise<Notification[]> {
    const users = await this.usersRepository.find({
      where: { id: { $in: userIds } as any },
    });

    if (!users.length) {
      throw new Error('No users found');
    }

    // Tạo thông báo cho mỗi người dùng
    const notifications = users.map(user => 
      this.notificationRepository.create({
        user,
        message,
        isRead: false,
      })
    );

    // Lưu các thông báo vào database
    const savedNotifications = await this.notificationRepository.save(notifications);

    // Gửi push notifications
    const userTokens = users
      .filter(user => user.expoPushToken)
      .map(user => user.expoPushToken);

    if (userTokens.length > 0) {
      await this.pushNotificationService.sendPushNotifications(
        userTokens,
        'Thông báo mới',
        message,
        { type: 'BULK_NOTIFICATION' }
      );
    }

    return savedNotifications;
  }

  /**
   * Lấy danh sách thông báo của người dùng
   */
  async getUserNotifications(userId: number): Promise<Notification[]> {
    return this.notificationRepository.find({
      where: { user: { id: userId } as any },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Đánh dấu thông báo đã đọc
   */
  async markAsRead(notificationId: number): Promise<Notification> {
    const notification = await this.notificationRepository.findOne({ 
      where: { id: notificationId }
    });
    
    if (!notification) {
      throw new Error(`Notification with ID ${notificationId} not found`);
    }

    notification.isRead = true;
    return this.notificationRepository.save(notification);
  }

  /**
   * Đánh dấu tất cả thông báo của người dùng đã đọc
   */
  async markAllAsRead(userId: number): Promise<void> {
    await this.notificationRepository
      .createQueryBuilder()
      .update(Notification)
      .set({ isRead: true })
      .where('user.id = :userId', { userId })
      .execute();
  }
} 