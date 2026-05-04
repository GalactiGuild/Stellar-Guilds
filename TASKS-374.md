# TASKS-374 — Guild Treasury Withdrawal Cap

Issue: https://github.com/GalactiGuild/Stellar-Guilds/issues/374
Branch: `feat/treasury-withdrawal-cap`

## Plan
- [x] Inspect treasury withdrawal flow and guild configuration types.
- [x] Add `max_withdrawal` configuration metadata and treasury storage field.
- [x] Keep existing `initialize_treasury` API working with a safe default cap.
- [x] Add a capped initializer for tests/configurable treasuries.
- [x] Enforce `amount <= max_withdrawal` before withdrawal proposal storage.
- [x] Add `LimitExceeded` error variant and focused below/over cap tests.
- [x] Run formatting and focused/full contract tests.
- [x] Revert generated snapshot churn before commit.
- [x] Commit, push, and open PR: https://github.com/GalactiGuild/Stellar-Guilds/pull/549

## Verification
- `cargo fmt`
- `cargo test treasury::tests::tests::test_withdrawal_below_cap_is_allowed -- --nocapture` → PASS
- `cargo test treasury::tests::tests::test_withdrawal_over_cap_fails -- --nocapture` → PASS
- `cargo test --lib` → PASS, 293 passed / 0 failed

## Notes
- Soroban exported function names are limited to 32 chars; the public configurable initializer is named `init_treasury_with_cap`.
- Existing treasury API remains backward compatible via `DEFAULT_MAX_WITHDRAWAL`.
