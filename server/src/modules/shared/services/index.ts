import { LoggerService } from './logger.service';
import { MailingService } from './mailing.service';
import { RedisService } from './redis.service';
import { UtilsService } from './utils.service';

export const services: any[] = [
  LoggerService,
  MailingService,
  RedisService,
  UtilsService,
];

export * from './logger.service';
export * from './mailing.service';
export * from './redis.service';
export * from './utils.service';
