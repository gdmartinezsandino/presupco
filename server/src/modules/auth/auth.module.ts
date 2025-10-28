import { Module, Global } from '@nestjs/common';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { SharedModule } from '@shared/shared.module';
import { UsersModule } from '@users/users.module';
import { AuthController } from '@auth/controllers/auth.controller';
import { AuthService } from '@auth/services/auth.service';

@Global()
@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (serviceConfig: ConfigService) => {
        const opts: JwtModuleOptions = {
          global: true,
          secret: serviceConfig.get<string>('JWT_SECRET'),
          signOptions: {
            // cast to unknown then to any to satisfy JwtModule typing while
            // preserving runtime value from config
            expiresIn: serviceConfig.get('JWT_EXPIRES_IN'),
          },
        };
        return opts;
      },
      inject: [ConfigService],
    }),
    SharedModule,
    UsersModule,
  ],
  providers: [AuthService],
  exports: [AuthService, JwtModule],
  controllers: [AuthController],
})
export class AuthModule {}
