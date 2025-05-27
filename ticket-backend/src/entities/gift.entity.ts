import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Order } from './order.entity';
import { EventGift } from './event-gift.entity';

@Entity('gifts')
export class Gift {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column()
  imageUrl: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @OneToMany(() => Order, (order) => order.gift)
  orders: Order[];
  
  @OneToMany(() => EventGift, eventGift => eventGift.gift)
  eventGifts: EventGift[];
} 