/**
 * Streaky Backend API
 * Cloudflare Worker with Hono framework
 */

import { Hono } from 'hono';
import { Env } from './types/env';
import { corsMiddleware } from './middleware/cors';
import userRoutes from './routes/user';
import { checkAllUsersStreaks } from './cron/streak-checker';

const app = new Hono<{ Bindings: Env }>();

// Apply CORS middleware
app.use('*', corsMiddleware);

// Health check endpoint
app.get('/', (c) => {
  return c.json({
    name: 'Streaky API',
    version: '1.0.0',
    status: 'healthy',
  });
});

// Mount user routes
app.route('/api/user', userRoutes);

// 404 handler
app.notFound((c) => {
  return c.json({ error: 'Not found' }, 404);
});

// Error handler
app.onError((err, c) => {
  console.error('Unhandled error:', err);
  return c.json({ error: 'Internal server error' }, 500);
});

// Export worker with both fetch and scheduled handlers
export default {
  fetch: app.fetch,
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
    console.log('[Scheduled] Cron trigger fired:', event.cron);
    
    // Use waitUntil to ensure the async operation completes
    ctx.waitUntil(
      checkAllUsersStreaks(env).catch((error) => {
        console.error('[Scheduled] Error in cron job:', error);
      })
    );
  },
};
