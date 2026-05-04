# Stellar-Guilds Issue #347 — Guild Migration Mechanism Stub

## Scope
Implement admin-gated state export/import primitives for isolated V1→V2 guild migration tests without wiping real instances.

## Completed
- [x] Branch `feat/guild-migration-stub` created from current main.
- [x] Added contract `export_state(caller) -> Map<Symbol, Val>` endpoint.
- [x] Added contract `import_state(caller, state) -> bool` endpoint.
- [x] Added admin/deployer authorization boundary via stored contract admin; non-admin callers panic.
- [x] Added migration module exporting deterministic guild primitives:
  - export format version
  - guild map
  - nested guild member map
  - guild counter
- [x] Added import validation for version and required state sections before writing storage.
- [x] Exposed guild storage keys for typed export/import reuse.
- [x] Added isolated migration tests verifying guild/member preservation and counter continuity across two contract instances.
- [x] Added non-admin rejection test.
- [x] Validation: `cd contract && cargo test test_migration -- --nocapture` PASS.
- [x] Validation: `cd contract && cargo test --lib` PASS — 293 passed, 0 failed.

## Error note
- First targeted test failed because internal migration helpers called `require_auth()` after the public endpoint had already authenticated the same frame, causing Soroban `ExistingValue`. Kept auth at the contract boundary and made helper functions pure storage transforms.
- Initial non-admin test expected the literal panic text, but the Soroban host reports it as `WasmVm InvalidAction`; changed to assert panic without string matching.

## Non-goals / Safety
- No live contract upgrade or `update_current_contract_wasm` call.
- No production instance mutation.
- No wallet signing, funds movement, trading, KYC, or sensitive action performed.
