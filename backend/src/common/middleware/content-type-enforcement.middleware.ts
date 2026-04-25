import {
  Injectable,
  NestMiddleware,
  UnsupportedMediaTypeException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

/**
 * Middleware to enforce JSON content type for write operations (POST, PATCH, PUT).
 * This prevents CSRF attacks and parsing errors by ensuring all write requests
 * explicitly declare Content-Type: application/json.
 *
 * Exceptions:
 * - Allows multipart/form-data for file upload routes
 * - Skips validation for GET, DELETE, HEAD, OPTIONS requests
 */
@Injectable()
export class ContentTypeEnforcementMiddleware implements NestMiddleware {
  private readonly WRITE_METHODS = ['POST', 'PATCH', 'PUT'];
  private readonly ALLOWED_CONTENT_TYPES = [
    'application/json',
    'multipart/form-data',
  ];

  /**
   * Routes that are allowed to use multipart/form-data for file uploads
   */
  private readonly MULTIPART_ALLOWED_ROUTES = [
    '/api/v1/users/me/avatar',
    '/api/v1/guilds/:id/avatar',
    '/api/v1/guilds/:id/banner',
    '/api/v1/guilds/:id/members/bulk-invite',
  ];

  use(req: Request, _res: Response, next: NextFunction): void {
    // Skip validation for non-write methods
    if (!this.WRITE_METHODS.includes(req.method)) {
      return next();
    }

    const contentType = req.headers['content-type'];

    // Content-Type header is required for write operations
    if (!contentType) {
      throw new UnsupportedMediaTypeException(
        'Content-Type header is required for POST, PATCH, and PUT requests. Expected: application/json',
      );
    }

    // Extract the base content type (ignore charset and boundary parameters)
    const baseContentType = contentType.split(';')[0].trim().toLowerCase();

    // Check if it's multipart/form-data
    if (baseContentType === 'multipart/form-data') {
      // Only allow multipart for specific file upload routes
      if (this.isMultipartAllowed(req.path)) {
        return next();
      }

      throw new UnsupportedMediaTypeException(
        'multipart/form-data is only allowed for file upload endpoints. Use application/json for this route.',
      );
    }

    // Enforce application/json for all other write operations
    if (baseContentType !== 'application/json') {
      throw new UnsupportedMediaTypeException(
        `Unsupported Content-Type: ${baseContentType}. Expected: application/json`,
      );
    }

    next();
  }

  /**
   * Check if the request path is allowed to use multipart/form-data
   */
  private isMultipartAllowed(path: string): boolean {
    return this.MULTIPART_ALLOWED_ROUTES.some((route) => {
      // Convert route pattern to regex (simple :id parameter matching)
      const pattern = route.replace(/:[^/]+/g, '[^/]+');
      const regex = new RegExp(`^${pattern}$`);
      return regex.test(path);
    });
  }
}
