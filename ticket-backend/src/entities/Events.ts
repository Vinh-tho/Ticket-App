import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany, OneToOne, JoinColumn, CreateDateColumn, AfterLoad } from 'typeorm';
import { Users } from './Users';
import { EventDetail } from './events-detail.entity';
import { Ticket } from './ticket.entity';
import { EventGift } from './event-gift.entity';
import { Organizer } from './organizer.entity';

@Entity('events')
export class Event {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  eventName: string;

  @Column({ nullable: true })
  mainImageUrl: string;

  @Column({ nullable: true })
  organizerId: number;

  @Column({ default: 'upcoming' })
  status: 'upcoming' | 'active' | 'completed';

  @CreateDateColumn()
  createdAt: Date;

  @Column({ name: 'createdBy', nullable: true })
  createdById: number;

  @ManyToOne(() => Users, (user) => user.id)
  @JoinColumn({ name: 'createdBy' })
  createdBy: Users;

  @OneToOne(() => Organizer, (organizer) => organizer.event, {
    onDelete: 'CASCADE'
  })
  @JoinColumn({ name: 'organizerId' })
  organizer: Organizer;

  @OneToMany(() => EventDetail, (detail) => detail.event)
  eventDetails: EventDetail[];

  @OneToMany(() => Ticket, (ticket) => ticket.event, { cascade: true })
  tickets: Ticket[];

  @OneToMany(() => EventGift, eventGift => eventGift.event)
  eventGifts: EventGift[];

  @AfterLoad()
  updateStatus() {
    if (!this.eventDetails || this.eventDetails.length === 0) return;

    const now = new Date();
    const earliestDetail = this.eventDetails.reduce((earliest, detail) => 
      detail.startTime < earliest.startTime ? detail : earliest
    );
    const latestDetail = this.eventDetails.reduce((latest, detail) => 
      detail.endTime > latest.endTime ? detail : latest
    );

    if (now < earliestDetail.startTime) {
      this.status = 'upcoming';
    } else if (now >= earliestDetail.startTime && now <= latestDetail.endTime) {
      this.status = 'active';
    } else if (now > latestDetail.endTime) {
      this.status = 'completed';
    }
  }
}