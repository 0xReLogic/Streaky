/**
 * Queue Management Service
 * Manages D1 cron_queue table for distributed job processing
 * Supports 1 user = 1 worker request pattern for scalability
 */

import { Env } from '../types/env';

export interface QueueItem {
	id: string;
	user_id: string;
	batch_id: string;
}

export interface BatchProgress {
	pending: number;
	processing: number;
	completed: number;
	failed: number;
	total: number;
}

/**
 * Initialize a new batch of users for processing
 * @param env - Worker environment with D1 binding
 * @param userIds - Array of user IDs to process
 * @returns Batch ID (UUID)
 */
export async function initializeBatch(env: Env, userIds: string[]): Promise<string> {
	const batchId = crypto.randomUUID();

	// Bulk insert users to queue
	for (const userId of userIds) {
		const queueId = crypto.randomUUID();
		await env.DB.prepare(
			`INSERT INTO cron_queue (id, user_id, batch_id, status)
       VALUES (?, ?, ?, 'pending')`
		)
			.bind(queueId, userId, batchId)
			.run();
	}

	return batchId;
}

/**
 * Get next pending user from queue
 * @param env - Worker environment with D1 binding
 * @returns QueueItem or null if queue is empty
 */
export async function getNextPendingUser(env: Env): Promise<QueueItem | null> {
	const result = await env.DB.prepare(
		`SELECT id, user_id, batch_id
     FROM cron_queue
     WHERE status = 'pending'
     ORDER BY created_at ASC
     LIMIT 1`
	).first<QueueItem>();

	return result || null;
}

/**
 * Mark queue item as processing
 * @param env - Worker environment with D1 binding
 * @param queueId - Queue item ID
 */
export async function markProcessing(env: Env, queueId: string): Promise<void> {
	const result = await env.DB.prepare(
		`UPDATE cron_queue
     SET status = 'processing',
         started_at = datetime('now')
     WHERE id = ? AND status = 'pending'`
	)
		.bind(queueId)
		.run();

	// If no rows updated, item already processing/completed
	if (!result.meta.changes || result.meta.changes === 0) {
		throw new Error('Queue item already processing or completed');
	}
}

/**
 * Mark queue item as completed
 * @param env - Worker environment with D1 binding
 * @param queueId - Queue item ID
 */
export async function markCompleted(env: Env, queueId: string): Promise<void> {
	await env.DB.prepare(
		`UPDATE cron_queue
     SET status = 'completed',
         completed_at = datetime('now')
     WHERE id = ?`
	)
		.bind(queueId)
		.run();
}

/**
 * Mark queue item as failed with error message
 * @param env - Worker environment with D1 binding
 * @param queueId - Queue item ID
 * @param error - Error message
 */
export async function markFailed(env: Env, queueId: string, error: string): Promise<void> {
	await env.DB.prepare(
		`UPDATE cron_queue
     SET status = 'failed',
         error_message = ?,
         completed_at = datetime('now'),
         retry_count = retry_count + 1
     WHERE id = ?`
	)
		.bind(error, queueId)
		.run();
}

/**
 * Get batch progress statistics
 * @param env - Worker environment with D1 binding
 * @param batchId - Batch ID
 * @returns Progress statistics by status
 */
export async function getBatchProgress(env: Env, batchId: string): Promise<BatchProgress> {
	const results = await env.DB.prepare(
		`SELECT status, COUNT(*) as count
     FROM cron_queue
     WHERE batch_id = ?
     GROUP BY status`
	)
		.bind(batchId)
		.all();

	const progress: BatchProgress = {
		pending: 0,
		processing: 0,
		completed: 0,
		failed: 0,
		total: 0,
	};

	for (const row of results.results as Array<{ status: string; count: number }>) {
		const status = row.status as keyof Omit<BatchProgress, 'total'>;
		progress[status] = row.count;
		progress.total += row.count;
	}

	return progress;
}

/**
 * Clean up old batches (7+ days old)
 * @param env - Worker environment with D1 binding
 * @param daysOld - Number of days (default: 7)
 * @returns Number of deleted rows
 */
export async function cleanupOldBatches(env: Env, daysOld: number = 7): Promise<number> {
	const result = await env.DB.prepare(
		`DELETE FROM cron_queue
     WHERE created_at < datetime('now', '-' || ? || ' days')`
	)
		.bind(daysOld)
		.run();

	return result.meta.changes;
}
