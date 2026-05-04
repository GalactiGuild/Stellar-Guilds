# TASKS-377 — Guild Member Inactivity Pruning Logic

Issue: https://github.com/GalactiGuild/Stellar-Guilds/issues/377
Branch: `feat/member-last-active`

## Plan
- [x] Add `last_active_at: u64` to guild `Member` records.
- [x] Initialize `last_active_at` from the current ledger sequence when owners/members are added or join.
- [x] Add storage helpers to refresh member activity and check inactivity after >1,000,000 ledgers.
- [x] Expose contract methods for `is_inactive` and authenticated `touch_member_activity`.
- [x] Refresh member activity on governance voting and bounty claiming/submission.
- [x] Add unit coverage simulating ledger movement and activity refresh.

## Verification
- `cd contract && cargo fmt`
- `cd contract && cargo test guild::tests::test_member_last_active_tracks_join_and_touch -- --nocapture` → PASS
- `cd contract && cargo test --lib` → PASS (292 tests, existing warnings only)

## Notes
- No pruning/removal behavior is implemented; this PR only adds the tracking primitive requested by the issue.
- Snapshot files generated during tests were intentionally reverted before commit.
