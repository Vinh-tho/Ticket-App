import { Entity, Column, PrimaryGeneratedColumn, OneToMany, CreateDateColumn, UpdateDateColumn, ManyToMany, JoinTable } from 'typeorm';
import { Order } from './order.entity';
import { Notification } from './Notification';
import { Role } from './Role';

@Entity('users')
export class Users {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  avatar: string;

  @Column({ nullable: true })
  expoPushToken: string;

  @ManyToMany(() => Role, role => role.users)
  @JoinTable({
    name: 'user_roles',
    joinColumn: {
      name: 'user_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'role_id',
      referencedColumnName: 'id',
    },
  })
  roles: Role[];

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Order, (order) => order.user)
  orders: Order[];

  @OneToMany(() => Notification, (notification) => notification.user)
  notifications: Notification[];
}