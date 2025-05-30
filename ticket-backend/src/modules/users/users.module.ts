import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { Users } from '../../entities/Users';
import { Ticket } from '../../entities/ticket.entity';
import { Event } from '../../entities/Events';

@Module({
  imports: [
    TypeOrmModule.forFeature([Users, Ticket, Event]),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {} 