# TASKS-349 — Guild Invitation Link UI

Issue: https://github.com/GalactiGuild/Stellar-Guilds/issues/349
Branch: `feat/guild-invite-links`

## Plan
- [x] Inspect Guild Settings page and existing UI/toast patterns.
- [x] Add Invite Member action in Guild Settings.
- [x] Generate mock `https://stellar-guilds.com/invite/[UUID]` links using `crypto.randomUUID()` with fallback.
- [x] Store local mock invite metadata for browser-only validation.
- [x] Add Copy Link action with clipboard fallback and success toast.
- [x] Add `/invite/[id]` page rendering invited guild message and Join button.
- [x] Verify frontend build.
- [ ] Commit, push, and open PR.

## Verification
- `npm run build` → PASS. Existing unrelated lint warnings remain.
