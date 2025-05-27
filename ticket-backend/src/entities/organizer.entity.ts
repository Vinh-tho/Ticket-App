import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToOne } from 'typeorm';
import { Event } from './Events'; // Import Event entity

@Entity('organizers')
export class Organizer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  logo_url: string;

  @Column()
  legal_representative: string;

  @Column('text')
  address: string;

  @Column()
  hotline: string;

  @Column()
  email: string;

  @Column()
  business_license: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToOne(() => Event, (event) => event.organizer, {
    onDelete: 'CASCADE'
  })
  event: Event; // Change property name from events to event
} 