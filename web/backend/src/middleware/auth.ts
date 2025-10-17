/**
 * Authentication Middleware
 * Validates JWT session tokens from NextAuth.js and attaches user info to context
 */

import { Context, Next } from 'hono';
import { Env } from '../types/env';

export interface AuthUser {
	id: string;
	githubUsername: string;
	email?: string;
}

interface JWTPayload {
	sub?: string;
	login?: string;
	email?: string;
	iat?: number;
	exp?: number;
}

/**
 * Decode and verify JWT token from NextAuth.js
 */
async function verifyJWT(token: string, secret: string): Promise<JWTPayload> {
	// Import Web Crypto API key
	const encoder = new TextEncoder();
	const keyData = encoder.encode(secret);

	const key = await crypto.subtle.importKey('raw', keyData, { name: 'HMAC', hash: 'SHA-256' }, false, ['verify']);

	// Split JWT into parts
	const parts = token.split('.');
	if (parts.length !== 3) {
		throw new Error('Invalid JWT format');
	}

	const [headerB64, payloadB64, signatureB64] = parts;

	// Verify signature
	const data = encoder.encode(`${headerB64}.${payloadB64}`);
	const signature = base64UrlDecode(signatureB64);

	const isValid = await crypto.subtle.verify('HMAC', key, signature, data);

	if (!isValid) {
		throw new Error('Invalid JWT signature');
	}

	// Decode payload
	const payloadJson = atob(payloadB64.replaceAll('-', '+').replaceAll('_', '/'));
	const payload: JWTPayload = JSON.parse(payloadJson);

	// Check expiration
	if (payload.exp && payload.exp < Date.now() / 1000) {
		throw new Error('JWT token expired');
	}

	return payload;
}

/**
 * Decode base64url string to Uint8Array
 */
function base64UrlDecode(str: string): Uint8Array {
	const base64 = str.replaceAll('-', '+').replaceAll('_', '/');
	const binary = atob(base64);
	const bytes = new Uint8Array(binary.length);
	for (let i = 0; i < binary.length; i++) {
		bytes[i] = binary.codePointAt(i) || 0;
	}
	return bytes;
}

/**
 * Authentication middleware
 * Validates JWT tokens from NextAuth.js and attaches user info to context
 */
export async function authMiddleware(c: Context<{ Bindings: Env; Variables: { user: AuthUser } }>, next: Next) {
	// Check for server-to-server authentication (from Next.js proxy)
	const serverSecret = c.req.header('X-Server-Secret');
	const userId = c.req.header('X-User-ID');
	const username = c.req.header('X-User-Username');

	if (serverSecret && userId && username) {
		// Verify server secret to prevent spoofing
		if (c.env.SERVER_SECRET && serverSecret === c.env.SERVER_SECRET) {
			const user: AuthUser = {
				id: userId,
				githubUsername: username,
				email: c.req.header('X-User-Email'),
			};
			c.set('user', user);
			await next();
			return;
		} else {
			return c.json({ error: 'Invalid server secret' }, 401);
		}
	}

	// Fallback: JWT token authentication (for direct API calls)
	const authHeader = c.req.header('Authorization');

	if (!authHeader?.startsWith('Bearer ')) {
		return c.json({ error: 'Unauthorized - Missing authentication' }, 401);
	}

	const token = authHeader.substring(7);

	try {
		// SECURITY: NEXTAUTH_SECRET is REQUIRED for JWT verification
		if (!c.env.NEXTAUTH_SECRET) {
			console.error('[SECURITY] NEXTAUTH_SECRET not configured - JWT authentication disabled');
			return c.json({ error: 'Server configuration error' }, 500);
		}

		// Verify JWT signature - NO fallback to unverified tokens
		const decoded = await verifyJWT(token, c.env.NEXTAUTH_SECRET);

		// Validate required fields
		if (!decoded.sub) {
			return c.json({ error: 'Invalid token payload - missing user ID' }, 401);
		}

		if (!decoded.login) {
			return c.json({ error: 'Invalid token payload - missing GitHub username' }, 401);
		}

		// Attach user info to context
		const user: AuthUser = {
			id: decoded.sub,
			githubUsername: decoded.login,
			email: decoded.email,
		};

		c.set('user', user);

		await next();
	} catch (error) {
		// Don't leak error details to client
		console.error('[Auth] Token verification failed:', error instanceof Error ? error.message : error);
		return c.json({ error: 'Authentication failed' }, 401);
	}
}

/**
 * Get authenticated user from context
 */
export function getAuthUser(c: Context<{ Bindings: Env; Variables: { user: AuthUser } }>): AuthUser | null {
	return c.get('user') || null;
}
