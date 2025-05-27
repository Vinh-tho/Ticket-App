import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Users } from '../../entities/Users';
import { Event } from '../../entities/Events';
import { Order } from '../../entities/order.entity';
import { OrderDetail } from '../../entities/order-detail.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Users, Event, Order, OrderDetail])
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
