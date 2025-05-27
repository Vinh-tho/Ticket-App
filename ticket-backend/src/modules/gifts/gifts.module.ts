import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Gift } from '../../entities/gift.entity';
import { GiftsController } from './gifts.controller';
import { GiftsService } from './gifts.service';

@Module({
  imports: [TypeOrmModule.forFeature([Gift])],
  controllers: [GiftsController],
  providers: [GiftsService],
  exports: [GiftsService],
})
export class GiftsModule {} 