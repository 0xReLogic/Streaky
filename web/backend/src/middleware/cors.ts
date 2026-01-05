/**
 * CORS Middleware
 * Handles Cross-Origin Resource Sharing for frontend requests
 */

import { Context, Next } from 'hono';

const ALLOWED_ORIGINS = new Set([
	'http://localhost:3000',
	'https://streakyy.vercel.app',
]);

/**
 * CORS middleware for API routes
 * SECURITY: Only allow explicitly whitelisted origins
 */
export async function corsMiddleware(c: Context, next: Next) {
	const origin = c.req.header('Origin');

	// SECURITY: Strict origin checking - NO wildcards
	if (origin && ALLOWED_ORIGINS.has(origin)) {
		c.header('Access-Control-Allow-Origin', origin);
		c.header('Vary', 'Origin');
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
