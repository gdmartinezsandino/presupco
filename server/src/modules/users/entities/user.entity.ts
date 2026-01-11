import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';

import { Budget } from '@budgets/entities';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  name: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  password: string;

  @Column({ type: 'bigint', nullable: true })
  birthday: Date;

  @Column('text', { array: true, default: [] })
  roles: string[];

  @Column({ type: 'bigint', nullable: true })
  lastLogin: Date;

  @Column({ nullable: true })
  avatar: string;

  @Column({ default: 'PENDING' })
  state: string;

  @OneToMany(() => Budget, (b) => b.user)
  budgets: Budget[];

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
