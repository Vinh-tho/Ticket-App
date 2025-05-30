import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany } from 'typeorm';
import { Users } from './Users';
import { OrderDetail } from './order-detail.entity';
import { Payment } from './Payment';
import { Gift } from './gift.entity';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Users, (user) => user.orders)
  user: Users;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  orderDate: Date;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
  
  @Column('decimal', { precision: 10, scale: 2 })
  totalAmount: number;

  @Column({ default: 'pending' })
  status: string;

  @OneToMany(() => OrderDetail, (orderDetail) => orderDetail.order)
  orderDetails: OrderDetail[];

  @OneToMany(() => Payment, (payment) => payment.order)
  payments: Payment[];

  @Column({ nullable: true })
  eventDetailId: number;
  
  @ManyToOne(() => Gift, (gift) => gift.orders, { nullable: true })
  gift: Gift;
  
  @Column({ nullable: true })
  giftId: number;
  
  @Column({ type: 'enum', enum: ['Chưa nhắc', 'Đã nhắc'], default: 'Chưa nhắc' })
  reminderSent: string;
}