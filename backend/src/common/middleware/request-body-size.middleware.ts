import {
  Injectable,
  NestMiddleware,
  PayloadTooLargeException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

const DEFAULT_MAX_BYTES = 1024 * 1024; // 1 MB

@Injectable()
export class RequestBodySizeMiddleware implements NestMiddleware {
  private readonly maxBytes: number;

  constructor(maxBytes: number = DEFAULT_MAX_BYTES) {
    this.maxBytes = maxBytes;
  }

  use(req: Request, _res: Response, next: NextFunction): void {
    const contentLength = parseInt(req.headers['content-length'] ?? '0', 10);

    if (contentLength > this.maxBytes) {
      throw new PayloadTooLargeException(
        `Request body exceeds the ${this.maxBytes} byte limit`,
      );
    }

    next();
  }
}
