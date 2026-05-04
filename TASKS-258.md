# TASKS-258 — Localized Relative Time Component

Issue: https://github.com/GalactiGuild/Stellar-Guilds/issues/258
Branch: `feat/relative-time-component`

## Plan
- [x] Inspect frontend dependencies and existing bounty deadline display.
- [x] Add Radix Tooltip dependency for hover details.
- [x] Build `<RelativeTime date={Date | string} />` using `date-fns/formatDistanceToNow`.
- [x] Add localized exact date/time tooltip via `Intl.DateTimeFormat`.
- [x] Handle invalid dates gracefully without throwing.
- [x] Export the component from UI index.
- [x] Replace bounty card deadline formatting with `RelativeTime`.
- [x] Verify frontend build.
- [x] Commit, push, and open PR: https://github.com/GalactiGuild/Stellar-Guilds/pull/552

## Verification
- `npm run build` → PASS. Existing lint warnings remain unrelated: unused `StepWizard`, `<img>` warnings, `Tabs` unused/missing dependency, and unused `Textarea`.
