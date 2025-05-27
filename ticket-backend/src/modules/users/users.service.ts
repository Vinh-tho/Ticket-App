import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Users } from '../../entities/Users';
import { Ticket } from '../../entities/ticket.entity';
import { Event } from '../../entities/Events';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Users)
    private usersRepository: Repository<Users>,
    @InjectRepository(Ticket)
    private ticketsRepository: Repository<Ticket>,
    @InjectRepository(Event)
    private eventsRepository: Repository<Event>,
  ) {}

  async getBuyersOfMyEvents(adminId: number): Promise<Users[]> {
    // Lấy tất cả sự kiện của admin
    const events = await this.eventsRepository.find({
      where: { createdBy: { id: adminId } }
    });

    const eventIds = events.map(event => event.id);

    // Lấy tất cả order details của các vé trong các sự kiện này
    const tickets = await this.ticketsRepository.find({
      where: { 
        event: { id: In(eventIds) }
      },
      relations: ['orderDetails', 'orderDetails.order', 'orderDetails.order.user']
    });

    // Lọc ra danh sách user unique
    const uniqueUsers = new Map<number, Users>();
    tickets.forEach(ticket => {
      ticket.orderDetails?.forEach(orderDetail => {
        if (orderDetail.order?.user) {
          uniqueUsers.set(orderDetail.order.user.id, orderDetail.order.user);
        }
      });
    });

    return Array.from(uniqueUsers.values());
  }
} 