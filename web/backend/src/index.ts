/**
 * Streaky Backend API
 * Cloudflare Worker with Hono framework
 */

import { Hono } from 'hono';
import { Env } from './types/env';
import { corsMiddleware } from './middleware/cors';
import { RateLimiters } from './middleware/rate-limit';
import { performanceMiddleware } from './lib/monitoring';
import userRoutes from './routes/user';
import cronRoutes from './routes/cron';
import { checkAllUsersStreaks } from './cron/streak-checker';
import { initializeBatch, cleanupOldBatches, getNextPendingUser } from './services/queue';

const app = new Hono<{ Bindings: Env }>();

// Performance monitoring middleware (first to track all requests)
app.use('*', performanceMiddleware);

// Security headers middleware
app.use('*', async (c, next) => {
	await next();
	
	// Add security headers to all responses
	c.header('X-Content-Type-Options', 'nosniff');
	c.header('X-Frame-Options', 'DENY');
	c.header('X-XSS-Protection', '1; mode=block');
	c.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
	c.header('Referrer-Policy', 'strict-origin-when-cross-origin');
});

// Request size limit middleware
app.use('/api/*', async (c, next) => {
	const contentLength = c.req.header('content-length');
	const MAX_SIZE = 1024 * 1024; // 1MB limit
	
	if (contentLength && parseInt(contentLength) > MAX_SIZE) {
		return c.json({ error: 'Request too large', maxSizeBytes: MAX_SIZE }, 413);
	}
	
	await next();
});

// Apply CORS middleware
app.use('*', corsMiddleware);

// Apply rate limiting
app.use('/api/user/*', RateLimiters.api); // 60 req/min for user endpoints
app.use('/api/cron/*', RateLimiters.strict); // 10 req/min for cron trigger

// Health check endpoint
app.get('/', (c) => {
	return c.json({
		name: 'Streaky API',
		version: '1.0.0',
		status: 'healthy',
	});
});

// Manual cron trigger for testing (protected with secret)
// Updated to use NEW distributed queue system for testing
app.post('/api/cron/trigger', async (c) => {
	const secret = c.req.header('X-Cron-Secret');

	if (!c.env.SERVER_SECRET || secret !== c.env.SERVER_SECRET) {
		return c.json({ error: 'Unauthorized' }, 401);
	}

	try {
		// Query active users
		const usersResult = await c.env.DB.prepare(
			`SELECT id FROM users WHERE is_active = 1 AND github_pat IS NOT NULL`
		).all();

		const userIds = (usersResult.results || []).map((row: any) => row.id as string);

		if (userIds.length === 0) {
			return c.json({ success: true, message: 'No active users to process' });
		}

		// Initialize batch
		const batchId = await initializeBatch(c.env, userIds);
		console.log(`[Manual] Batch ${batchId} initialized with ${userIds.length} users`);

		// Trigger distributed processing via Service Bindings
		// Each fetch = SEPARATE Worker instance! ✅
		for (let i = 0; i < userIds.length; i++) {
			const queueItem = await getNextPendingUser(c.env);
			if (!queueItem) break;

			c.executionCtx.waitUntil(
				c.env.SELF.fetch('http://internal/api/cron/process-user', {
					method: 'POST',
					headers: {
						'X-Cron-Secret': c.env.SERVER_SECRET,
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						queueId: queueItem.id,
						userId: queueItem.user_id,
					}),
				})
					.then((res) => {
						console.log(`[Manual] User ${queueItem.user_id} dispatched: ${res.status}`);
					})
					.catch((error: Error) => {
						console.error(`[Manual] User ${queueItem.user_id} dispatch failed:`, error);
					})
			);
		}

		return c.json({ 
			success: true, 
			message: `Batch ${batchId} created, ${userIds.length} users dispatched via Service Bindings`,
			batchId,
			users: userIds.length
		});
	} catch (error) {
		// Log detailed error server-side
		console.error('[Manual] Trigger failed:', error);
		// Return generic error to client (don't leak details)
		return c.json({ error: 'Cron job failed' }, 500);
	}
});

// Mount user routes
app.route('/api/user', userRoutes);

// Mount cron routes (distributed queue processing)
app.route('/api/cron', cronRoutes);

// 404 handler
app.notFound((c) => {
	return c.json({ error: 'Not found' }, 404);
});

// Error handler
app.onError((err, c) => {
	// Log error details server-side only
	console.error('[ERROR]', {
		message: err.message,
		stack: err.stack,
		url: c.req.url,
		method: c.req.method,
	});
	
	// Return generic error to client (don't leak details)
	return c.json({ error: 'Internal server error' }, 500);
});

// Export worker with both fetch and scheduled handlers
export default {
	fetch: app.fetch,
	async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
		console.log('[Scheduled] Cron trigger fired:', event.cron);

		try {
			// Query active users with GitHub PAT configured
			const usersResult = await env.DB.prepare(
				`SELECT id FROM users WHERE is_active = 1 AND github_pat IS NOT NULL`
			).all();

			const userIds = (usersResult.results || []).map((row: any) => row.id as string);

			if (userIds.length === 0) {
				console.log('[Scheduled] No active users to process');
				return;
			}

			console.log(`[Scheduled] Initializing batch for ${userIds.length} users`);

			// Initialize batch in queue
			const batchId = await initializeBatch(env, userIds);

			console.log(`[Scheduled] Batch ${batchId} initialized with ${userIds.length} users`);

			// Cleanup old batches (7+ days)
			ctx.waitUntil(
				cleanupOldBatches(env, 7)
					.then((deleted) => {
						if (deleted > 0) {
							console.log(`[Scheduled] Cleaned up ${deleted} old queue items`);
						}
					})
					.catch((error: Error) => {
						console.error('[Scheduled] Error cleaning up old batches:', error);
					})
			);

			// Trigger distributed processing via Service Bindings (env.SELF)
			// Each fetch = SEPARATE Worker instance! TRUE distributed! ✅
			console.log(`[Scheduled] Dispatching ${userIds.length} users via Service Bindings`);
			
			for (let i = 0; i < userIds.length; i++) {
				const queueItem = await getNextPendingUser(env);
				if (!queueItem) {
					console.log(`[Scheduled] No more pending users in queue`);
					break;
				}

				ctx.waitUntil(
					env.SELF.fetch('http://internal/api/cron/process-user', {
						method: 'POST',
						headers: {
							'X-Cron-Secret': env.SERVER_SECRET,
							'Content-Type': 'application/json',
						},
						body: JSON.stringify({
							queueId: queueItem.id,
							userId: queueItem.user_id,
						}),
					})
						.then((res) => {
							console.log(`[Scheduled] User ${queueItem.user_id} dispatched: ${res.status}`);
						})
						.catch((error: Error) => {
							console.error(`[Scheduled] User ${queueItem.user_id} dispatch failed:`, error);
						})
				);
			}
			
			console.log(`[Scheduled] All ${userIds.length} users dispatched for batch ${batchId}`);
		} catch (error) {
			console.error('[Scheduled] Error in cron job:', error);
		}
	},
};
