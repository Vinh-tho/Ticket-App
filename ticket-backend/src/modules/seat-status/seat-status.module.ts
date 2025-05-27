import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeatStatus } from '../../entities/seat-status.entity';
import { SeatStatusService } from './seat-status.service';
import { SeatStatusController } from './seat-status.controller';
import { EventDetailModule } from '../event-detail/event-detail.module';
import { TicketsModule } from '../ticket/tickets.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([SeatStatus]),
    forwardRef(() => TicketsModule),
  ],
  providers: [SeatStatusService],
  controllers: [SeatStatusController],
  exports: [SeatStatusService],
})
export class SeatStatusModule {} 