# TASKS-275 — Guild Settings Layout Scaffold

Issue: https://github.com/GalactiGuild/Stellar-Guilds/issues/275
Branch: `feat/guild-settings-layout`

## Plan
- [x] Inspect current guild settings route and layout patterns.
- [x] Create reusable `SettingsLayout` container for guild settings.
- [x] Add persistent left sidebar links: General, Members, Treasury, Integrations.
- [x] Highlight active link distinctly, including locale-prefixed paths.
- [x] Collapse sidebar into hamburger mobile menu at `md` and below.
- [x] Provide central `<main>` content area.
- [x] Wrap existing guild settings page with the new layout.
- [x] Verify frontend build.
- [ ] Commit, push, and open PR.

## Verification
- `npm run build` → PASS. Existing unrelated lint warnings remain.
