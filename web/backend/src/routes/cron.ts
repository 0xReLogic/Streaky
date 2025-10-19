/**
 * Cron Routes
 * Handles distributed queue processing endpoints
 * - Dispatcher: Self-triggering loop to process queue
 * - Process User: Worker for single user processing
 */

import { Hono } from 'hono';
import { Env } from '../types/env';
import { getNextPendingUser, markProcessing, markCompleted, markFailed, getBatchProgress } from '../services/queue';
import { processSingleUser } from '../cron/process-single-user';

const app = new Hono<{ Bindings: Env }>();

/**
 * Dispatcher Endpoint
 * Self-triggering loop that processes queue one user at a time
 * GET /api/cron/dispatch
 */
app.get('/dispatch', async (c) => {
	// Auth check
	const secret = c.req.header('X-Cron-Secret');
	if (!c.env.SERVER_SECRET || secret !== c.env.SERVER_SECRET) {
		return c.json({ error: 'Unauthorized' }, 401);
	}

	try {
		// Get next pending user
		const queueItem = await getNextPendingUser(c.env);

		if (!queueItem) {
			// Queue is empty
			return c.json({ message: 'Queue empty - all users processed' }, 200);
		}

		// Mark as processing
		await markProcessing(c.env, queueItem.id);

		// Get worker URL for self-triggering (use request origin)
		const origin = new URL(c.req.url).origin;

		// Trigger processing for this user (async, don't wait)
		c.executionCtx.waitUntil(
			fetch(`${origin}/api/cron/process-user`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'X-Cron-Secret': c.env.SERVER_SECRET,
				},
				body: JSON.stringify({
					queueId: queueItem.id,
					userId: queueItem.user_id,
				}),
			}).catch((error) => {
				console.error('[Dispatcher] Error triggering process-user:', error);
			})
		);

		// Self-trigger next dispatch (async, don't wait)
		// Important: Use same origin to ensure we call ourselves, not external service
		c.executionCtx.waitUntil(
			fetch(`${origin}/api/cron/dispatch`, {
				method: 'GET',
				headers: {
					'X-Cron-Secret': c.env.SERVER_SECRET,
				},
			}).catch((error) => {
				console.error('[Dispatcher] Error self-triggering:', error);
			})
		);

		// Return immediately (don't block)
		return c.json({
			dispatched: true,
			queueId: queueItem.id,
			userId: queueItem.user_id,
			batchId: queueItem.batch_id,
		});
	} catch (error) {
		console.error('[Dispatcher] Error:', error);
		return c.json({ error: 'Dispatcher failed', message: error instanceof Error ? error.message : 'Unknown error' }, 500);
	}
});

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

		// Mark as processing (idempotency: prevents duplicate execution)
		try {
			await markProcessing(c.env, queueId);
		} catch (error) {
			// Already processing or completed - skip duplicate
			console.log(`[ProcessUser] Queue item ${queueId} already processed, skipping duplicate`);
			return c.json({
				success: true,
				queueId,
				userId,
				skipped: true,
				reason: 'Already processing or completed',
			});
		}

		// Process user
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
