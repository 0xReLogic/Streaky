# Database Migrations

This directory contains SQL migration files for the Streaky D1 database.

## Migration Files

- `0001_create_users_table.sql` - Creates users table with indexes and triggers
- `0002_create_notifications_table.sql` - Creates notifications table with indexes

## Running Migrations

### Local Development
```bash
# Apply migration to local database
npx wrangler d1 execute streaky-db --local --file=./migrations/0001_create_users_table.sql
npx wrangler d1 execute streaky-db --local --file=./migrations/0002_create_notifications_table.sql
```

### Production
```bash
# Apply migration to remote database
npx wrangler d1 execute streaky-db --remote --file=./migrations/0001_create_users_table.sql
npx wrangler d1 execute streaky-db --remote --file=./migrations/0002_create_notifications_table.sql
```

## Verifying Schema

```bash
# List all tables and indexes (local)
npx wrangler d1 execute streaky-db --local --command="SELECT name, type FROM sqlite_master WHERE type IN ('table', 'index') ORDER BY type, name;"

# List all tables and indexes (remote)
npx wrangler d1 execute streaky-db --remote --command="SELECT name, type FROM sqlite_master WHERE type IN ('table', 'index') ORDER BY type, name;"
```

## Database Schema

### Users Table
Stores user information and notification preferences.

**Columns:**
- `id` (TEXT, PRIMARY KEY) - Unique user identifier
- `github_username` (TEXT, NOT NULL, UNIQUE) - GitHub username
- `github_id` (TEXT, NOT NULL, UNIQUE) - GitHub user ID
- `email` (TEXT, NULLABLE) - User email
- `discord_webhook` (TEXT, NULLABLE) - Encrypted Discord webhook URL
- `telegram_token` (TEXT, NULLABLE) - Encrypted Telegram bot token
- `telegram_chat_id` (TEXT, NULLABLE) - Encrypted Telegram chat ID
- `is_active` (INTEGER, DEFAULT 1) - Active status (0 or 1)
- `created_at` (TEXT, DEFAULT NOW) - Creation timestamp
- `updated_at` (TEXT, DEFAULT NOW) - Last update timestamp

**Indexes:**
- `idx_users_github_username` - For username lookups
- `idx_users_github_id` - For GitHub ID lookups
- `idx_users_is_active` - For filtering active users
- `idx_users_created_at` - For sorting by creation date

**Triggers:**
- `update_users_timestamp` - Auto-updates `updated_at` on record update

### Notifications Table
Stores notification history for audit and display.

**Columns:**
- `id` (TEXT, PRIMARY KEY) - Unique notification identifier
- `user_id` (TEXT, NOT NULL, FOREIGN KEY) - References users.id
- `channel` (TEXT, NOT NULL) - Notification channel ('discord' or 'telegram')
- `status` (TEXT, NOT NULL) - Notification status ('sent' or 'failed')
- `error_message` (TEXT, NULLABLE) - Error message if failed
- `sent_at` (TEXT, DEFAULT NOW) - Timestamp when notification was sent

**Indexes:**
- `idx_notifications_user_id` - For user-specific queries
- `idx_notifications_sent_at` - For sorting by timestamp
- `idx_notifications_status` - For filtering by status
- `idx_notifications_channel` - For filtering by channel
- `idx_notifications_user_sent` - Composite index for user's recent notifications

**Foreign Keys:**
- `user_id` references `users(id)` with CASCADE delete

## Creating New Migrations

When creating new migrations, follow this naming convention:
```
XXXX_description_of_change.sql
```

Where `XXXX` is the next sequential number (e.g., 0003, 0004, etc.).

Always test migrations locally before applying to production!
