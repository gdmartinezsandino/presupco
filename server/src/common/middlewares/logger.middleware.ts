import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

import { LoggerService } from '@shared/services';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  constructor(private readonly logger: LoggerService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const start = Date.now();

    res.on('finish', () => {
      const ms = Date.now() - start;
      const locals = (res as Response & { locals?: Record<string, unknown> })
        .locals;
      const alreadyLogged = locals?.__logger_logged === true;

      if (res.statusCode >= 400 && !alreadyLogged) {
        this.logger.logRequest(
          req.method,
          req.originalUrl,
          res.statusCode,
          ms,
          req.body,
        );
      }
    });

    next();
  }
}
