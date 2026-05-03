# TASKS — Stellar-Guilds issue #244 accessible confirmation dialogs

Goal: narrow frontend PR for reusable Radix AlertDialog-based confirmation component and a safe Settings-page scaffold action.

## In Progress
- [ ] T3. Validate build/typecheck and push PR.

## Completed
- [x] Branch `feat/accessible-confirm-dialog` created from current main.
- [x] T1. Add reusable ConfirmDialog component using Radix AlertDialog.
      Result: added `ConfirmDialog` with title, description, confirm/cancel text, destructive styling, focus-trapping via Radix AlertDialog, and graceful close after `onConfirm`.
- [x] T2. Add non-destructive Settings page visual integration for a test delete scaffold.
      Result: profile Settings includes a "Test Delete Scaffold" destructive-action demo that only logs/increments local state; no backend delete or wallet/funds action.
- [x] T3 validation.
      Verification: `cd frontend && npm run build` PASS with pre-existing warnings only.
