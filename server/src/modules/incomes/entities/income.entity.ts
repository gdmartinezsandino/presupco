import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Budget } from '../../budgets/entities/budget.entity';

@Entity('incomes')
export class Income {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'int' })
  amountCents: number;

  @Column({ nullable: true })
  notes?: string;

  @ManyToOne(() => Budget, (b) => b.incomes, { onDelete: 'CASCADE' })
  budget: Budget;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  date: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
