import {
  Injectable,
  NestMiddleware,
  LoggerService,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { WinstonLogger } from '../logger/winston.logger';

/* ---------- sensitive field redaction ---------- */

const SENSITIVE_FIELDS = [
  'password',
  'password_confirmation',
  'currentPassword',
  'newPassword',
  'token',
  'accessToken',
  'refreshToken',
  'apiKey',
  'secret',
  'authorization',
  'creditCard',
  'ssn',
];

function redactSensitive(obj: Record<string, unknown>): Record<string, unknown> {
  if (!obj || typeof obj !== 'object') return obj;
  const redacted = { ...obj };
  for (const key of Object.keys(redacted)) {
    const lowerKey = key.toLowerCase();
    if (SENSITIVE_FIELDS.some((s) => lowerKey.includes(s.toLowerCase()))) {
      (redacted as any)[key] = '[REDACTED]';
    } else if (typeof (redacted as any)[key] === 'object' && (redacted as any)[key] !== null) {
      (redacted as any)[key] = redactSensitive((redacted as any)[key] as Record<string, unknown>);
    }
  }
  return redacted;
}

/* ---------- middleware ---------- */

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private logger: WinstonLogger;

  constructor() {
    this.logger = new WinstonLogger('HTTP');
  }

  use(req: Request, res: Response, next: NextFunction): void {
    const start = Date.now();
    const { method, originalUrl, ip, headers, body } = req;

    // Capture response finish
    res.on('finish', () => {
      const duration = Date.now() - start;
      const statusCode = res.statusCode;
      const contentLength = res.getHeader('content-length');

      // Build safe log entry
      const logData: Record<string, unknown> = {
        method,
        url: originalUrl,
        ip: this.extractIp(req),
        statusCode,
        durationMs: duration,
        contentLength: contentLength ?? 0,
        userAgent: headers['user-agent']?.substring(0, 120),
      };

      // Include body for non-GET/DELETE requests (redacted)
      if (!['GET', 'HEAD', 'OPTIONS'].includes(method) && body && Object.keys(body).length > 0) {
        logData.body = redactSensitive(body as Record<string, unknown>);
      }

      // Log level based on status code
      const level = statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'info';
      this.logger[level]?.(
        `${method} ${originalUrl} - ${statusCode} - ${duration}ms`,
        'HTTP',
      );
    });

    next();
  }

  /**
   * Extract client IP, respecting reverse proxy headers.
   */
  private extractIp(req: Request): string {
    const forwarded = req.headers['x-forwarded-for'];
    if (typeof forwarded === 'string') {
      return forwarded.split(',')[0].trim();
    }
    return req.socket.remoteAddress || req.ip || 'unknown';
  }
}
