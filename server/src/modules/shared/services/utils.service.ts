import { extname } from 'path';
import { Injectable } from '@nestjs/common';
import { HttpException, HttpStatus } from '@nestjs/common';
import type { Request } from 'express';
import * as uuid from 'uuid';

@Injectable()
export class UtilsService {
  constructor() {}

  // Minimal typing for multer-style file filters
  static imageFileFilter = (
    _req: Request,
    file: { originalname: string },
    callback: (err: Error | null, acceptFile: boolean) => void,
  ): void => {
    const name = file.originalname ?? '';
    if (!name.match(/\.(jpg|jpeg|png|gif|svg)$/)) {
      return callback(
        new HttpException(
          'Only image files are allowed!',
          HttpStatus.INTERNAL_SERVER_ERROR,
        ),
        false,
      );
    }
    callback(null, true);
  };

  static documentFileFilter = (
    _req: Request,
    file: { originalname: string },
    callback: (err: Error | null, acceptFile: boolean) => void,
  ): void => {
    const name = file.originalname ?? '';
    if (!name.match(/\.(pdf|docx|txt)$/)) {
      return callback(
        new HttpException(
          'Only pdf, docx and text files are allowed!',
          HttpStatus.INTERNAL_SERVER_ERROR,
        ),
        false,
      );
    }
    callback(null, true);
  };

  static editFileName = (
    _req: Request,
    file: { originalname: string },
    callback: (err: Error | null, filename: string) => void,
  ): void => {
    const fileExtName = extname(file.originalname ?? '');
    callback(null, `${uuid.v4()}${fileExtName}`);
  };

  sanitizeUser(
    user:
      | { toObject?: () => Record<string, unknown> }
      | Record<string, unknown>,
  ): Record<string, unknown> {
    let sanitized: Record<string, unknown>;
    if (user) {
      const u = user as { toObject?: unknown };
      if (u.toObject && typeof u.toObject === 'function') {
        // safe to call and expect a plain object
        sanitized = (u.toObject as () => Record<string, unknown>)();
      } else {
        sanitized = { ...(user as Record<string, unknown>) };
      }
    } else {
      sanitized = {};
    }

    if (sanitized && typeof sanitized === 'object') {
      // avoid indexed access warnings by using delete with string literal

      delete sanitized['password'];
    }

    return sanitized;
  }
}
