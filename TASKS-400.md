# Stellar-Guilds Issue #400 — Guild Social Links Schema & Updates

## Scope
Implement a flexible guild social links JSON field plus a protected endpoint for admins/owners to update it.

## Completed
- [x] Branch `feat/guild-social-links` created from current main.
- [x] Added `socialLinks Json?` to the Prisma `Guild` model.
- [x] Added migration `202605040121_add_guild_social_links` to add the `socialLinks` JSONB column on `guilds`.
- [x] Added `GuildSocialLinksDto` and `UpdateGuildSocialLinksDto` with class-validator URL/string validation.
- [x] Added optional `socialLinks` field to the existing guild update DTO.
- [x] Added protected `PUT /guilds/:id/socials` endpoint.
- [x] Reused existing guild role guard: only `ADMIN` and `OWNER` can update guild social links.
- [x] Added `GuildService.updateGuildSocialLinks` that updates only the socialLinks JSON field and returns `{ id, socialLinks }`.
- [x] Added focused tests for DTO validation and service update behavior.
- [x] Validation: `cd backend && npm test -- src/guild/guild-social-links.spec.ts` PASS.
- [x] Validation: `cd backend && npm run build` PASS.

## Error note
- First focused test run failed because the standalone Jest test used class-transformer decorators without importing `reflect-metadata`. Added `import 'reflect-metadata';` to the test and reran successfully.

## Non-goals / Safety
- No production data mutation performed.
- No wallet signing, funds movement, trading, KYC, or sensitive action performed.
