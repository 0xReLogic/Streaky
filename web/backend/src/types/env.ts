/**
 * Cloudflare Worker Environment Bindings
 * These types define the environment variables and bindings available in the Worker
 */

export interface Env {
  // D1 Database binding
  DB: D1Database;

  // Analytics Engine binding
  ANALYTICS: AnalyticsEngineDataset;

  // Service Binding - Self-reference for distributed processing
  SELF: Fetcher;

  // Environment variables (secrets)
  ENCRYPTION_KEY: string;
  NEXTAUTH_SECRET: string;
  SERVER_SECRET: string; // Shared secret for server-to-server auth
  VPS_URL: string; // Rust VPS notification proxy URL
  VPS_SECRET: string; // Rust VPS API secret

  // Optional: KV namespace for caching (can be added later for better performance)
  // CACHE: KVNamespace;
}
