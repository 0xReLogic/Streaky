/**
 * Cron Routes
 * Handles distributed queue processing endpoints
 * - Dispatcher: Self-triggering loop to process queue
 * - Process User: Worker for single user processing
 */

import { Hono } from 'hono';
import { Env } from '../types/env';
import { markProcessing, markCompleted, markFailed, getBatchProgress, getQueueItemStatus } from '../services/queue';
import { processSingleUser } from '../cron/process-single-user';

const app = new Hono<{ Bindings: Env }>();

// Removed deprecated /api/cron/dispatch endpoint (migrated to direct fan-out via Service Bindings)

/**
 * Process User Endpoint
 * Processes a single user from the queue
 * POST /api/cron/process-user
 */
app.post('/process-user', async (c) => {
	// Auth check
	const secret = c.req.header('X-Cron-Secret');
	if (!c.env.SERVER_SECRET || secret !== c.env.SERVER_SECRET) {
		return c.json({ error: 'Unauthorized' }, 401);
	}

	try {
		// Parse body
		const body = await c.req.json<{ queueId: string; userId: string }>();
		const { queueId, userId } = body;

		if (!queueId || !userId) {
			return c.json({ error: 'Missing queueId or userId' }, 400);
		}

		// Idempotent reserve logic: proceed if already 'processing'
		const status = await getQueueItemStatus(c.env, queueId);
		if (status === 'completed') {
			return c.json({ success: true, queueId, userId, skipped: true, reason: 'Already completed' });
		}
		if (status === 'failed') {
			return c.json({ success: false, queueId, userId, skipped: true, reason: 'Already failed' });
		}
		if (status === 'pending') {
			try {
				await markProcessing(c.env, queueId);
			} catch (e) {
				// If another dispatcher reserved concurrently, re-check and proceed only if now processing
				const s2 = await getQueueItemStatus(c.env, queueId);
				if (s2 !== 'processing') {
					return c.json({ success: true, queueId, userId, skipped: true, reason: 'Taken by another worker' });
				}
			}
		}

		// Process user (status is 'processing' now)
		try {
			await processSingleUser(c.env, userId);

			// Mark as completed
			await markCompleted(c.env, queueId);

			return c.json({
				success: true,
				queueId,
				userId,
			});
		} catch (error) {
			// Mark as failed with error message
			const errorMessage = error instanceof Error ? error.message : 'Unknown error';
			await markFailed(c.env, queueId, errorMessage);

			console.error(`[ProcessUser] Failed for user ${userId}:`, error);

			// Return 200 (not 500) so dispatcher continues with other users
			return c.json({
				success: false,
				queueId,
				userId,
				error: errorMessage,
			});
		}
	} catch (error) {
		console.error('[ProcessUser] Error:', error);
		return c.json({ error: 'Process user failed', message: error instanceof Error ? error.message : 'Unknown error' }, 500);
	}
});

/**
 * Batch Progress Endpoint (Optional - for monitoring)
 * GET /api/cron/batch/:batchId
 */
app.get('/batch/:batchId', async (c) => {
	// Auth check
	const secret = c.req.header('X-Cron-Secret');
	if (!c.env.SERVER_SECRET || secret !== c.env.SERVER_SECRET) {
		return c.json({ error: 'Unauthorized' }, 401);
	}

	try {
		const batchId = c.req.param('batchId');
		const progress = await getBatchProgress(c.env, batchId);

		return c.json({
			batchId,
			progress,
			percentage: progress.total > 0 ? Math.round(((progress.completed + progress.failed) / progress.total) * 100) : 0,
		});
	} catch (error) {
		console.error('[BatchProgress] Error:', error);
		return c.json({ error: 'Failed to get batch progress' }, 500);
	}
});

export default app;
