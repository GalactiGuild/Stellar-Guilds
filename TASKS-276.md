# TASKS-276 — Guild Role Badge Components

Issue: https://github.com/GalactiGuild/Stellar-Guilds/issues/276
Branch: `feat/role-badge-component`

## Plan
- [x] Inspect existing guild role badge usage.
- [x] Create reusable UI `<RoleBadge role="admin" />` component.
- [x] Add conditional Tailwind styling for admin, auditor, and member.
- [x] Preserve owner support for existing guild UI compatibility.
- [x] Map roles to Lucide icons: Shield/Admin, Eye/Auditor, User/Member, Crown/Owner.
- [x] Hide text on extremely small screens while keeping icons visible.
- [x] Reuse UI badge from existing guild feature badge.
- [x] Export component/types from UI barrel.
- [x] Verify frontend build.
- [ ] Commit, push, and open PR.

## Verification
- `npm run build` → PASS. Existing unrelated lint warnings remain.
