import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CategoriesService } from '@categories/services';
import { CategoriesController } from '@categories/controllers';
import { Category } from '@categories/entities';
import { SharedModule } from '@shared/shared.module';
import { BudgetsModule } from '@budgets/budgets.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Category]),
    BudgetsModule,
    ConfigModule,
    SharedModule,
  ],
  controllers: [CategoriesController],
  providers: [CategoriesService],
  exports: [CategoriesService],
})
export class CategoriesModule {}
