# TASKS-301 — Reputation Token URI Resolver

Issue: https://github.com/GalactiGuild/Stellar-Guilds/issues/301
Branch: `feat/reputation-token-uri`

## Plan
- [x] Inspect existing reputation metadata functions and contract exports.
- [x] Add static base URI route for Reputation SBT metadata.
- [x] Add `token_uri(id: i128) -> String` resolver for fixed off-chain metadata paths.
- [x] Add tests for base URI, multiple token IDs, and unknown ID rejection.
- [x] Run formatting and contract tests.
- [x] Revert generated snapshot churn before commit.
- [ ] Commit, push, and open PR.

## Verification
- `cargo fmt`
- `cargo test test_reputation_token_uri_returns_static_metadata_path -- --nocapture` → PASS
- `cargo test test_reputation_token_uri_rejects_unknown_id -- --nocapture` → PASS
- `cargo test test_get_token_metadata_returns_json -- --nocapture` → PASS
- `cargo test --lib` → PASS, 293 passed / 0 failed
- No generated snapshot files remained modified after tests.
