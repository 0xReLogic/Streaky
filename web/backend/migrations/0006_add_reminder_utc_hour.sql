-- Migration: Add per-user reminder UTC hour
-- Description: Allows each user to choose the UTC hour (0-23) when reminders should run.
-- NOTE: Default is 12 to preserve the previous behavior (the system used to run only at 12:00 UTC).
-- Created: 2025-12-12

ALTER TABLE users
  ADD COLUMN reminder_utc_hour INTEGER DEFAULT 12 CHECK(reminder_utc_hour BETWEEN 0 AND 23);

CREATE INDEX IF NOT EXISTS idx_users_reminder_utc_hour ON users(reminder_utc_hour);


