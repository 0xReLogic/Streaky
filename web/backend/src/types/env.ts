/**
 * Cloudflare Worker Environment Bindings
 * These types define the environment variables and bindings available in the Worker
 */

export interface Env {
  // D1 Database binding
  DB: D1Database;

  // Environment variables (secrets)
  ENCRYPTION_KEY: string;
  NEXTAUTH_SECRET: string;

  // Optional: KV namespace for caching (can be added later for better performance)
  // CACHE: KVNamespace;
}
