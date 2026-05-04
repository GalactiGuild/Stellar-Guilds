# Stellar-Guilds Issue #341 — Redis-backed Rate Limiter

## Scope
Configure NestJS throttling with Redis-capable storage, Redis env variables, X-Forwarded-For tracking, and a local fallback suitable for tests/development.

## Completed
- [x] Branch `feat/redis-rate-limiter` created from current main.
- [x] Confirmed `@nestjs/throttler` already exists; added explicit `ioredis` dependency because backend Redis services already import it but package metadata did not list it.
- [x] Added `RedisThrottlerStorage` implementing Nest `ThrottlerStorage`.
- [x] Redis mode uses sorted sets plus block keys when `THROTTLE_REDIS_ENABLED=true`.
- [x] Memory fallback supports local/dev/test operation when Redis is unavailable or disabled.
- [x] Added environment configuration defaults for `REDIS_HOST`, `REDIS_PORT`, `THROTTLE_REDIS_ENABLED`, `THROTTLE_TTL_MS`, `THROTTLE_LIMIT`, and `THROTTLE_BLOCK_MS`.
- [x] Wired `ThrottlerModule.forRootAsync` to use the Redis-capable storage.
- [x] Tracker uses the first `X-Forwarded-For` IP when present, falling back to `req.ip`.
- [x] Added focused unit tests proving rapid calls block after the limit and tracker buckets remain separate.
- [x] Validation: `cd backend && npm test -- src/common/services/redis-throttler.storage.spec.ts` PASS.
- [x] Validation: `cd backend && npm run build` PASS.

## Error note
- Attempted to inspect/install `throttler-storage-redis`, but npm registry returns 404. Implemented an internal Redis-capable `ThrottlerStorage` instead, which satisfies the same integration point without adding an unavailable package.
- First build failed due missing `ConfigService` import and strict typing around `req.headers`; fixed and re-ran build successfully.

## Non-goals / Safety
- No production Redis connection attempted unless explicitly enabled by env.
- No external requests beyond npm metadata/install.
- No wallet signing, funds movement, trading, or backend data mutation.
