/**
 * Cache Manager Utility
 * 
 * This utility handles cache invalidation for the application.
 * When data is modified in admin panels, we need to invalidate 
 * the corresponding cache entries to ensure users see fresh data.
 */

/**
 * Invalidate specific cache keys
 * This function sends a request to the API to delete specific cache keys
 * 
 * @param keys - Array of cache keys to invalidate
 * @returns Promise that resolves when invalidation is complete
 */
export async function invalidateCache(keys: string[]): Promise<void> {
  try {
    const response = await fetch('/api/cache/invalidate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ keys }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Cache invalidation failed:', errorData);
      throw new Error('Failed to invalidate cache');
    }
  } catch (error) {
    console.error('Error invalidating cache:', error);
    // We don't want to break the main flow if cache invalidation fails
    // Just log the error and continue
  }
}

/**
 * Invalidate cache keys matching a pattern
 * 
 * @param patterns - Array of patterns to match (e.g., 'bouquet:*', 'category:*:bouquets')
 * @returns Promise that resolves when invalidation is complete
 */
export async function invalidateCachePatterns(patterns: string[]): Promise<void> {
  try {
    const response = await fetch('/api/cache/invalidate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ patterns }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Cache pattern invalidation failed:', errorData);
      throw new Error('Failed to invalidate cache patterns');
    }
  } catch (error) {
    console.error('Error invalidating cache patterns:', error);
    // We don't want to break the main flow if cache invalidation fails
    // Just log the error and continue
  }
}

/**
 * Invalidate all cache for a specific resource type
 * 
 * @param resourceType - Type of resource (e.g., 'bouquets', 'categories')
 * @returns Promise that resolves when invalidation is complete
 */
export async function invalidateResourceCache(resourceType: string): Promise<void> {
  return invalidateCachePatterns([`${resourceType}:*`]);
} 