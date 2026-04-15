import { Injectable, NestMiddleware, UnsupportedMediaTypeException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

const WRITE_METHODS = new Set(['POST', 'PUT', 'PATCH']);
const ALLOWED_CONTENT_TYPES = [
  'application/json',
  'multipart/form-data',
];

/**
 * Middleware that enforces Content-Type header on write requests.
 *
 * - POST/PUT/PATCH must declare Content-Type: application/json or multipart/form-data
 * - GET, DELETE, HEAD, OPTIONS are exempt
 * - multipart/form-data is allowed for file upload routes
 */
@Injectable()
export class ContentTypeMiddleware implements NestMiddleware {
  use(req: Request, _res: Response, next: NextFunction) {
    if (!WRITE_METHODS.has(req.method)) {
      return next();
    }

    const contentType = req.headers['content-type'];

    if (!contentType) {
      throw new UnsupportedMediaTypeException(
        'Content-Type header is required for write operations. Expected: application/json',
      );
    }

    const isAllowed = ALLOWED_CONTENT_TYPES.some((allowed) =>
      contentType.toLowerCase().startsWith(allowed),
    );

    if (!isAllowed) {
      throw new UnsupportedMediaTypeException(
        `Unsupported Content-Type: ${contentType}. Expected: application/json`,
      );
    }

    next();
  }
}
