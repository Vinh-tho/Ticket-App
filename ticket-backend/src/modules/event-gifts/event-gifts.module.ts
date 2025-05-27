import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventGift } from '../../entities/event-gift.entity';
import { Event } from '../../entities/Events';
import { Gift } from '../../entities/gift.entity';
import { EventGiftsController } from './event-gifts.controller';
import { EventGiftsService } from './event-gifts.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([EventGift, Event, Gift]),
  ],
  controllers: [EventGiftsController],
  providers: [EventGiftsService],
  exports: [EventGiftsService],
})
export class EventGiftsModule {} 