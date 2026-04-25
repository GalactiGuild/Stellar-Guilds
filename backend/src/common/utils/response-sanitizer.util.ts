const SENSITIVE_FIELDS = new Set([
  'password',
  'passwordHash',
  'hashedPassword',
  'secret',
  'token',
  'accessToken',
  'refreshToken',
  'privateKey',
  'apiKey',
  'creditCard',
  'ssn',
  'pin',
]);

export function sanitizeResponse(data: unknown): unknown {
  if (data === null || data === undefined) return data;

  if (Array.isArray(data)) {
    return data.map(item => sanitizeResponse(item));
  }

  if (typeof data === 'object') {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
      result[key] = SENSITIVE_FIELDS.has(key) ? '[REDACTED]' : sanitizeResponse(value);
    }
    return result;
  }

  return data;
}
