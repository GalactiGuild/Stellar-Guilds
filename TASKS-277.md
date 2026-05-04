# TASKS-277 — Winston Request/Response Logger

Issue: https://github.com/GalactiGuild/Stellar-Guilds/issues/277
Branch: `feat/request-logger`

## Plan
- [x] Inspect existing backend logger setup.
- [x] Add `nest-winston` and `winston-daily-rotate-file` dependencies.
- [x] Configure logger module with console transport for non-production.
- [x] Configure JSON daily rotating file transports under `logs/` for production.
- [x] Add global `LoggerMiddleware` for method/url/ip/status/elapsed request logs.
- [x] Redact sensitive request headers/body fields before debug logging.
- [x] Verify backend build/tests.
- [x] Commit, push, and open PR: https://github.com/GalactiGuild/Stellar-Guilds/pull/562

## Verification
- `cd backend && npm run build` → PASS.
