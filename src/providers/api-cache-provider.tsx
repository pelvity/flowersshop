'use client';

import { createContext, ReactNode, useContext, useEffect } from 'react';
import { ApiCache } from '@/lib/api-cache';

interface ApiCacheContextType {
  clearCache: (key?: string) => void;
}

const ApiCacheContext = createContext<ApiCacheContextType | null>(null);

interface ApiCacheProviderProps {
  children: ReactNode;
}

export function ApiCacheProvider({ children }: ApiCacheProviderProps) {
  // Clear expired cache entries on initial load
  useEffect(() => {
    // This will automatically check and remove expired items
    // from both localStorage and memory cache by attempting to retrieve them
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('api-cache:')) {
        ApiCache.get(key.replace('api-cache:', ''), { storageType: 'localStorage' });
      }
    });
  }, []);

  const clearCache = (key?: string) => {
    if (key) {
      ApiCache.clear(key);
    } else {
      ApiCache.clearAll();
    }
  };

  return (
    <ApiCacheContext.Provider value={{ clearCache }}>
      {children}
    </ApiCacheContext.Provider>
  );
}

export function useApiCache() {
  const context = useContext(ApiCacheContext);
  if (!context) {
    throw new Error('useApiCache must be used within an ApiCacheProvider');
  }
  return context;
} 