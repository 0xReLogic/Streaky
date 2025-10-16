/**
 * CORS Middleware
 * Handles Cross-Origin Resource Sharing for frontend requests
 */

import { Context, Next } from 'hono';

const ALLOWED_ORIGINS = new Set([
  'http://localhost:3000',
  'https://streaky.vercel.app',
  // Add production domain when available
]);

/**
 * CORS middleware for API routes
 */
export async function corsMiddleware(c: Context, next: Next) {
  const origin = c.req.header('Origin');

  // Check if origin is allowed
  if (origin && ALLOWED_ORIGINS.has(origin)) {
    c.header('Access-Control-Allow-Origin', origin);
  }

  c.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  c.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  c.header('Access-Control-Max-Age', '86400');

  // Handle preflight requests
  if (c.req.method === 'OPTIONS') {
    return new Response(null, { status: 204 });
  }

  await next();
}
