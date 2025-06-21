import { useEffect, useState } from 'react';

// Simple in-memory cache system with TTL (Time To Live)
interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

interface CacheOptions {
  ttlMinutes?: number; // Time to live in minutes
  storageType?: 'memory' | 'localStorage';
}

// Global in-memory cache store
const memoryCache: Record<string, CacheEntry<any>> = {};

/**
 * Utility for caching API responses with configurable TTL
 */
export const ApiCache = {
  /**
   * Get data from cache if available and not expired
   */
  get<T>(key: string, options: CacheOptions = {}): T | null {
    const { storageType = 'memory' } = options;
    
    if (storageType === 'localStorage' && typeof window !== 'undefined') {
      try {
        const item = localStorage.getItem(`api-cache:${key}`);
        if (item) {
          const parsed = JSON.parse(item) as CacheEntry<T>;
          if (parsed.expiresAt > Date.now()) {
            return parsed.data;
          } else {
            // Clear expired localStorage item
            localStorage.removeItem(`api-cache:${key}`);
          }
        }
      } catch (error) {
        console.error('Error reading from localStorage cache:', error);
      }
    } else {
      // Use memory cache
      const entry = memoryCache[key];
      if (entry && entry.expiresAt > Date.now()) {
        return entry.data;
      } else if (entry) {
        // Clear expired memory cache
        delete memoryCache[key];
      }
    }
    
    return null;
  },
  
  /**
   * Save data to cache with TTL
   */
  set<T>(key: string, data: T, options: CacheOptions = {}): void {
    const { ttlMinutes = 60, storageType = 'memory' } = options;
    const expiresAt = Date.now() + (ttlMinutes * 60 * 1000);
    const entry: CacheEntry<T> = { data, expiresAt };
    
    if (storageType === 'localStorage' && typeof window !== 'undefined') {
      try {
        localStorage.setItem(`api-cache:${key}`, JSON.stringify(entry));
      } catch (error) {
        console.error('Error writing to localStorage cache:', error);
      }
    } else {
      // Use memory cache
      memoryCache[key] = entry;
    }
  },
  
  /**
   * Clear a specific cache entry
   */
  clear(key: string, options: CacheOptions = {}): void {
    const { storageType = 'memory' } = options;
    
    if (storageType === 'localStorage' && typeof window !== 'undefined') {
      localStorage.removeItem(`api-cache:${key}`);
    }
    
    delete memoryCache[key];
  },
  
  /**
   * Clear all cache entries
   */
  clearAll(options: CacheOptions = {}): void {
    const { storageType = 'memory' } = options;
    
    if (storageType === 'localStorage' && typeof window !== 'undefined') {
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('api-cache:')) {
          localStorage.removeItem(key);
        }
      });
    }
    
    // Clear all memory cache
    Object.keys(memoryCache).forEach(key => {
      delete memoryCache[key];
    });
  }
};

/**
 * React hook for cached API data
 */
export function useCachedData<T>(
  key: string, 
  fetchFn: () => Promise<T>,
  options: CacheOptions & { enabled?: boolean } = {}
): {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<T>;
} {
  const { ttlMinutes = 60, storageType = 'memory', enabled = true } = options;
  const [data, setData] = useState<T | null>(ApiCache.get<T>(key, { storageType }));
  const [isLoading, setIsLoading] = useState(!data && enabled);
  const [error, setError] = useState<Error | null>(null);
  
  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetchFn();
      setData(result);
      ApiCache.set(key, result, { ttlMinutes, storageType });
      return result;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    if (!data && enabled) {
      fetchData().catch(console.error);
    }
  }, [key, enabled]);
  
  return {
    data,
    isLoading,
    error,
    refetch: fetchData
  };
} 