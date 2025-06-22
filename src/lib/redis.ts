import { Redis } from '@upstash/redis';

// Check if we're running on the server
const isServer = typeof window === 'undefined';

// Create a function to get the Redis client (lazy initialization)
let redisClient: Redis | null = null;

function getRedisClient(): Redis {
  // Only initialize Redis on the server
  if (isServer) {
    if (!redisClient) {
      redisClient = new Redis({
        url: process.env.KV_REST_API_URL || '',
        token: process.env.KV_REST_API_TOKEN || '',
      });
      
      // Log Redis initialization (server-side only)
      console.log('[REDIS_INIT] Redis client initialized with REST API configuration');
    }
    return redisClient;
  }
  
  // Return a mock Redis client for the browser that logs operations but doesn't execute them
  return new Proxy({} as Redis, {
    get: (target, prop) => {
      return (...args: any[]) => {
        console.log(`[REDIS_BROWSER] Operation "${String(prop)}" ignored in browser environment`);
        return Promise.resolve(null);
      };
    }
  });
}

/**
 * Get a value from Redis cache
 * 
 * @param key - Cache key
 * @returns Cached value or null if not found
 */
export async function getCachedData<T>(key: string): Promise<T | null> {
  // Skip actual Redis operations in the browser
  if (!isServer) {
    console.log(`[REDIS_GET] Skipped in browser: "${key}"`);
    return null;
  }
  
  console.log(`[REDIS_GET] Attempting to get key: "${key}"`);
  try {
    const startTime = performance.now();
    const redis = getRedisClient();
    const data = await redis.get(key);
    const endTime = performance.now();
    
    if (data) {
      console.log(`[REDIS_GET] ✅ CACHE_HIT: Key "${key}" retrieved in ${(endTime - startTime).toFixed(2)}ms`);
      return data as T;
    } else {
      console.log(`[REDIS_GET] ❌ CACHE_MISS: Key "${key}" not found`);
      return null;
    }
  } catch (error) {
    console.error(`[REDIS_GET] 🔴 ERROR: Failed to get cached data for key "${key}":`, error);
    return null;
  }
}

/**
 * Set a value in Redis cache with expiration
 * 
 * @param key - Cache key
 * @param data - Data to cache
 * @param ttlSeconds - Time to live in seconds (default: 1 hour)
 */
export async function setCachedData<T>(
  key: string,
  data: T,
  ttlSeconds: number = 3600
): Promise<void> {
  // Skip actual Redis operations in the browser
  if (!isServer) {
    console.log(`[REDIS_SET] Skipped in browser: "${key}"`);
    return;
  }
  
  console.log(`[REDIS_SET] Attempting to set key: "${key}" with TTL: ${ttlSeconds}s`);
  try {
    const startTime = performance.now();
    const redis = getRedisClient();
    await redis.set(key, data, { ex: ttlSeconds });
    const endTime = performance.now();
    
    console.log(`[REDIS_SET] ✅ CACHE_SET: Key "${key}" stored with TTL ${ttlSeconds}s in ${(endTime - startTime).toFixed(2)}ms`);
  } catch (error) {
    console.error(`[REDIS_SET] 🔴 ERROR: Failed to set cached data for key "${key}":`, error);
  }
}

/**
 * Delete a specific key from Redis cache
 * 
 * @param key - Cache key to delete
 */
export async function invalidateCacheKey(key: string): Promise<void> {
  // Skip actual Redis operations in the browser
  if (!isServer) {
    console.log(`[REDIS_DEL] Skipped in browser: "${key}"`);
    return;
  }
  
  console.log(`[REDIS_DEL] Attempting to delete key: "${key}"`);
  try {
    const startTime = performance.now();
    const redis = getRedisClient();
    const result = await redis.del(key);
    const endTime = performance.now();
    
    console.log(`[REDIS_DEL] ✅ CACHE_INVALIDATE: Key "${key}" deleted (${result === 1 ? 'existed' : 'did not exist'}) in ${(endTime - startTime).toFixed(2)}ms`);
  } catch (error) {
    console.error(`[REDIS_DEL] 🔴 ERROR: Failed to delete cache key "${key}":`, error);
  }
}

