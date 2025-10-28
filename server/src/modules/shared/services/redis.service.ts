import {
  Injectable,
  Global,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, RedisClientType } from 'redis';

@Global()
@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: RedisClientType;
  private isConnected = false;

  constructor(private readonly _serviceConfig: ConfigService) {
    this.client = createClient({
      socket: {
        host: this._serviceConfig.get<string>('REDIS_HOST', 'localhost'),
        port: Number(this._serviceConfig.get<string>('REDIS_PORT', '6379')),
      },
    });

    this.client.on('error', (err) =>
      console.error('❌ Redis Client Error:', err),
    );
  }

  async onModuleInit() {
    if (!this.isConnected) {
      await this.client.connect();
      this.isConnected = true;
      console.log('✅ Connected to Redis');
    }
  }

  async onModuleDestroy() {
    await this.client.quit();
    console.log('🧹 Redis connection closed');
  }

  async set(key: string, value: string, ttlInSeconds?: number): Promise<void> {
    if (ttlInSeconds) {
      await this.client.set(key, value, { EX: ttlInSeconds });
    } else {
      await this.client.set(key, value);
    }
  }

  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  async del(key: string): Promise<number> {
    return this.client.del(key);
  }

  async exists(key: string): Promise<boolean> {
    return (await this.client.exists(key)) > 0;
  }
}
