import { AuthController } from './auth.controller';
import { CreateUserDto } from '@users/dto/users.dto';
import type { AuthService } from '@auth/services';
import type { JwtService } from '@nestjs/jwt';
import type { UsersService } from '@users/services';
import type { ConfigService } from '@nestjs/config';
import type {
  MailingService,
  RedisService,
  LoggerService,
} from '@shared/services';
import type { Request } from 'express';

describe('AuthController (unit)', () => {
  let controller: AuthController;
  const mockAuthService: Partial<AuthService> = {
    isTokenBlacklisted: jest.fn().mockResolvedValue(false),
    addTokenToBlacklist: jest.fn().mockResolvedValue(true),
  };

  const mockJwtService: Partial<JwtService> = {
    signAsync: jest.fn().mockResolvedValue('signed-token'),
  };

  const mockUsersService: Partial<UsersService> = {
    findOneByPayload: jest.fn().mockResolvedValue(null),
    create: jest
      .fn()
      .mockResolvedValue({ id: 'uid', email: 'test@example.com' }),
    findById: jest.fn().mockResolvedValue({
      id: 'uid',
      email: 'test@example.com',
      state: 'inactive',
    }),
    findAndUpdate: jest.fn().mockResolvedValue({
      id: 'uid',
      email: 'test@example.com',
      state: 'active',
    }),
    sanitizeUser: jest
      .fn()
      .mockImplementation((u: Record<string, unknown>) => u),
  };

  const mockConfig: Partial<ConfigService> = {
    get: jest.fn().mockReturnValue('http://localhost:4200'),
  };

  const mockMailing: Partial<MailingService> = {
    send: jest.fn().mockResolvedValue(true),
  };

  const mockRedis: Partial<RedisService> = {
    set: jest.fn().mockResolvedValue('OK'),
    get: jest.fn().mockResolvedValue('uid'),
    exists: jest.fn().mockResolvedValue(1),
    del: jest.fn().mockResolvedValue(1),
  };

  const mockLogger: Partial<LoggerService> = {
    logError: jest.fn(),
  };

  beforeEach(() => {
    controller = new AuthController(
      mockAuthService as AuthService,
      mockJwtService as JwtService,
      mockUsersService as UsersService,
      mockConfig as ConfigService,
      mockMailing as MailingService,
      mockRedis as RedisService,
      mockLogger as LoggerService,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('register should send activation email and return created user', async () => {
    const dto = { email: 'test@example.com' } as CreateUserDto;

    const res = (await controller.register(dto, {} as Request)) as {
      id: string;
      email: string;
    };
    expect(mockUsersService.create).toHaveBeenCalledWith(dto);
    expect(mockMailing.send).toHaveBeenCalled();
    expect(res).toHaveProperty('id', 'uid');
  });

  it('activate should activate user when token exists', async () => {
    const body = { token: 'tok', password: 'P@ssw0rd!' } as {
      token: string;
      password?: string;
    };
    const res = await controller.activate(body);
    expect(mockRedis.exists).toHaveBeenCalled();
    expect(mockUsersService.findAndUpdate).toHaveBeenCalled();
    expect(res).toHaveProperty('state', 'active');
  });
});
