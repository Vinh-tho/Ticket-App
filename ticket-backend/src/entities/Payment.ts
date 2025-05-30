import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Order } from './order.entity';

@Entity('payment')
export class Payment {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Order, (order) => order.payments)
  order: Order;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @Column()
  paymentMethod: string;

  @Column({ default: 'pending' })
  paymentStatus: string;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  paymentDate: Date;
}