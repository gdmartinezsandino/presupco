import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { BudgetsService } from '@budgets/services';
import { BudgetsController } from '@budgets/controllers';
import { Budget } from '@budgets/entities';
import { SharedModule } from '@shared/shared.module';
import { UsersModule } from '@users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Budget]),
    forwardRef(() => UsersModule),
    ConfigModule,
    SharedModule,
  ],
  controllers: [BudgetsController],
  providers: [BudgetsService],
  exports: [BudgetsService],
})
export class BudgetsModule {}
