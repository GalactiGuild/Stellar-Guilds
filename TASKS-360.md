# TASKS-360 — Bounty Review Time Window Logic

Issue: https://github.com/GalactiGuild/Stellar-Guilds/issues/360
Branch: `feat/bounty-review-window`

## Plan
- [x] Record the ledger sequence when submitted bounty work enters review.
- [x] Add `is_review_window_over(bounty_id)` using ledger-sequence difference math.
- [x] Prevent admin completion approval once the review window is closed.
- [x] Add tests for review sequence tracking, boundary behavior, and late approval rejection.
- [x] Update serialization/interface fixtures for the new optional review field.

## Verification
- `cd contract && cargo fmt`
- `cd contract && cargo test bounty::tests::test_review_window -- --nocapture` → PASS
- `cd contract && cargo test bounty::tests::test_approve_completion_after_review_window_fails -- --nocapture` → PASS
- `cd contract && cargo test --lib` → PASS (293 tests, existing warnings only)

## Notes
- Uses `REVIEW_WINDOW_LEDGERS = 120_960` as an approximate 7-day Stellar ledger window.
- Snapshot files generated during tests were intentionally reverted before commit.
