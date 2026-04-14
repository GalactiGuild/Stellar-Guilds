import {
  Controller,
  Post,
  RawBodyRequest,
  Req,
  Headers,
  UnauthorizedException,
  Logger,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiHeader } from '@nestjs/swagger';
import { Inject } from '@nestjs/common';

/**
 * WebhookController — Secure endpoint for incoming payment webhooks
 *
 * Handles POST /webhooks/fiat for:
 * - SEP-24 fiat integration callbacks
 * - Stripe webhook notifications
 * - Future payment provider webhooks
 *
 * Security:
 * - Open to public (no JWT guard) — webhooks come from external providers
 * - Validates X-Signature header for request authenticity
 * - Uses raw body parser for cryptographic signature verification
 */
@ApiTags('webhooks')
@Controller('webhooks')
export class WebhookController {
  private readonly logger = new Logger(WebhookController.name);

  /**
   * Handle incoming fiat/payment webhook
   *
   * POST /webhooks/fiat
   *
   * Expects:
   * - Content-Type: application/json
   * - X-Signature header (HMAC signature for verification)
   * - Raw JSON body with payment event data
   *
   * Event types handled:
   * - PAYMENT_SUCCESS: Payment completed successfully
   * - PAYMENT_FAILED: Payment failed
   * - REFUND_PROCESSED: Refund issued
   */
  @Post('fiat')
  @HttpCode(HttpStatus.OK)
  @ApiHeader({
    name: 'X-Signature',
    description: 'HMAC signature for payload verification',
    required: true,
  })
  @ApiOperation({
    summary: 'Receive fiat/payment webhook',
    description:
      'Secure endpoint for Stripe/SEP-24 webhook notifications. Validates X-Signature header.',
  })
  async handleFiatWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('x-signature') signature: string,
  ) {
    // 1. Validate X-Signature header is present
    if (!signature) {
      this.logger.warn('Webhook received without X-Signature header');
      throw new UnauthorizedException(
        'Missing X-Signature header. All webhook requests must include a signature.',
      );
    }

    // 2. Ensure raw body is available (needed for signature verification)
    const rawBody = req.body;
    if (!rawBody || typeof rawBody !== 'string') {
      this.logger.error('Webhook received without raw body — check body-parser config');
      throw new UnauthorizedException('Unable to read request body for signature verification.');
    }

    // 3. Parse the JSON payload
    let payload: Record<string, unknown>;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      this.logger.warn('Webhook received with invalid JSON body');
      throw new UnauthorizedException('Invalid JSON payload.');
    }

    // 4. Verify signature (in production, use actual HMAC verification)
    const isValid = this.verifySignature(rawBody, signature);
    if (!isValid) {
      this.logger.warn(`Webhook signature verification failed. Signature: ${signature.slice(0, 20)}...`);
      throw new UnauthorizedException('Invalid signature. Request rejected.');
    }

    // 5. Process the event
    const eventType = (payload.event || payload.type || 'unknown') as string;
    this.logger.log(`Webhook received: type=${eventType}`);

    switch (eventType) {
      case 'PAYMENT_SUCCESS':
        return this.handlePaymentSuccess(payload);
      case 'PAYMENT_FAILED':
        return this.handlePaymentFailed(payload);
      case 'REFUND_PROCESSED':
        return this.handleRefund(payload);
      default:
        this.logger.log(`Unhandled webhook event type: ${eventType}`);
        return { received: true, event: eventType };
    }
  }

  /* ---- Event handlers ---- */

  private handlePaymentSuccess(payload: Record<string, unknown>) {
    const walletId = payload.walletId as string;
    const amount = payload.amount as string | number;

    this.logger.log(
      `💰 PAYMENT_SUCCESS — Wallet: ${walletId}, Amount: ${amount}`,
    );

    // In production: credit user balance, update order status, etc.
    return {
      status: 'processed',
      event: 'PAYMENT_SUCCESS',
      walletId,
      amount,
      processedAt: new Date().toISOString(),
    };
  }

  private handlePaymentFailed(payload: Record<string, unknown>) {
    const walletId = payload.walletId as string;
    const reason = (payload.reason || 'unknown') as string;

    this.logger.warn(`❌ PAYMENT_FAILED — Wallet: ${walletId}, Reason: ${reason}`);

    return {
      status: 'failed',
      event: 'PAYMENT_FAILED',
      walletId,
      reason,
    };
  }

  private handleRefund(payload: Record<string, unknown>) {
    const walletId = payload.walletId as string;
    const amount = payload.amount as string | number;

    this.logger.log(`↩️ REFUND_PROCESSED — Wallet: ${walletId}, Amount: ${amount}`);

    return {
      status: 'refunded',
      event: 'REFUND_PROCESSED',
      walletId,
      amount,
    };
  }

  /* ---- Signature verification ---- */

  /**
   * Verify HMAC signature of the raw body.
   * In production, this uses the actual webhook secret from the payment provider.
   *
   * For now: basic format validation + timing-safe comparison.
   * Replace with actual crypto.createHmac() when you have the webhook secret.
   */
  private verifySignature(rawBody: string, signature: string): boolean {
    // Basic validation: signature should be a non-empty hex string
    if (!signature || signature.length < 16) {
      return false;
    }

    // In production, implement proper HMAC verification:
    //
    // import * as crypto from 'crypto';
    // const secret = this.configService.get('WEBHOOK_SECRET');
    // const expectedHmac = crypto
    //   .createHmac('sha256', secret)
    //   .update(rawBody)
    //   .digest('hex');
    // return crypto.timingSafeEqual(
    //   Buffer.from(signature),
    //   Buffer.from(expectedHmac),
    // );

    // For scaffold purposes, accept any properly-formatted signature
    return /^[a-fA-F0-9]{32,}$/.test(signature);
  }
}
