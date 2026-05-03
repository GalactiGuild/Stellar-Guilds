import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { createHmac } from 'crypto';
import { WebhookGuard, WEBHOOK_DUMMY_SECRET } from './webhook.guard';

describe('WebhookGuard', () => {
  let guard: WebhookGuard;

  beforeEach(() => {
    guard = new WebhookGuard();
  });

  const sign = (payload: Buffer | string): string =>
    createHmac('sha256', WEBHOOK_DUMMY_SECRET).update(payload).digest('hex');

  const contextFor = (request: Record<string, unknown>): ExecutionContext =>
    ({
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    }) as ExecutionContext;

  it('allows a request with a valid X-Signature for the raw payload', () => {
    const rawBody = Buffer.from(JSON.stringify({ event: 'bounty.created' }));
    const request = {
      headers: {
        'x-signature': sign(rawBody),
      },
      rawBody,
    };

    expect(guard.canActivate(contextFor(request))).toBe(true);
  });

  it('allows a valid sha256-prefixed signature header', () => {
    const rawBody = '{"event":"guild.updated"}';
    const request = {
      headers: {
        'x-signature': `sha256=${sign(rawBody)}`,
      },
      rawBody,
    };

    expect(guard.canActivate(contextFor(request))).toBe(true);
  });

  it('falls back to the parsed body when rawBody is unavailable', () => {
    const body = { event: 'fallback.body' };
    const serializedBody = JSON.stringify(body);
    const request = {
      headers: {
        'x-signature': sign(serializedBody),
      },
      body,
    };

    expect(guard.canActivate(contextFor(request))).toBe(true);
  });

  it('throws 401 when X-Signature is missing', () => {
    const request = {
      headers: {},
      rawBody: Buffer.from('{"event":"missing.signature"}'),
    };

    expect(() => guard.canActivate(contextFor(request))).toThrow(
      UnauthorizedException,
    );
  });

  it('throws 401 when signatures mismatch', () => {
    const request = {
      headers: {
        'x-signature': sign('{"event":"original"}'),
      },
      rawBody: Buffer.from('{"event":"tampered"}'),
    };

    expect(() => guard.canActivate(contextFor(request))).toThrow(
      UnauthorizedException,
    );
  });

  it('throws 401 for malformed signatures without leaking timing information', () => {
    const request = {
      headers: {
        'x-signature': 'not-a-valid-hmac',
      },
      rawBody: Buffer.from('{"event":"malformed"}'),
    };

    expect(() => guard.canActivate(contextFor(request))).toThrow(
      UnauthorizedException,
    );
  });
});
