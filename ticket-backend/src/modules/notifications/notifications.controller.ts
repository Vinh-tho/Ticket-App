import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param, 
  UseGuards, 
  Request, 
  Patch,
  NotFoundException 
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { Notification } from '../../entities/Notification';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { CreateNotificationDto, CreateBulkNotificationsDto, UpdatePushTokenDto } from './notification.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Users } from '../../entities/Users';
import { ScheduledNotificationsService } from './scheduled-notifications.service';

@Controller('notifications')
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
    @InjectRepository(Users)
    private usersRepository: Repository<Users>,
    private readonly scheduledNotificationsService: ScheduledNotificationsService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async getUserNotifications(@Request() req): Promise<Notification[]> {
    return this.notificationsService.getUserNotifications(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('mark-read/:id')
  async markAsRead(@Param('id') id: string): Promise<Notification> {
    return this.notificationsService.markAsRead(+id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('mark-all-read')
  async markAllAsRead(@Request() req): Promise<void> {
    return this.notificationsService.markAllAsRead(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('token')
  async updatePushToken(
    @Request() req,
    @Body() updatePushTokenDto: UpdatePushTokenDto,
  ): Promise<{ success: boolean }> {
    const user = await this.usersRepository.findOne({ where: { id: req.user.userId } });
    
    if (!user) {
      throw new NotFoundException('User not found');
    }
    
    user.expoPushToken = updatePushTokenDto.expoPushToken;
    await this.usersRepository.save(user);
    
    return { success: true };
  }

  // API này chỉ dành cho Admin hoặc hệ thống nội bộ gọi để tạo thông báo
  @Post()
  @UseGuards(JwtAuthGuard)
  async createNotification(
    @Body() createNotificationDto: CreateNotificationDto,
  ): Promise<Notification> {
    return this.notificationsService.createNotification(
      createNotificationDto.userId,
      createNotificationDto.message,
    );
  }

  // API này chỉ dành cho Admin hoặc hệ thống nội bộ gọi để tạo thông báo hàng loạt
  @Post('bulk')
  @UseGuards(JwtAuthGuard)
  async createBulkNotifications(
    @Body() createBulkNotificationsDto: CreateBulkNotificationsDto,
  ): Promise<Notification[]> {
    return this.notificationsService.createBulkNotifications(
      createBulkNotificationsDto.userIds,
      createBulkNotificationsDto.message,
    );
  }

  @Post('test-pending-orders')
  async testPendingOrdersNotification() {
    await this.scheduledNotificationsService.checkPendingOrders();
    return { success: true, message: 'Triggered pending orders notifications' };
  }

  @Post('test-upcoming-events')  
  async testUpcomingEventsNotification() {
    await this.scheduledNotificationsService.checkUpcomingEvents();
    return { success: true, message: 'Triggered upcoming events notifications' };
  }

  @Post('test-user-notification')
  async testUserNotification(@Body() body: { userId: number, message: string }) {
    const notification = await this.notificationsService.createNotification(
      body.userId,
      body.message
    );
    return { success: true, notification };
  }
} 