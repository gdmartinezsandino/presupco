import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Category } from '@categories/entities';
import { Budget } from '@budgets/entities';

@Entity('expenses')
export class Expense {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'int' })
  amountCents: number;

  @Column({ nullable: true })
  notes?: string;

  @ManyToOne(() => Category, (c) => c.expenses, { onDelete: 'SET NULL' })
  category: Category;

  @ManyToOne(() => Budget, { onDelete: 'CASCADE' })
  budget: Budget;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  date: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
