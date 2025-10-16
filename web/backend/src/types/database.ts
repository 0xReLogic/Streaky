/**
 * Database Type Definitions for Streaky Backend
 * These types match the D1 database schema
 */

export interface User {
  id: string;
  github_username: string;
  github_id: string;
  email: string | null;
  github_pat: string | null;
  discord_webhook: string | null;
  telegram_token: string | null;
  telegram_chat_id: string | null;
  is_active: number; // SQLite uses INTEGER for boolean (0 or 1)
  created_at: string; // ISO 8601 datetime string
  updated_at: string; // ISO 8601 datetime string
}

export interface Notification {
  id: string;
  user_id: string;
  channel: 'discord' | 'telegram';
  status: 'sent' | 'failed';
  error_message: string | null;
  sent_at: string; // ISO 8601 datetime string
}

/**
 * Input types for creating new records
 */
export interface CreateUserInput {
  id: string;
  github_username: string;
  github_id: string;
  email?: string;
  github_pat?: string;
  discord_webhook?: string;
  telegram_token?: string;
  telegram_chat_id?: string;
}

export interface CreateNotificationInput {
  id: string;
  user_id: string;
  channel: 'discord' | 'telegram';
  status: 'sent' | 'failed';
  error_message?: string;
}

/**
 * Update types for modifying existing records
 */
export interface UpdateUserInput {
  github_pat?: string;
  discord_webhook?: string;
  telegram_token?: string;
  telegram_chat_id?: string;
  is_active?: number;
}

/**
 * Query result types
 */
export interface UserWithNotifications extends User {
  notifications: Notification[];
}

export interface NotificationStats {
  total: number;
  sent: number;
  failed: number;
  last_sent_at: string | null;
}
