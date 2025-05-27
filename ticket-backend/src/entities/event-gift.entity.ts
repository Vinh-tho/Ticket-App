import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Event } from './Events';
import { Gift } from './gift.entity';

@Entity('event_gifts')
export class EventGift {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Event, event => event.eventGifts)
  event: Event;

  @Column()
  eventId: number;

  @ManyToOne(() => Gift, gift => gift.eventGifts)
  gift: Gift;

  @Column()
  giftId: number;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
} 