# Stellar-Guilds Issue #337 — Network Switcher

## Scope
Add a visual Stellar network switcher with Mainnet/Testnet options, global Testnet indicator, and warning confirmation before switching during connected/action-sensitive flows.

## Completed
- [x] Branch `feat/network-switcher` created from current main.
- [x] Added reusable client `NetworkDropdown` component.
- [x] Restricted UI options to exactly Mainnet and Testnet.
- [x] Wired switching to existing `useWalletStore.switchNetwork`, which persists connected wallet sessions and changes the globally used wallet network for RPC/passphrase helpers.
- [x] Added persistent amber `Testnet Active` indicator when Testnet is selected.
- [x] Added warning modal before network switching when a wallet is connected or caller marks `isActionInProgress`.
- [x] Mounted the switcher globally in `[locale]/layout.tsx` so it is visible across app routes.
- [x] Validation: `cd frontend && npm run build` PASS with pre-existing warnings only.

## Non-goals / Safety
- No wallet signing.
- No real transaction submission.
- No funds movement.
- No backend changes.
