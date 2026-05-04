# TASKS-376 — Bounty Category Metadata Enums

Issue: https://github.com/GalactiGuild/Stellar-Guilds/issues/376
Branch: `feat/bounty-category-enum`

## Plan
- [x] Add Soroban-serializable `BountyCategory` enum with Development, Design, Documentation, Research, and Other variants.
- [x] Add `category` metadata to the `Bounty` struct.
- [x] Preserve the existing `create_bounty` API by defaulting legacy calls to `BountyCategory::Other`.
- [x] Add `create_bounty_with_category` for callers that want explicit structured metadata.
- [x] Update test fixtures/serialization coverage.

## Verification
- `cd contract && cargo fmt`
- `cd contract && cargo test bounty::tests::test_create_bounty_with_category_stores_category -- --nocapture` → PASS
- `cd contract && cargo test bounty::tests::test_bounty_serialization -- --nocapture` → PASS
- `cd contract && cargo test --lib` → PASS (292 tests, existing warnings only)

## Notes
- First verification command attempted two cargo test filters in one invocation; corrected by running each filter separately.
- Snapshot files generated during tests were intentionally reverted before commit.
