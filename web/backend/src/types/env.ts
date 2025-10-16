/**
 * Cloudflare Worker Environment Bindings
 * These types define the environment variables and bindings available in the Worker
 */

export interface Env {
  // D1 Database binding
  DB: D1Database;

  // Environment variables (secrets)
  ENCRYPTION_KEY: string;
  GITHUB_CLIENT_ID: string;
  GITHUB_CLIENT_SECRET: string;

  // Optional: KV namespace for caching (will be added in Task 4)
  // CACHE: KVNamespace;
}
