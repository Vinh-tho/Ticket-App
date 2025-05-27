import { IsString, IsOptional, IsNumber, IsArray } from 'class-validator';

export class CreateNotificationDto {
  @IsNumber()
  userId: number;

  @IsString()
  message: string;
}

export class CreateBulkNotificationsDto {
  @IsArray()
  userIds: number[];

  @IsString()
  message: string;
}

export class UpdatePushTokenDto {
  @IsString()
  expoPushToken: string;
} 