-- Queue performance indexes
-- Oldest pending claim
CREATE INDEX IF NOT EXISTS idx_cron_queue_status_created ON cron_queue(status, created_at);

-- Reaper: processing items older than threshold
CREATE INDEX IF NOT EXISTS idx_cron_queue_status_started ON cron_queue(status, started_at);

-- Batch reporting
CREATE INDEX IF NOT EXISTS idx_cron_queue_batch ON cron_queue(batch_id);
