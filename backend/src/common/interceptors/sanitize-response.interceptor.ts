import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * List of sensitive field keys that should be stripped from API responses.
 * Matching is case-insensitive to catch variations like 'Password', 'PASSWORD'.
 * Only exact matches are stripped (e.g., 'password' is stripped, but 'password_hash' is not).
 */
const SENSITIVE_KEYS = ['password', 'twofactorsecret', 'internalnote'];

/**
 * Deeply sanitizes an object by removing sensitive keys.
 * Handles nested objects, arrays, and preserves non-object values.
 *
 * @param data - The data to sanitize (object, array, or primitive)
 * @returns A sanitized copy of the data with sensitive fields removed
 */
function deepSanitize<T>(data: T): T {
  // Handle null/undefined
  if (data === null || data === undefined) {
    return data;
  }

  // Handle primitive types (string, number, boolean, etc.)
  if (typeof data !== 'object') {
    return data;
  }

  // Handle arrays - sanitize each element
  if (Array.isArray(data)) {
    return data.map((item) => deepSanitize(item)) as T;
  }

  // Handle objects - filter out sensitive keys and sanitize nested values
  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
    // Normalize key for case-insensitive comparison (remove camelCase casing)
    // This ensures 'Password', 'PASSWORD', 'password' all match
    const normalizedKey = key.toLowerCase();

    // Skip sensitive keys (case-insensitive comparison)
    if (SENSITIVE_KEYS.includes(normalizedKey)) {
      continue;
    }

    // Recursively sanitize nested values
    sanitized[key] = deepSanitize(value);
  }

  return sanitized as T;
}

/**
 * NestJS Interceptor that removes sensitive fields from all API responses.
 *
 * This interceptor ensures that sensitive data like passwords, two-factor secrets,
 * and internal notes are never included in API responses, even if they were
 * inadvertently selected in database queries.
 *
 * Applied globally in main.ts to protect all endpoints.
 */
@Injectable()
export class SanitizeResponseInterceptor<T> implements NestInterceptor<T, T> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<T> {
    return next.handle().pipe(
      map((data) => {
        // Sanitize the response data
        return deepSanitize(data);
      }),
    );
  }
}
