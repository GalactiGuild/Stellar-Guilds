# TASKS-375 — Automated Payout Batch Count Cap

Issue: https://github.com/GalactiGuild/Stellar-Guilds/issues/375
Branch: `feat/payout-batch-cap`

## Plan
- [x] Define `MAX_BATCH_SIZE = 25` in the bounty module.
- [x] Add a Soroban-serializable `PayoutBatchResult` return type.
- [x] Implement `process_payout_batch(count)` so it clamps oversized requests instead of panicking.
- [x] Emit a bounty recorded event when a remainder is left for later processing.
- [x] Expose the helper through the contract client.
- [x] Add tests for below-cap and above-cap requests.

## Verification
- `cd contract && cargo fmt`
- `cd contract && cargo test bounty::tests::test_process_payout_batch -- --nocapture` → PASS
- `cd contract && cargo test --lib` → PASS (293 tests, existing warnings only)

## Notes
- Existing codebase did not have a payout queue processor yet, so this PR adds the requested clamping primitive without altering actual payout distribution logic.
- Snapshot files generated during tests were intentionally reverted before commit.
