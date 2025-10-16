/**
 * Authentication Middleware
 * Validates session tokens and attaches user info to context
 */

import { Context, Next } from 'hono';
import { Env } from '../types/env';

export interface AuthUser {
  id: string;
  githubUsername: string;
}

/**
 * Simple authentication middleware
 * In production, this should validate JWT tokens from NextAuth.js
 */
export async function authMiddleware(c: Context<{ Bindings: Env }>, next: Next) {
  const authHeader = c.req.header('Authorization');

  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  // Note: JWT validation will be implemented when integrating with NextAuth.js
  // For now, we accept any Bearer token for development
  // In production, validate JWT with NextAuth secret

  try {
    // Placeholder: In real implementation, decode and validate JWT
    // const token = authHeader.substring(7);
    // const decoded = await verifyJWT(token, c.env.NEXTAUTH_SECRET);
    
    await next();
  } catch (error) {
    console.error('Auth error:', error);
    return c.json({ error: 'Invalid token' }, 401);
  }
}

/**
 * Get authenticated user from context
 */
export function getAuthUser(c: Context): AuthUser | null {
  return c.get('user') as AuthUser | null;
}
