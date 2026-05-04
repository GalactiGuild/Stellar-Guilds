# TASKS-272 — Local UI Error Boundary

Issue: https://github.com/GalactiGuild/Stellar-Guilds/issues/272
Branch: `feat/ui-error-boundary`

## Plan
- [x] Inspect existing global error boundary and UI export patterns.
- [x] Create localized `src/components/ui/ErrorBoundary.tsx` client class component.
- [x] Implement `getDerivedStateFromError`.
- [x] Implement `componentDidCatch` with `console.error` and `onError` hook prop.
- [x] Render `Something went wrong` fallback UI.
- [x] Add `Try Again` button resetting `hasError` state.
- [x] Include manual dummy demo component that throws on click.
- [x] Export components from UI barrel.
- [x] Verify frontend build.
- [ ] Commit, push, and open PR.

## Verification
- `npm run build` → PASS. Existing unrelated lint warnings remain.
