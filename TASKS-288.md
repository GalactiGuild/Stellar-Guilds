# TASKS-288 — Animated Loading Components

Issue: https://github.com/GalactiGuild/Stellar-Guilds/issues/288
Branch: `feat/loading-components`

## Plan
- [x] Inspect existing loading/spinner patterns.
- [x] Create reusable SVG-based `<Spinner />` component.
- [x] Support `size` props: `sm`, `md`, `lg`.
- [x] Support Tailwind text color classes via `color` prop.
- [x] Create `<LoadingOverlay isOpen={true} />` with absolute semi-transparent dark backdrop.
- [x] Use Framer Motion for mount/unmount and spinner animation.
- [x] Export components from UI barrel.
- [x] Verify frontend build.
- [x] Commit, push, and open PR: https://github.com/GalactiGuild/Stellar-Guilds/pull/556

## Verification
- `npm run build` → PASS. Existing unrelated lint warnings remain.
