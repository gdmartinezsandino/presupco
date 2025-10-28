import { Controller, Get } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  HealthCheckResult,
  HealthIndicatorResult,
} from '@nestjs/terminus';
import { TypeOrmHealthIndicator } from '@nestjs/terminus';
import { RedisService } from '@shared/services';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private db: TypeOrmHealthIndicator,
    private redisService: RedisService,
  ) {}

  @Get()
  @HealthCheck()
  async check(): Promise<HealthCheckResult> {
    return this.health.check([
      // DB check (TypeORM)
      async () => this.db.pingCheck('database'),
      // Redis check (simple ping by checking existence of a dummy key)
      async () => {
        // try a simple redis command
        await this.redisService.set('health:ping', '1', 5);
        await this.redisService.del('health:ping');
        return { redis: { status: 'up' } } as unknown as HealthIndicatorResult;
      },
    ]);
  }
}
