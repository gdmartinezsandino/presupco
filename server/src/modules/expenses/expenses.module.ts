import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ExpensesService } from '@expenses/services';
import { ExpensesController } from '@expenses/controllers';
import { Expense } from '@expenses/entities';
import { SharedModule } from '@shared/shared.module';
import { BudgetsModule } from '@budgets/budgets.module';
import { CategoriesModule } from '@categories/categories.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Expense]),
    BudgetsModule,
    CategoriesModule,
    ConfigModule,
    SharedModule,
  ],
  controllers: [ExpensesController],
  providers: [ExpensesService],
  exports: [ExpensesService],
})
export class ExpensesModule {}
