# Stellar-Guilds Issue #336 — Token Balance Display Component

## Scope
Create an aesthetic wallet balance card with mock XLM/USDC balances, SVG icons, safe localized formatting, and skeleton loading state.

## Completed
- [x] Branch `feat/token-balance-card` created from current main.
- [x] Added reusable `TokenBalanceCard` component accepting `balances={{ XLM: 1500.50, USDC: 250.00 }}` / string equivalents.
- [x] Added inline SVG icons for XLM and USDC.
- [x] Added `Intl.NumberFormat`-based localized integer grouping while preserving decimal string precision up to 7 places.
- [x] Added skeleton loading state via existing `Skeleton` component.
- [x] Exported component/types from UI barrel.
- [x] Added mock wallet card to bounty marketplace sidebar so contributors see balances before bounty actions.
- [x] Validation: `cd frontend && npm run build` PASS with pre-existing warnings only.

## Non-goals / Safety
- Mock display only.
- No wallet connection/signing.
- No token transfers or funds movement.
- No backend balance calls.
