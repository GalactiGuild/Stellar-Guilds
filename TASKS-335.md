# Stellar-Guilds Issue #335 — Dashboard Sidebar with Collapsible State

## Scope
Build a responsive primary navigation sidebar with collapse persistence and mobile navigation behavior.

## Completed
- [x] Branch `feat/collapsible-sidebar` created from current main.
- [x] Added reusable client `Sidebar` component with primary nav icons: Home, Guilds, Profile, Settings.
- [x] Added bottom toggle button to collapse desktop sidebar into mini icon-only mode.
- [x] Persisted expanded/collapsed preference in `localStorage` via `stellar-guilds-sidebar-collapsed`.
- [x] Added Framer Motion width transition for smooth collapse/expand behavior.
- [x] Added mobile bottom tab bar variant for small screens.
- [x] Mounted sidebar globally in `[locale]/layout.tsx` and added desktop/mobile content spacing.
- [x] Validation: `cd frontend && npm run build` PASS with pre-existing warnings only.

## Non-goals / Safety
- Navigation-only UI.
- No wallet signing.
- No funds movement.
- No backend or contract changes.
