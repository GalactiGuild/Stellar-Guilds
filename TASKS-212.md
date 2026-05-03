# Stellar-Guilds Issue #212 — Optimistic UI Updates

## Scope
Implement a frontend-only optimistic bounty status update slice with local Zustand state and mock network confirmation.

## Completed
- [x] Branch `feat/optimistic-bounty-status` created from current main.
- [x] Added local `useBountyStore` seeded from existing mock bounties.
- [x] Implemented optimistic `updateBountyStatus` with immediate UI mutation, 3s mock confirmation delay, 20% mock failure rollback, pending-state tracking, and local error tracking.
- [x] Wired marketplace and My Bounties pages to the shared store so optimistic status changes propagate across bounty views.
- [x] Wired bounty detail claim/submission actions to optimistic status updates and Sonner success/error promise toasts.
- [x] Validation: `cd frontend && npm run build` PASS with pre-existing warnings only.

## Non-goals / Safety
- No real Soroban/Stellar SDK calls.
- No wallet signing.
- No funds movement.
- No backend mutation wiring.
