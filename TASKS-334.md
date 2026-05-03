# Stellar-Guilds Issue #334 — Notification Toast Manager

## Scope
Integrate global Sonner toast notifications with standardized success/error/info helpers and a sandbox page.

## Completed
- [x] Branch `feat/sonner-toast-manager` created from current main.
- [x] Confirmed `sonner` is already installed in `frontend/package.json`; no dependency churn needed.
- [x] Added root layout `<Toaster />` provider configured for dark theme, bottom-right placement, rich colors, close button, and 4s default duration.
- [x] Added `useAppToast` hook standardizing success, error, and info toasts with 4s timeout.
- [x] Added `/[locale]/toast-sandbox` dummy page with buttons to trigger all three states.
- [x] Validation: `cd frontend && npm run build` PASS with pre-existing warnings only.

## Non-goals / Safety
- UI feedback only.
- No wallet signing.
- No funds movement.
- No backend or contract changes.
