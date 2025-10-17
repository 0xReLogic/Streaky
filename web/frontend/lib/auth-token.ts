/**
 * Helper to get NextAuth.js JWT token from cookies
 * This token is used for backend API authentication
 */

import { cookies } from 'next/headers';

/**
 * Get the NextAuth.js session token from cookies (server-side only)
 */
export async function getSessionToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  
  // NextAuth.js stores the session token in a cookie
  // Cookie name format: __Secure-next-auth.session-token (production) or next-auth.session-token (development)
  const secureCookie = cookieStore.get('__Secure-next-auth.session-token');
  const devCookie = cookieStore.get('next-auth.session-token');
  
  return secureCookie?.value || devCookie?.value;
}

/**
 * Get the NextAuth.js session token from document.cookie (client-side only)
 */
export function getSessionTokenClient(): string | undefined {
  if (typeof document === 'undefined') {
    return undefined;
  }

  const cookies = document.cookie.split(';');
  
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === '__Secure-next-auth.session-token' || name === 'next-auth.session-token') {
      return value;
    }
  }
  
  return undefined;
}
