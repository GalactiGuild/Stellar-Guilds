# TASKS-261 — Copyable Public Key UI Component

Issue: https://github.com/GalactiGuild/Stellar-Guilds/issues/261
Branch: `feat/copyable-key-component`

## Plan
- [x] Inspect existing frontend copy/toast patterns.
- [x] Build `<CopyableKey publicKey="G..." />` as a client component.
- [x] Visually truncate displayed key while copying the full key.
- [x] Use `navigator.clipboard.writeText` when available.
- [x] Add `document.execCommand('copy')` fallback for older browsers.
- [x] Show green checkmark feedback for 2 seconds after successful copy.
- [x] Emit Sonner toast: "Address Copied!".
- [x] Export component from UI barrel.
- [x] Verify frontend build.
- [x] Commit, push, and open PR: https://github.com/GalactiGuild/Stellar-Guilds/pull/553

## Verification
- `npm run build` → PASS. Existing unrelated lint warnings remain.
