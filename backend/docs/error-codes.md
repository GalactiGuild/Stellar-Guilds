# Stellar Error Codes

Frontend clients should use `errorCode` (not `message`) for machine-readable error handling.

## Primary codes

- `ERR_UNAUTHORIZED`: Missing, invalid, or expired authentication credentials.
- `ERR_FORBIDDEN`: Authenticated user lacks permission for action.
- `ERR_NOT_FOUND`: Requested resource does not exist.
- `ERR_BAD_REQUEST`: Request payload or parameters are invalid.
- `ERR_CONFLICT`: Duplicate resource or uniqueness conflict.
- `ERR_RATE_LIMIT_EXCEEDED`: Request throttling triggered.
- `ERR_PAYOUT_AMOUNT_MISMATCH`: Requested payout amount does not match configured bounty amount.
- `ERR_INSUFFICIENT_FUNDS`: Guild balance is lower than payout amount.
- `ERR_INTERNAL_SERVER_ERROR`: Unexpected server-side failure.

## Prisma-specific codes

- `ERR_PRISMA_UNIQUE_CONSTRAINT`
- `ERR_PRISMA_FOREIGN_KEY_CONSTRAINT`
- `ERR_PRISMA_RECORD_NOT_FOUND`

## Response shape

The global exception filter now returns:

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "errorCode": "ERR_BAD_REQUEST",
  "timestamp": "2026-04-25T10:00:00.000Z",
  "path": "/api/v1/example"
}
```
