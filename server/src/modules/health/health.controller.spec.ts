import { HealthController } from './health.controller';
import type {
  HealthCheckService,
  TypeOrmHealthIndicator,
} from '@nestjs/terminus';
import type { RedisService } from '@shared/services';

describe('HealthController', () => {
  let controller: HealthController;

  beforeEach(() => {
    const mockHealth = {
      check: jest.fn().mockResolvedValue({ status: 'ok' }),
    } as unknown as HealthCheckService;

    const mockDb = {
      pingCheck: jest.fn().mockResolvedValue({ database: { status: 'up' } }),
    } as unknown as TypeOrmHealthIndicator;

    const mockRedisService = {
      set: jest.fn().mockResolvedValue('OK'),
      del: jest.fn().mockResolvedValue(1),
    } as unknown as RedisService;

    controller = new HealthController(mockHealth, mockDb, mockRedisService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('check should return health result', async () => {
    const res = await controller.check();
    expect(res).toBeDefined();
  });
});
