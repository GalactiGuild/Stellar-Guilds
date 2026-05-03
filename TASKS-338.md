# Stellar-Guilds Issue #338 — Webhook Signature Verification Middleware

## Scope
Create a strict NestJS webhook guard that validates `X-Signature` using HMAC SHA-256 and timing-safe comparison.

## Completed
- [x] Branch `feat/webhook-signature-guard` created from current main.
- [x] Added `WebhookGuard` in `backend/src/common/guards/webhook.guard.ts`.
- [x] Retrieves `X-Signature` from request headers.
- [x] Computes HMAC SHA-256 over `rawBody` with a dummy secret, with safe fallback to serialized parsed body for unit-test/local usage.
- [x] Supports raw hex and `sha256=<hex>` signature formats.
- [x] Compares signatures using `crypto.timingSafeEqual` after length validation.
- [x] Throws `401 Unauthorized` for missing, malformed, or mismatched signatures.
- [x] Added unit tests covering valid raw payload, prefixed signature, parsed-body fallback, missing signature, mismatch, and malformed signature.
- [x] Validation: `cd backend && npm test -- src/common/guards/webhook.guard.spec.ts` PASS.
- [x] Validation: `cd backend && npm run build` PASS.

## Non-goals / Safety
- Dummy/local secret only.
- No production webhook endpoint wiring.
- No external requests.
- No secrets, funds, wallet signing, or backend data mutation.
