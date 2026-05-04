# TASKS-274 — Interactive Bounty Submission UI Flow

Issue: https://github.com/GalactiGuild/Stellar-Guilds/issues/274
Branch: `feat/bounty-submission-flow`

## Plan
- [x] Inspect bounty form/UI conventions.
- [x] Install Radix Dialog for sidebar/drawer behavior.
- [x] Create isolated `BountySubmissionDrawer` UI component.
- [x] Add GitHub PR URL input.
- [x] Add Additional Notes textarea.
- [x] Add dynamic external links with `react-hook-form` `useFieldArray`.
- [x] Add confirmation step before final submission.
- [x] Keep `onSubmit` mocked with `console.log` only.
- [x] Verify frontend build.
- [ ] Commit, push, and open PR.

## Verification
- `npm run build` → PASS. Existing unrelated lint warnings remain.
