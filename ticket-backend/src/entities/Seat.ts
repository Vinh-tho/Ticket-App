import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany } from 'typeorm';
import { Ticket } from './ticket.entity';
import { Event } from './Events';
import { SeatStatus } from './seat-status.entity';
import { OrderDetail } from './order-detail.entity';

@Entity('seat')
export class Seat {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Event, (event) => event.id)
  event: Event;

  @ManyToOne(() => Ticket, (ticket) => ticket.id)
  ticket: Ticket;

  @Column()
  zone: string; // Khu vực (VIP, VVIP, GA...)

  @Column()
  row: string; // Hàng ghế (A, B, C...)

  @Column()
  number: number; // Số ghế

  @OneToMany(() => SeatStatus, (seatStatus) => seatStatus.seat, {
    cascade: true,
  })
  seatStatuses: SeatStatus[];

  @OneToMany(() => OrderDetail, (orderDetail) => orderDetail.seat)
  orderDetails: OrderDetail[];
}