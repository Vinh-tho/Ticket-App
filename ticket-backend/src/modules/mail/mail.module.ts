import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { MailController } from './mail.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from '../../entities/order.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Order])],
  controllers: [MailController],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {} 