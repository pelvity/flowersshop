# Flower Shop Architecture

This document outlines the architecture of the Flower Shop application, focusing on the separation of concerns between client and server components.

## Architecture Overview

The application follows a clear separation of concerns:

1. **Database Layer**: Supabase PostgreSQL database
2. **Repository Layer**: Server-side code that interacts with the database
3. **API Layer**: Server-side endpoints that expose data to clients
4. **Client Layer**: Client-side components that consume the API

## Data Flow

```
Database (Supabase) → Repositories → API Endpoints → Client Components
```

With Redis caching at the API layer:

```
Database (Supabase) → Repositories → Redis Cache ↔ API Endpoints → Client Components
```

## Key Components

### Repository Layer (`src/lib/supabase.ts`, `src/lib/repositories/`)

- Server-side only code
- Direct database access through Supabase client
- Handles complex queries and data transformations
- Should never be imported directly by client components

### API Layer (`src/app/api/`)

- Server-side endpoints
- Uses repositories to fetch data
- Implements Redis caching
- Provides consistent error handling and logging
- Exposes data to client components via REST endpoints

### Client API Utility (`src/lib/api-client.ts`)

- Client-side utility for making API requests
- Provides typed functions for fetching data
- Handles error states and loading states
- Used by client components to fetch data

### Server Components (`src/app/[locale]/*/page.tsx`)

- Use API endpoints to fetch data via `api-client.ts`
- Pass data to client components as props
- Handle initial data loading

### Client Components (`src/components/client/`)

- Receive initial data from server components
- Use `api-client.ts` for additional data fetching
- Handle user interactions and state management

## Redis Caching

Redis caching is implemented at the API layer to improve performance:

1. API endpoints first check Redis for cached data
2. If data is not in cache, they fetch from the database via repositories
3. Fetched data is stored in Redis for future requests
4. Cache invalidation occurs when data is modified

## Best Practices

1. **Never import repositories in client components**
   - Always use the API client to fetch data

2. **Keep server-side logic in server components or API endpoints**
   - Database queries, caching, and data transformations should happen server-side

3. **Pass data to client components as props**
   - Server components should fetch initial data and pass it to client components

4. **Use client-side fetching only for dynamic updates**
   - Initial data should come from server components
   - Client-side fetching should be used only for updates after user interactions 