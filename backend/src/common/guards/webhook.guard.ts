import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { createHmac, timingSafeEqual } from 'crypto';

export const WEBHOOK_DUMMY_SECRET = 'stellar-guilds-webhook-secret';

interface WebhookRequest {
  headers: Record<string, string | string[] | undefined>;
  rawBody?: Buffer | string;
  body?: unknown;
}

@Injectable()
export class WebhookGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<WebhookRequest>();
    const providedSignature = this.getSignatureHeader(request);

    if (!providedSignature) {
      throw new UnauthorizedException('Missing X-Signature header');
    }

    const expectedSignature = this.signPayload(this.getPayload(request));

    if (!this.safeCompare(expectedSignature, providedSignature)) {
      throw new UnauthorizedException('Invalid webhook signature');
    }

    return true;
  }

  private getSignatureHeader(request: WebhookRequest): string | null {
    const signature = request.headers['x-signature'];

    if (Array.isArray(signature)) {
      return signature[0] ?? null;
    }

    return signature ?? null;
  }

  private getPayload(request: WebhookRequest): Buffer {
    if (Buffer.isBuffer(request.rawBody)) {
      return request.rawBody;
    }

    if (typeof request.rawBody === 'string') {
      return Buffer.from(request.rawBody, 'utf8');
    }

    if (typeof request.body === 'string') {
      return Buffer.from(request.body, 'utf8');
    }

    return Buffer.from(JSON.stringify(request.body ?? {}), 'utf8');
  }

  private signPayload(payload: Buffer): string {
    return createHmac('sha256', WEBHOOK_DUMMY_SECRET)
      .update(payload)
      .digest('hex');
  }

  private safeCompare(expectedSignature: string, providedSignature: string): boolean {
    const normalizedProvidedSignature = providedSignature.startsWith('sha256=')
      ? providedSignature.slice('sha256='.length)
      : providedSignature;

    const expectedBuffer = Buffer.from(expectedSignature, 'hex');
    const providedBuffer = Buffer.from(normalizedProvidedSignature, 'hex');

    if (expectedBuffer.length !== providedBuffer.length) {
      return false;
    }

    return timingSafeEqual(expectedBuffer, providedBuffer);
  }
}