/**
 * Delete multiple keys from Redis cache
 * 
 * @param keys - Array of cache keys to delete
 */
export async function invalidateMultipleKeys(keys: string[]): Promise<void> {
  // Skip actual Redis operations in the browser
  if (!isServer) {
    console.log(`[REDIS_DEL_MULTI] Skipped in browser: ${keys.length} keys`);
    return;
  }
  
  console.log(`[REDIS_DEL_MULTI] Attempting to delete ${keys.length} keys`);
  try {
    if (keys.length > 0) {
      const startTime = performance.now();
      const redis = getRedisClient();
      // Delete keys one by one since Upstash Redis doesn't support array for del
      const results = await Promise.all(keys.map(key => redis.del(key)));
      const endTime = performance.now();
      
      const deletedCount = results.filter(r => r === 1).length;
      console.log(`[REDIS_DEL_MULTI] ✅ CACHE_INVALIDATE_MULTIPLE: ${deletedCount}/${keys.length} keys deleted in ${(endTime - startTime).toFixed(2)}ms`);
    }
  } catch (error) {
    console.error(`[REDIS_DEL_MULTI] 🔴 ERROR: Failed to delete multiple cache keys:`, error);
  }
}

/**
 * Delete keys matching a pattern
 * 
 * @param pattern - Pattern to match keys (e.g., "bouquet:*")
 */
export async function invalidateByPattern(pattern: string): Promise<void> {
  // Skip actual Redis operations in the browser
  if (!isServer) {
    console.log(`[REDIS_DEL_PATTERN] Skipped in browser: "${pattern}"`);
    return;
  }
  
  console.log(`[REDIS_DEL_PATTERN] Attempting to delete keys matching pattern: "${pattern}"`);
  try {
    const startTime = performance.now();
    const redis = getRedisClient();
    const keys = await redis.keys(pattern);
    
    if (keys.length > 0) {
      // Delete keys one by one since Upstash Redis doesn't support array for del
      const results = await Promise.all(keys.map(key => redis.del(key)));
      const endTime = performance.now();
      
      const deletedCount = results.filter(r => r === 1).length;
      console.log(`[REDIS_DEL_PATTERN] ✅ CACHE_INVALIDATE_PATTERN: Pattern "${pattern}" matched ${keys.length} keys, deleted ${deletedCount} in ${(endTime - startTime).toFixed(2)}ms`);
    } else {
      const endTime = performance.now();
      console.log(`[REDIS_DEL_PATTERN] ⚠️ CACHE_INVALIDATE_PATTERN: Pattern "${pattern}" matched 0 keys in ${(endTime - startTime).toFixed(2)}ms`);
    }
  } catch (error) {
    console.error(`[REDIS_DEL_PATTERN] 🔴 ERROR: Failed to delete keys by pattern "${pattern}":`, error);
  }
}

// Try to verify Redis connection on module load - but only on the server
if (isServer) {
  (async () => {
    try {
      console.log('[REDIS_INIT] Testing connection with Redis...');
      console.log(`[REDIS_INIT] REST URL: ${process.env.KV_REST_API_URL ? 'Set' : 'Not set'}`);
      console.log(`[REDIS_INIT] Token: ${process.env.KV_REST_API_TOKEN ? 'Set' : 'Not set'}`);
      
      const redis = getRedisClient();
      await redis.set('redis_connection_test', 'ok', { ex: 10 });
      const testResult = await redis.get('redis_connection_test');
      console.log(`[REDIS_INIT] ✅ Connection test successful: ${testResult === 'ok' ? 'PASSED' : 'FAILED'}`);
    } catch (error) {
      console.error('[REDIS_INIT] 🔴 Connection test failed:', error);
    }
  })();
}

/**
 * Export the Redis instance getter for direct access when needed
 */
export { getRedisClient as redis }; 