import { Injectable } from '@nestjs/common';
import { getReasonPhrase } from 'http-status-codes';
import { ensureDirSync, appendFileSync } from 'fs-extra';
import * as path from 'path';

@Injectable()
export class LoggerService {
  private logDir = path.join(process.cwd(), 'logs');

  constructor() {
    // ensure logs directory exists; fs-extra has proper types but narrow anyway
    try {
      // use the named imports to keep types explicit for eslint
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      ensureDirSync(this.logDir);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('Failed to ensure log directory exists:', msg);
    }
  }

  private writeToFile(message: string) {
    const date = new Date();
    const fileName = `${date.toISOString().split('T')[0]}.log`;
    const filePath = path.join(this.logDir, fileName);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    appendFileSync(filePath, message + '\n');
  }

  logRequest(
    method: string,
    url: string,
    statusCode: number,
    ms: number,
    body?: unknown,
  ): void {
    const statusIcon =
      statusCode < 200
        ? '⚪'
        : statusCode < 300
          ? '✅'
          : statusCode < 400
            ? '📦'
            : statusCode < 500
              ? '⚠️'
              : '🔥';

    const statusName = getReasonPhrase(statusCode);
    const timestamp = new Date().toISOString();

    const message = `
[${timestamp}]
${statusIcon}  ${method} ${url}
   → Status: ${statusCode} ${statusName}
   → Time: ${ms}ms
   ${body ? `→ Body: ${JSON.stringify(body)}` : ''}
    `;

    // Log to console

    console.log(message);

    // Save to file
    this.writeToFile(message);
  }

  logError(error: unknown, req?: unknown): void {
    const timestamp = new Date().toISOString();
    const msg = error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error && error.stack ? error.stack : '';

    let method = 'unknown';
    let url = 'unknown';
    if (req && typeof req === 'object') {
      const r = req as { method?: unknown; url?: unknown };
      const safeToString = (v: unknown): string => {
        if (typeof v === 'string') return v;
        try {
          return JSON.stringify(v);
        } catch {
          return String(v);
        }
      };

      if (r.method !== undefined) {
        method = safeToString(r.method);
      }

      if (r.url !== undefined) {
        url = safeToString(r.url);
      }
    }

    const message = `
[${timestamp}]
🔥 ERROR in ${method} ${url}
   → Message: ${msg}
   → Stack: ${stack}
    `;

    console.error(message);
    this.writeToFile(message);
  }
}
