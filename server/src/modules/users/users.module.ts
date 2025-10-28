import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UsersService } from '@users/services';
import { UsersController } from '@users/controllers';
import { User } from '@users/entities';
import { SharedModule } from '@shared/shared.module';
import { BudgetsModule } from '@budgets/budgets.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    forwardRef(() => BudgetsModule),
    JwtModule.register({}),
    ConfigModule,
    SharedModule,
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
