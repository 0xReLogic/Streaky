/**
 * Rate Limiting Middleware
 * Simple in-memory rate limiting for Cloudflare Workers
 */

import { Context, Next } from 'hono';

interface RateLimitEntry {
	count: number;
	resetAt: number;
}

// In-memory store (resets on Worker restart - good enough for Cloudflare Workers)
const rateLimitStore = new Map<string, RateLimitEntry>();

interface RateLimitConfig {
	maxRequests: number;
	windowSeconds: number;
	keyExtractor?: (c: Context) => string;
}

export function rateLimiter(config: RateLimitConfig) {
	const {
		maxRequests,
		windowSeconds,
		keyExtractor = (c: Context) => c.req.header('CF-Connecting-IP') || c.req.header('X-Forwarded-For') || 'anonymous',
	} = config;

	return async (c: Context, next: Next) => {
		const key = keyExtractor(c);
		const now = Date.now();
		const windowMs = windowSeconds * 1000;

		let entry = rateLimitStore.get(key);

		if (!entry || now >= entry.resetAt) {
			entry = { count: 0, resetAt: now + windowMs };
			rateLimitStore.set(key, entry);
		}

		entry.count++;

		// Add rate limit headers
		c.header('X-RateLimit-Limit', maxRequests.toString());
		c.header('X-RateLimit-Remaining', Math.max(0, maxRequests - entry.count).toString());
		c.header('X-RateLimit-Reset', Math.floor(entry.resetAt / 1000).toString());

		if (entry.count > maxRequests) {
			const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
			c.header('Retry-After', retryAfter.toString());
			
			return c.json({ error: 'Too many requests', retryAfter }, 429);
		}

		await next();
	};
}

// Pre-configured limiters
export const RateLimiters = {
	api: rateLimiter({ maxRequests: 60, windowSeconds: 60 }), // 60 req/min
	auth: rateLimiter({ maxRequests: 5, windowSeconds: 300 }), // 5 req/5min
	strict: rateLimiter({ maxRequests: 10, windowSeconds: 60 }), // 10 req/min
};
