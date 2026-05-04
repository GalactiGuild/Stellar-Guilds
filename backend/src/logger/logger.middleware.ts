import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { WinstonLogger } from './winston.logger';

const SENSITIVE_KEYS = [
  'authorization',
  'accessToken',
  'apiKey',
  'bearer',
  'clientSecret',
  'jwt',
  'password',
  'privateKey',
  'refreshToken',
  'secret',
  'seed',
  'token',
];

function isSensitiveKey(key: string): boolean {
  const normalized = key.toLowerCase();
  return SENSITIVE_KEYS.some((sensitiveKey) =>
    normalized.includes(sensitiveKey.toLowerCase()),
  );
}

function redactSensitive(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => redactSensitive(item));
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, entry]) => [
        key,
        isSensitiveKey(key) ? '[REDACTED]' : redactSensitive(entry),
      ]),
    );
  }

  return value;
}

function getBearerStrippedHeaders(headers: Request['headers']) {
  const sanitized = { ...headers };

  if (sanitized.authorization) {
    sanitized.authorization = String(sanitized.authorization).replace(
      /Bearer\s+[^\s]+/gi,
      'Bearer [REDACTED]',
    );
  }

  return sanitized;
}

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private readonly logger = new WinstonLogger('HttpRequest');

  use(req: Request, res: Response, next: NextFunction) {
    const startTime = Date.now();

    res.on('finish', () => {
      const elapsedMs = Date.now() - startTime;
      const originIp = req.ip || req.socket.remoteAddress || 'unknown';
      const message = `${req.method} ${req.originalUrl || req.url} - ${originIp} - ${res.statusCode} - ${elapsedMs}ms`;

      this.logger.log(message, 'HttpRequest');
      this.logger.debug(
        JSON.stringify({
          method: req.method,
          url: req.originalUrl || req.url,
          ip: originIp,
          statusCode: res.statusCode,
          elapsedMs,
          headers: getBearerStrippedHeaders(req.headers),
          body: redactSensitive(req.body),
        }),
        'HttpRequest',
      );
    });

    next();
  }
}
