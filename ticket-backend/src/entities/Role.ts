import { Entity, Column, PrimaryGeneratedColumn, ManyToMany, JoinTable } from 'typeorm';
import { Users } from './Users';

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  description: string;

  @ManyToMany(() => Users, user => user.roles)
  users: Users[];
} 