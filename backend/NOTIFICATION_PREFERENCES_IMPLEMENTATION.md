# User Notification Preferences Implementation

## Overview
This implementation adds granular email notification control for users, allowing them to toggle specific types of email notifications on or off.

## Changes Made

### 1. Database Schema (Prisma)
**File:** `prisma/schema.prisma`
- Added `notificationSettings Json?` field to the `User` model
- Default value: `{"emailOnBounty":true,"emailOnMention":true,"weeklyDigest":true}`

**Migration:** `prisma/migrations/20260423000000_add_notification_settings/migration.sql`
- SQL migration to add the column with JSONB type and default value

### 2. DTOs
**File:** `src/user/dto/notification-preferences.dto.ts`

Created two DTOs:
- `UpdateNotificationPreferencesDto`: For updating preferences (all fields optional)
  - `emailOnBounty?: boolean` - Receive emails for bounty updates
  - `emailOnMention?: boolean` - Receive emails when mentioned
  - `weeklyDigest?: boolean` - Receive weekly digest emails
  
- `NotificationPreferencesDto`: Response DTO with all three fields required

### 3. User Service
**File:** `src/user/user.service.ts`

Added methods:
- `updateNotificationPreferences(userId, preferences)`: Updates user's notification settings
- `getNotificationPreferences(userId)`: Retrieves current notification preferences
- `shouldSendEmail(userId, notificationType)`: Checks if email should be sent (used by MailerService)
- `getDefaultNotificationSettings()`: Returns default settings object

### 4. User Controller
**File:** `src/user/user.controller.ts`

Added endpoints:
- `PATCH /users/me/notifications`: Update notification preferences (requires JWT auth)
- `GET /users/me/notifications`: Get current notification preferences (requires JWT auth)

### 5. Auth Service
**File:** `src/auth/auth.service.ts`

Updated registration flows:
- `register()`: Sets default notification preferences when creating user with email/password
- `walletAuth()`: Sets default notification preferences when creating wallet-based user

### 6. Mailer Service
**File:** `src/mailer/mailer.service.ts`

Enhanced with preference checking:
- Added `PrismaService` dependency injection
- Added private `shouldSendEmail(userEmail, notificationType)` method
- Updated `sendBountyReminderEmail()` to check `emailOnBounty` preference before sending

### 7. Tests
Created comprehensive test suites:
- `src/user/user.service.notifications.spec.ts`: Tests for UserService notification methods
- `src/user/user.controller.notifications.spec.ts`: Tests for UserController endpoints

## API Usage

### Get Notification Preferences
```http
GET /users/me/notifications
Authorization: Bearer <token>
```

**Response:**
```json
{
  "preferences": {
    "emailOnBounty": true,
    "emailOnMention": true,
    "weeklyDigest": true
  }
}
```

### Update Notification Preferences
```http
PATCH /users/me/notifications
Authorization: Bearer <token>
Content-Type: application/json

{
  "emailOnBounty": false,
  "weeklyDigest": false
}
```

**Response:**
```json
{
  "message": "Notification preferences updated successfully",
  "preferences": {
    "emailOnBounty": false,
    "emailOnMention": true,
    "weeklyDigest": false
  }
}
```

## Default Behavior
- All notification types default to `true` (enabled)
- If `notificationSettings` is null or missing, defaults to all enabled
- On error checking preferences, defaults to `true` (graceful degradation)

## MailerService Integration

The MailerService now checks user preferences before sending emails:

```typescript
// Before sending any email
const shouldSend = await this.shouldSendEmail(to, 'emailOnBounty');
if (!shouldSend) {
  this.logger.log(`Email skipped for ${to} - user disabled notification type`);
  return;
}
```

### Notification Types Mapping
- `emailOnBounty`: Used for bounty-related emails (reminders, updates, etc.)
- `emailOnMention`: Reserved for mention notifications (future feature)
- `weeklyDigest`: Reserved for weekly digest emails (future feature)

## Database Migration

To apply the migration to your database:

```bash
# If DATABASE_URL is set in environment
npx prisma migrate dev --name add_notification_settings

# Or apply the SQL manually
psql -d your_database -f prisma/migrations/20260423000000_add_notification_settings/migration.sql
```

## Testing

Run the notification-specific tests:

```bash
# Test UserService notification methods
npm test -- user.service.notifications.spec.ts

# Test UserController notification endpoints
npm test -- user.controller.notifications.spec.ts

# Run all tests
npm test
```

## Future Enhancements

1. **Additional Notification Types:**
   - Guild invitations
   - Bounty application status changes
   - Direct messages
   - System announcements

2. **Notification Channels:**
   - Push notifications
   - In-app notifications
   - SMS notifications

3. **Advanced Settings:**
   - Quiet hours (do not disturb)
   - Email frequency limits
   - Digest customization

## Technical Notes

- **Graceful Degradation**: If preference check fails, emails are still sent (defaults to true)
- **Partial Updates**: PATCH endpoint allows updating individual preferences without sending all fields
- **Type Safety**: Full TypeScript support with proper interfaces and DTOs
- **Validation**: Uses class-validator for DTO validation
- **Swagger**: Full API documentation with Swagger decorators
