import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';

import * as fromServicesAuth from '@auth/services';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly _serviceReflector: Reflector,
    private readonly _serviceJwt: JwtService,
    private readonly _serviceAuth: fromServicesAuth.AuthService,
    private readonly _serviceConfig: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this._serviceReflector.get<boolean>(
      'isPublic',
      context.getHandler(),
    );
    if (isPublic) return true;

    const request = context
      .switchToHttp()
      .getRequest<Request & { user?: unknown }>();
    const token = this.extractTokenFromHeader(request);
    if (!token) throw new UnauthorizedException('Missing token');

    try {
      // Define a minimal payload shape we expect from JWTs and use generic
      type AuthJwtPayload = {
        id: string;
        email?: string;
        iat?: number;
        exp?: number;
      };

      const payload = await this._serviceJwt.verifyAsync<AuthJwtPayload>(
        token,
        {
          secret: this._serviceConfig.get<string>('JWT_SECRET'),
        },
      );

      const isBlacklisted = await this._serviceAuth.isTokenBlacklisted(token);
      if (isBlacklisted) {
        throw new UnauthorizedException('Token has been revoked');
      }

      // attach user payload to request with the explicit payload type
      (request as Request & { user?: AuthJwtPayload }).user = payload;
      return true;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Invalid token';
      throw new UnauthorizedException(message);
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
