import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Budget } from '@budgets/entities/budget.entity';
import { Income } from '@incomes/entities/income.entity';
import { Expense } from '@expenses/entities/expense.entity';
import { Category } from '@categories/entities/category.entity';
import { ReportsService } from '@reports/services/reports.service';
import { ReportsController } from '@reports/controllers/reports.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Budget, Income, Expense, Category])],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}
