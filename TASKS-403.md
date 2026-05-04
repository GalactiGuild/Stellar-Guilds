# TASKS-403 — Guild Member Leave Event Handling

Issue: https://github.com/GalactiGuild/Stellar-Guilds/issues/403
Branch: `feat/guild-member-leave`

## Plan
- [x] Inspect existing guild controller/service leave flow and Prisma schema.
- [x] Add `DELETE /guilds/:id/members/me` endpoint while preserving existing leave route.
- [x] Ensure only approved current members can leave.
- [x] Prevent owner leave and last approved admin leave.
- [x] Delete `GuildMembership`, decrement member count, and append `MEMBER_LEFT` activity log atomically.
- [x] Add Prisma `GuildActivityLog` model.
- [x] Add unit tests for success, not-member/pending-member rejection, and last-admin rejection.
- [x] Verify with focused Jest test and backend build.
- [x] Commit, push, and open PR: https://github.com/GalactiGuild/Stellar-Guilds/pull/550

## Verification
- `npx prisma format --schema prisma/schema.prisma`
- `npm test -- guild/guild.service.spec.ts --runInBand` → PASS, 12 passed / 0 failed
- `npm run build` → PASS
