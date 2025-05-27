import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany, JoinColumn, Index, Unique } from 'typeorm';
import { Event } from './Events';
import { OrderDetail } from './order-detail.entity';
import { Seat } from './Seat';

@Entity('ticket')
@Unique('UQ_EVENT_TICKET_TYPE', ['eventId', 'type'])
export class Ticket {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  eventId: number;

  @ManyToOne(() => Event, (event) => event.tickets, {
    onDelete: 'CASCADE'
  })
  @JoinColumn({ name: 'eventId' })
  event: Event;

  @Index('IDX_EVENT_TICKET_TYPE')
  @Column()
  type: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column()
  quantity: number;

  @Column({ default: 'available' })
  status: string;

  @OneToMany(() => OrderDetail, (orderDetail) => orderDetail.ticket)
  orderDetails: OrderDetail[];

  @OneToMany(() => Seat, (seat) => seat.ticket)
  seats: Seat[];
}