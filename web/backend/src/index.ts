/**
 * Streaky Backend API
 * Cloudflare Worker with Hono framework
 */

import { Hono } from 'hono';
import { Env } from './types/env';
import { corsMiddleware } from './middleware/cors';
import userRoutes from './routes/user';

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

export default app;
