# TASKS-273 — Generic Sortable DataTable

Issue: https://github.com/GalactiGuild/Stellar-Guilds/issues/273
Branch: `feat/data-table-component`

## Plan
- [x] Inspect existing UI table/loading conventions.
- [x] Install `@tanstack/react-table`.
- [x] Scaffold generic `<DataTable data={[]} columns={[]} />` component.
- [x] Implement ascending/descending sorting on sortable column headers.
- [x] Add sleek `No Data Available` empty state.
- [x] Apply dark glassmorphism Tailwind styling.
- [x] Export component and type from UI barrel.
- [x] Verify frontend build.
- [ ] Commit, push, and open PR.

## Verification
- `npm run build` → PASS. Existing unrelated lint warnings remain.
