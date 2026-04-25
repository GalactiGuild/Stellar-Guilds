# Reputation Decay System

## Overview

The Reputation Decay System is designed to maintain a meritocratic leaderboard by gradually reducing reputation points for inactive users. This encourages active participation and ensures that the leaderboard reflects current contributions rather than historical achievements.

## How It Works

### Inactivity Detection

- **Inactivity Threshold**: 180 days (6 months) without a login
- **Activity Tracking**: Uses the `lastLoginAt` field in the User model
- **User Status**: Only affects active users (`isActive: true`)

### Decay Calculation

- **Decay Rate**: 5% of current reputation points
- **Floor**: Reputation never drops below zero
- **Frequency**: Monthly cron job (1st of every month at midnight UTC)

### Event Logging

Each decay event is recorded in the `ReputationEntry` table with:
- **Reason**: `REPUTATION_DECAY`
- **Points**: Negative value representing the decay amount
- **Metadata**: Detailed information about the decay calculation

## Implementation Details

### Service: `ReputationDecayService`

#### Key Methods

1. **`handleReputationDecay()`**
   - Main cron job handler
   - Runs automatically on the 1st of every month at midnight
   - Processes all inactive users

2. **`getDecayStatistics()`**
   - Returns statistics about inactive users
   - Useful for monitoring and health checks

3. **`processUserReputationDecay()`**
   - Handles individual user reputation decay
   - Calculates decay amount and creates reputation entry

#### Configuration Constants

```typescript
private readonly DECAY_PERCENTAGE = 0.05; // 5%
private readonly INACTIVITY_DAYS = 180; // 6 months
```

### Controller: `ReputationDecayController`

#### Endpoints

1. **GET `/reputation-decay/statistics`**
   - Returns current decay statistics
   - No authentication required (read-only)

2. **POST `/reputation-decay/trigger`**
   - Manually triggers the decay process
   - Primarily for testing and manual execution
   - Should be protected in production environments

## Database Schema

### User Model Fields Used

- `id`: User identifier
- `lastLoginAt`: Last login timestamp
- `isActive`: User active status
- `email`: User email (for logging)
- `username`: Username (for logging)

### ReputationEntry Model Fields

- `userId`: User identifier
- `points`: Negative decay amount
- `reason`: `REPUTATION_DECAY`
- `metadata`: JSON object with decay details

### Metadata Structure

```json
{
  "previousTotal": 150,
  "newTotal": 143,
  "decayPercentage": 0.05,
  "inactivityDays": 180,
  "processedAt": "2026-04-25T12:00:00.000Z"
}
```

## Monitoring and Maintenance

### Logging

The system provides comprehensive logging:
- **INFO**: Process start/completion, user processing
- **DEBUG**: Detailed processing information
- **ERROR**: Error handling and troubleshooting
- **WARN**: Edge cases and warnings

### Statistics

Use the statistics endpoint to monitor:
- Number of inactive users
- Users with reputation to decay
- Average reputation among inactive users

### Health Checks

Regular monitoring of:
- Cron job execution
- Database connectivity
- Error rates
- Processing time

## Testing

### Unit Tests

Comprehensive test suite in `reputation-decay.service.spec.ts`:
- Mocked database operations
- Edge case handling
- Error scenarios
- Statistical calculations

### Manual Testing

Use the trigger endpoint for manual testing:
```bash
curl -X POST http://localhost:3000/reputation-decay/trigger
```

### Test Scenarios

1. **Users with high reputation**: Verify 5% decay calculation
2. **Users with low reputation**: Verify floor at zero
3. **Users with no reputation**: Verify no processing
4. **Multiple users**: Verify batch processing
5. **Database errors**: Verify error handling

## Security Considerations

### Production Environment

1. **Protect Trigger Endpoint**: Add authentication/authorization
2. **Rate Limiting**: Prevent abuse of manual trigger
3. **Audit Logging**: Track manual executions
4. **Database Permissions**: Ensure proper access controls

### Data Integrity

1. **Transactions**: Use database transactions for consistency
2. **Idempotency**: Handle duplicate executions gracefully
3. **Rollback**: Implement rollback mechanisms if needed

## Performance Considerations

### Database Optimization

1. **Indexing**: Ensure proper indexes on `lastLoginAt` and `userId`
2. **Batch Processing**: Process users in batches for large datasets
3. **Query Optimization**: Use efficient queries for user selection

### Resource Usage

1. **Memory**: Monitor memory usage during large-scale processing
2. **Database Load**: Schedule during low-traffic periods
3. **Timeout Handling**: Implement appropriate timeouts

## Future Enhancements

### Potential Improvements

1. **Configurable Decay Rates**: Allow per-guild decay settings
2. **Graduated Decay**: Higher decay for longer inactivity periods
3. **Recovery Mechanisms**: Reputation restoration for returning users
4. **Notifications**: Alert users before decay occurs
5. **Analytics Dashboard**: Visual representation of decay trends

### Integration Opportunities

1. **Guild Settings**: Per-guild decay configuration
2. **User Preferences**: Opt-out options for certain users
3. **Achievement System**: Link decay to achievement system
4. **Leaderboard API**: Real-time leaderboard updates

## Troubleshooting

### Common Issues

1. **Cron Job Not Running**: Check ScheduleModule configuration
2. **No Users Processed**: Verify `lastLoginAt` data integrity
3. **Database Errors**: Check database connectivity and permissions
4. **Performance Issues**: Monitor query execution times

### Debug Commands

```bash
# Check statistics
curl http://localhost:3000/reputation-decay/statistics

# Manual trigger (with authentication)
curl -X POST -H "Authorization: Bearer <token>" \
  http://localhost:3000/reputation-decay/trigger

# Check logs
npm run start:prod  # Monitor application logs
```

## Deployment Notes

### Environment Variables

No additional environment variables required for basic functionality.

### Cron Schedule

The cron job uses the expression `0 0 1 * *`:
- Minute: 0
- Hour: 0 (midnight UTC)
- Day: 1 (1st of month)
- Month: * (every month)
- Day of week: * (any day)

### Database Migration

No database schema changes required. Uses existing `User` and `ReputationEntry` tables.
