import { join } from 'path';
import {
  Module,
  NestModule,
  MiddlewareConsumer,
  RequestMethod,
} from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';

import { configuration, validationSchema } from '@config/configuration';
import { AuthGuard, RolesGuard } from '@common/guards';
import { LoggerInterceptor } from '@common/interceptors';
import { LoggerMiddleware } from '@common/middlewares';
import { LoggerService, RedisService } from '@shared/services';
import { HealthModule } from '@health/health.module';
import { AuthModule } from '@auth/auth.module';
import { UsersModule } from '@users/users.module';
import { BudgetsModule } from '@budgets/budgets.module';
import { ExpensesModule } from '@expenses/expenses.module';
import { IncomesModule } from '@incomes/incomes.module';
import { CategoriesModule } from '@categories/categories.module';
import { ReportsModule } from '@reports/reports.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `${process.cwd()}/config/env/${process.env.NODE_ENV}.env`,
      load: [configuration],
      validationSchema,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (serviceConfig: ConfigService) => ({
        type: 'postgres' as const,
        host: serviceConfig.get<string>('DB_HOST'),
        port: serviceConfig.get<number>('DB_PORT'),
        username: serviceConfig.get<string>('DB_USERNAME'),
        password: serviceConfig.get<string>('DB_PASSWORD'),
        database: serviceConfig.get<string>('DB_NAME'),
        autoLoadEntities: true,
        synchronize:
          serviceConfig.get<string>('NODE_ENV') === 'development'
            ? true
            : false,
      }),
    }),
    MailerModule.forRootAsync({
      useFactory: () => ({
        transport: 'smtps://user@domain.com:pass@smtp.domain.com',
        defaults: {
          from: '"nest-modules" <modules@nestjs.com>',
        },
        template: {
          dir: join(process.cwd(), 'src/templates'),
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
        options: {
          partials: {
            dir: join(process.cwd(), 'src/templates/partials'),
            options: {
              strict: true,
            },
          },
        },
      }),
    }),
    AuthModule,
    UsersModule,
    BudgetsModule,
    CategoriesModule,
    ExpensesModule,
    IncomesModule,
    ReportsModule,
    HealthModule,
  ],
  providers: [
    // Guards
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },

    // Interceptors
    { provide: APP_INTERCEPTOR, useClass: LoggerInterceptor },
    LoggerService,
    RedisService,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes({ path: '/*path', method: RequestMethod.ALL });
  }
}
