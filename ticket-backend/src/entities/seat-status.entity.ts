import { Entity, PrimaryGeneratedColumn, ManyToOne, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Seat } from './Seat';
import { EventDetail } from './events-detail.entity';
import { Users } from './Users';

@Entity('seat_status')
export class SeatStatus {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Seat, (seat) => seat.seatStatuses)
  seat: Seat;

  @ManyToOne(() => EventDetail, (eventDetail) => eventDetail.seatStatuses)
  eventDetail: EventDetail;

  @Column({ default: 'available' })
  status: string; // available, held, booked, SOLD

  @ManyToOne(() => Users, (user) => user.id, { nullable: true })
  user: Users;

  @Column({ type: 'datetime', nullable: true })
  holdUntil: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 