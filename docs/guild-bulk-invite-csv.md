# Guild Member CSV Upload for Bulk Invites

## Overview

This document describes the bulk invite feature for guild members in
`Stellar-Guilds`. Admins can upload a CSV file containing Stellar wallet
addresses to invite multiple members at once instead of inviting them
one by one.

---

## How It Works

1. Admin uploads a CSV file to `POST /guilds/:id/members/bulk-invite`
2. Server parses the CSV and extracts wallet addresses
3. Each address is validated before any database operation
4. Valid addresses are matched to existing users
5. A `GuildMembership` record is created for each valid user
6. A summary is returned showing invited and skipped counts

---

## API Endpoint

### `POST /guilds/:id/members/bulk-invite`

Upload a CSV file of wallet addresses to bulk invite members.

**Request:** `multipart/form-data` with a `file` field containing the CSV.

**CSV Format:**



**Response:**
```json
{
  "invited": 45,
  "skipped": 5,
  "summary": "Invited 45 users, 5 invalid addresses skipped",
  "details": {
    "invited": ["GBZXN7..."],
    "skipped": [
      { "address": "invalid", "reason": "Invalid Stellar address format" }
    ]
  }
}
```

---

## Validation Rules

Each address is validated before any database operation:

- Must start with `G`
- Must be exactly 56 characters long
- Must contain only uppercase letters and digits
- Must match an existing user in the database
- Must not already be a member or have a pending invite

---

## Implementation

**Files:**
- `src/guild/guild-bulk-invite.service.ts` — CSV parsing and bulk invite logic
- `src/guild/guild.controller.ts` — `POST /guilds/:id/members/bulk-invite` route
- `src/guild/guild.module.ts` — module registration

---

## Security Assumptions

- Only guild admins can perform bulk invites — permission enforced by
  existing `ensureManagePermission` check
- All addresses are validated before any DB writes — invalid rows never
  touch the database
- Duplicate invites are silently skipped — no error is thrown
- Failed rows are logged and included in the skipped count

---

## Abuse and Failure Paths

| Scenario | Behaviour |
|----------|-----------|
| No file uploaded | Returns `{ error: 'No file uploaded' }` |
| Invalid address format | Skipped with reason logged |
| No user with that wallet | Skipped with reason logged |
| User already invited | Skipped with reason logged |
| Database error on create | Skipped with reason logged |

---

## Test Coverage

**File:** `src/guild/guild-bulk-invite.service.spec.ts`

| Test | What it verifies |
|------|-----------------|
| parses a simple CSV | Addresses extracted correctly |
| skips header row | Header labels ignored |
| skips empty lines | Empty rows ignored |
| returns empty array for empty CSV | Empty file handled |
| skips invalid addresses | Bad format caught before DB |
| skips address when no user found | Missing user handled |
| skips when already a member | Duplicate invite prevented |
| successfully invites valid address | Happy path works |
| returns correct summary message | Summary format correct |

---

## Related Files

- `src/guild/guild-bulk-invite.service.ts`
- `src/guild/guild.controller.ts`
- `src/guild/guild.module.ts`
- `src/guild/guild-bulk-invite.service.spec.ts`

