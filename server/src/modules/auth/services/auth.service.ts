import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { LoggerService, RedisService } from '@shared/services';

@Injectable()
export class AuthService {
  constructor(
    private readonly _serviceJwt: JwtService,
    private readonly _logger: LoggerService,
    private _serviceRedis: RedisService,
  ) {}

  async addTokenToBlacklist(token: string): Promise<void> {
    try {
      const decoded: unknown = this._serviceJwt.decode(token);
      // decoded can be string | object | null — narrow safely
      let exp: number | undefined;
      if (decoded && typeof decoded === 'object') {
        const maybeExp = (decoded as Record<string, unknown>)['exp'];
        if (typeof maybeExp === 'number') exp = maybeExp;
      }
      if (!exp) return;

      const ttl = exp - Math.floor(Date.now() / 1000);
      if (ttl <= 0) return;

      // Narrow redis usage to a minimal typed shape to satisfy linting and avoid unsafe calls
      const redis = this._serviceRedis as unknown as {
        set?: (k: string, v: string, ttlSeconds: number) => Promise<unknown>;
      };
      if (redis && typeof redis.set === 'function') {
        await redis.set(`blacklist:${token}`, 'true', ttl);
      } else {
        // If Redis client isn't available, log and continue (non-blocking)
        this._logger.logError(new Error('Redis client not available'), {
          method: 'addTokenToBlacklist',
          url: `blacklist:${token}`,
        });
      }
    } catch (error) {
      console.error('Error adding token to blacklist:', error);
      throw new InternalServerErrorException('Error adding token to blacklist');
    }
  }

  async isTokenBlacklisted(token: string): Promise<boolean> {
    try {
      const redis = this._serviceRedis as unknown as {
        get?: (k: string) => Promise<string | null | undefined>;
      };
      if (!redis || typeof redis.get !== 'function') return false;
      const result = await redis.get(`blacklist:${token}`);
      return result === 'true';
    } catch (error) {
      console.error('Error checking blacklist:', error);
      return false;
    }
  }
}
