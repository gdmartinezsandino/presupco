import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './health.controller';
import { RedisService } from '@shared/services';

@Module({
  imports: [TerminusModule],
  controllers: [HealthController],
  providers: [RedisService],
})
export class HealthModule {}
