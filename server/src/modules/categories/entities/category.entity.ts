import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Budget } from '@budgets/entities';
import { Expense } from '@expenses/entities';

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description?: string;

  @ManyToOne(() => Budget, (b) => b.categories, { onDelete: 'CASCADE' })
  budget: Budget;

  @OneToMany(() => Expense, (e) => e.category, { cascade: true })
  expenses: Expense[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
