import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToMany, AfterLoad } from 'typeorm';
import { Event } from './Events';
import { SeatStatus } from './seat-status.entity';

@Entity('event_detail')
export class EventDetail {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  eventId: number;

  @ManyToOne(() => Event, (event) => event.eventDetails, {
    onDelete: 'CASCADE'
  })
  @JoinColumn({ name: 'eventId' })
  event: Event;

  @Column({ nullable: true })
  detailImageUrl: string;

  @Column()
  startTime: Date;

  @Column()
  endTime: Date;

  @Column()
  location: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ default: 'active' })
  status: string;

  @Column({ nullable: true, default: 0 })
  capacity: number;

  @OneToMany(() => SeatStatus, (seatStatus) => seatStatus.eventDetail, {
    cascade: true,
  })
  seatStatuses: SeatStatus[];

  @AfterLoad()
  async calculateCapacity() {
    if (this.event?.tickets) {
      this.capacity = this.event.tickets.reduce((sum, ticket) => sum + ticket.quantity, 0);
    }
  }
}