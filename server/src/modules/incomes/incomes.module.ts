import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { IncomesService } from '@incomes/services';
import { IncomesController } from '@incomes/controllers';
import { Income } from '@incomes/entities';
import { SharedModule } from '@shared/shared.module';
import { BudgetsModule } from '@budgets/budgets.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Income]),
    BudgetsModule,
    ConfigModule,
    SharedModule,
  ],
  controllers: [IncomesController],
  providers: [IncomesService],
  exports: [IncomesService],
})
export class IncomesModule {}
