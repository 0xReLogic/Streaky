-- Migration: Create cron_queue table
-- Description: Manages distributed cron job processing queue
-- Created: 2025-10-19
-- Purpose: Enable 1 user = 1 worker request pattern for scalability

CREATE TABLE IF NOT EXISTS cron_queue (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  batch_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'processing', 'completed', 'failed')),
  error_message TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  started_at TEXT,
  completed_at TEXT,
  retry_count INTEGER DEFAULT 0,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_cron_queue_status ON cron_queue(status);
CREATE INDEX IF NOT EXISTS idx_cron_queue_batch_id ON cron_queue(batch_id);
CREATE INDEX IF NOT EXISTS idx_cron_queue_user_id ON cron_queue(user_id);
CREATE INDEX IF NOT EXISTS idx_cron_queue_created_at ON cron_queue(created_at);

-- Composite index for dispatcher queries (get next pending user)
CREATE INDEX IF NOT EXISTS idx_cron_queue_pending ON cron_queue(status, created_at) WHERE status = 'pending';

-- Composite index for batch progress tracking
CREATE INDEX IF NOT EXISTS idx_cron_queue_batch_status ON cron_queue(batch_id, status);
