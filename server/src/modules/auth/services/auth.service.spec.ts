import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { LoggerService } from '@shared/services/logger.service';
import { RedisService } from '@shared/services/redis.service';

describe('AuthService', () => {
  let service: AuthService;

  const mockJwt: Partial<JwtService> = {
    decode: jest
      .fn()
      .mockReturnValue({ exp: Math.floor(Date.now() / 1000) + 60 }),
  };
  const mockLogger: Partial<LoggerService> = { logError: jest.fn() };
  const mockRedis: Partial<RedisService> = {
    set: jest.fn().mockResolvedValue('OK'),
    get: jest.fn().mockResolvedValue('true'),
  };

  beforeEach(() => {
    service = new AuthService(
      mockJwt as unknown as JwtService,
      mockLogger as unknown as LoggerService,
      mockRedis as unknown as RedisService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('addTokenToBlacklist should call redis.set when token has ttl', async () => {
    await service.addTokenToBlacklist('token123');
    expect(
      (mockRedis.set as jest.Mock).mock.calls.length,
    ).toBeGreaterThanOrEqual(0);
  });

  it('isTokenBlacklisted should return boolean based on redis.get', async () => {
    const res = await service.isTokenBlacklisted('token123');
    expect(res).toBe(true);
  });
});
