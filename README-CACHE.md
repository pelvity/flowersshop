# Caching Implementation for Flower Shop

This document explains how caching is implemented in the Flower Shop application using Upstash Redis on Vercel.

## Overview

We've implemented an Upstash Redis-based caching system that improves performance by storing frequently accessed data in memory. The cache is automatically invalidated whenever data is modified in the admin panel, ensuring users always see the most up-to-date information.

## How It Works

1. **Cache Storage**: We use Upstash Redis as our serverless cache store, which provides fast in-memory access to data without managing infrastructure.

2. **Cache Keys**: We use a structured naming convention for cache keys:
   - `bouquet:{id}` - Individual bouquet data
   - `bouquets:list` - List of all bouquets
   - `featured:bouquets` - List of featured bouquets
   - `category:{id}:bouquets` - Bouquets in a specific category

3. **Cache Invalidation**: When data is modified in the admin panel (create, update, delete), we automatically invalidate the relevant cache entries:
   - When a bouquet is updated, we delete its specific cache entry and any lists that might contain it
   - When a bouquet is deleted, we follow the same process

4. **Cache TTL**: All cache entries have a Time-To-Live (TTL) to prevent stale data, even if cache invalidation fails.

## Implementation Details

### Upstash Redis Client

We use the official Upstash Redis SDK (`@upstash/redis`) which provides:
- Serverless-friendly Redis client
- Edge-compatible API
- Type-safe methods for cache operations
- Support for pattern-based key operations

### API Endpoints

- **GET Endpoints**: Check the cache first before querying the database
- **PUT/POST/DELETE Endpoints**: Update the database and then invalidate relevant cache entries

### Admin Panel

The admin panel components are set up to trigger cache invalidation after successful data modifications:
- When updating a bouquet's details
- When deleting a bouquet
- When modifying bouquet tags, flowers, or other related data

## Environment Configuration

The following environment variables are automatically configured by the Vercel Upstash integration:
```
REDIS_URL="rediss://..."
KV_URL="rediss://..."
KV_REST_API_URL="https://..."
KV_REST_API_TOKEN="..."
KV_REST_API_READ_ONLY_TOKEN="..."
```

## Dependencies

- `@upstash/redis`: ^1.28.4

## Next Steps

1. The Redis integration is already set up through Vercel's Upstash integration
2. Run `pnpm install` to install the Upstash Redis dependency
3. Restart the application 