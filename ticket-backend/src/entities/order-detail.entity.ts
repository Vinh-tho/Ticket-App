import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Order } from './order.entity';
import { Ticket } from './ticket.entity';
import { Seat } from './Seat';

@Entity('order_detail')
export class OrderDetail {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Order, (order) => order.orderDetails)
  order: Order;

  @ManyToOne(() => Ticket, (ticket) => ticket.orderDetails)
  ticket: Ticket;

  @Column()
  quantity: number;

  @Column('decimal', { precision: 10, scale: 2 })
  unitPrice: number;

  @ManyToOne(() => Seat, { nullable: true })
  @JoinColumn({ name: 'seatId' })
  seat: Seat;
}