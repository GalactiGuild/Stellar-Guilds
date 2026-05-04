# TASKS-291 — Global Search Command Palette

Issue: https://github.com/GalactiGuild/Stellar-Guilds/issues/291
Branch: `feat/global-search-palette`

## Plan
- [x] Inspect layout and existing search/frontend components.
- [x] Add global client `CommandPalette` component.
- [x] Manually listen for `Cmd+K` / `Ctrl+K` to open search modal.
- [x] Auto-focus search input on open.
- [x] Filter a hardcoded local result array instantly as the user types.
- [x] Group results into Guilds, Bounties, and Users sections.
- [x] Add keyboard arrow navigation and Enter-to-open behavior.
- [x] Mount palette globally in locale layout.
- [x] Verify frontend build.
- [ ] Commit, push, and open PR.

## Verification
- `npm run build` → PASS. Existing unrelated lint warnings remain.
