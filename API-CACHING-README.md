# API Request Optimization

This document outlines the implementation of API request caching to optimize the Flower Shop website's performance.

## Overview

Many data points in an e-commerce flower shop change infrequently (products, categories, etc.). To reduce unnecessary API calls and improve performance, a caching system has been implemented.

## Implementation Details

### 1. Caching System (`/src/lib/api-cache.ts`)

- Implements both memory and localStorage caching strategies
- Provides TTL (Time-To-Live) functionality to auto-expire cache entries
- Supports type-safe data retrieval and storage

### 2. Cached Repository (`/src/lib/repositories/cached-catalog.ts`) 

- Wraps the existing catalog repository with caching capabilities
- Configurable TTL values based on data type:
  - Categories: 24 hours (rarely change)
  - Flowers: 24 hours (rarely change)
  - Bouquets: 1 hour (may change more frequently)
  - Featured bouquets: 3 hours
  - Bouquet details: 2 hours

### 3. React Hooks & Provider

- Provider (`/src/providers/api-cache-provider.tsx`): Provides cache management context
- Hooks (`/src/hooks/use-cached-catalog.ts`): Easy-to-use React hooks for accessing cached data

## Usage Examples

```tsx
// In a component:
import { useCachedCatalog } from '@/hooks/use-cached-catalog';

function CategoryList() {
  const { useCategories } = useCachedCatalog();
  const { data: categories, isLoading, error } = useCategories();
  
  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error loading categories</p>;
  
  return (
    <ul>
      {categories?.map(category => (
        <li key={category.id}>{category.name}</li>
      ))}
    </ul>
  );
}
```

## Cache Invalidation

The cache automatically expires based on TTL values. You can manually clear the cache using:

```tsx
import { useApiCache } from '@/providers/api-cache-provider';

function AdminPanel() {
  const { clearCache } = useApiCache();
  
  const handleClearCache = () => {
    // Clear all cache
    clearCache();
    // Or clear specific cache entry
    clearCache('categories:en');
  };
  
  return (
    <button onClick={handleClearCache}>Clear Cache</button>
  );
}
```

## Performance Benefits

- Reduced API calls to Supabase
- Faster page loads for returning visitors
- Lower server costs due to reduced database queries
- Better user experience through faster navigation

## Future Improvements

1. Add server-side caching with Redis for shared cache across users
2. Implement real-time invalidation when data changes in admin panel
3. Add more granular cache control options per data type 