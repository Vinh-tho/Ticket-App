import { IsNotEmpty, IsNumber, IsArray, IsOptional } from 'class-validator';

export class AddGiftToEventDto {
  @IsNotEmpty()
  @IsNumber()
  giftId: number;
}

export class AddGiftsToEventDto {
  @IsNotEmpty()
  @IsArray()
  giftIds: number[];
}

export class EventGiftDto {
  @IsNotEmpty()
  @IsNumber()
  eventId: number;

  @IsNotEmpty()
  @IsNumber()
  giftId: number;
} 