import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Expose } from 'class-transformer';

import { User } from '@users/entities';
import { Category } from '@categories/entities';
import { Income } from '@incomes/entities';

@Entity('budgets')
export class Budget {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @ManyToOne(() => User, (u) => u.budgets, { onDelete: 'CASCADE' })
  user: User;

  @OneToMany(() => Category, (c) => c.budget, { cascade: true })
  categories: Category[];

  @OneToMany(() => Income, (i) => i.budget, { cascade: true })
  incomes: Income[];

  @Column({ type: 'int', default: 0 })
  targetAmountCents: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Expose()
  get balance(): number {
    const totalIncome =
      this.incomes?.reduce((s, i) => s + i.amountCents, 0) ?? 0;
    const totalExpense =
      this.categories?.reduce(
        (s, c) => s + (c.expenses?.reduce((x, e) => x + e.amountCents, 0) ?? 0),
        0,
      ) ?? 0;
    return totalIncome - totalExpense;
  }
}
