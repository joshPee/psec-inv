import { neon } from '@neondatabase/serverless';
import { Pool } from 'pg';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  // During build time, we might not have DATABASE_URL
  // This is acceptable for static pages, but will fail at runtime if not set
  if (process.env.NODE_ENV === 'production') {
    console.warn('DATABASE_URL environment variable is not set');
  }
}

export const sql = databaseUrl ? neon(databaseUrl) : null as any;

// Optimized connection pool for better performance
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
});

// Simple in-memory cache for frequently accessed data
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 5000; // 5 seconds

export function getCached<T>(key: string): T | null {
  const cached = cache.get(key);
  if (!cached) return null;
  
  if (Date.now() - cached.timestamp > CACHE_TTL) {
    cache.delete(key);
    return null;
  }
  
  return cached.data as T;
}

export function setCached<T>(key: string, data: T): void {
  cache.set(key, { data, timestamp: Date.now() });
}

export function clearCache(pattern?: string): void {
  if (!pattern) {
    cache.clear();
    return;
  }
  
  for (const key of cache.keys()) {
    if (key.includes(pattern)) {
      cache.delete(key);
    }
  }
}
