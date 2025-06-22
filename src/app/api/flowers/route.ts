import { NextResponse } from 'next/server';
import { FlowerRepository } from '@/lib/repositories/flower-repository';
import { ApiLogger } from '@/utils/api-logger';
import { getCachedData, setCachedData } from '@/lib/redis';

// Create an API logger for flower endpoints
const logger = new ApiLogger('FlowersAPI');

export async function GET(request: Request) {
  const startTime = logger.request('GET', '/api/flowers');
  
  try {
    // Parse query parameters
    const url = new URL(request.url);
    const includeColors = url.searchParams.get('includeColors') === 'true';
    
    // Create cache key based on query parameters
    const cacheKey = includeColors ? 'flowers:with-colors' : 'flowers:all';
    console.log(`[API_FLOWERS] 🔍 Checking cache for key: "${cacheKey}"`);
    
    // Try to get data from cache first
    const cachedData = await getCachedData<any[]>(cacheKey);
    if (cachedData) {
      console.log(`[API_FLOWERS] ⚡ Serving ${cachedData.length} flowers from cache`);
      logger.response('GET', '/api/flowers', 200, startTime, cachedData);
      return NextResponse.json(cachedData);
    }
    
    console.log(`[API_FLOWERS] 🔄 Cache miss, fetching flowers from database`);
    
    // If not in cache, fetch from database
    const flowerRepo = new FlowerRepository();
    const flowers = await flowerRepo.getAll({ includeColors });
    
    // Store in cache for future requests (1 hour TTL)
    console.log(`[API_FLOWERS] 💾 Storing ${flowers.length} flowers in cache with key "${cacheKey}"`);
    await setCachedData(cacheKey, flowers, 60 * 60);
    
    logger.response('GET', '/api/flowers', 200, startTime, flowers);
    return NextResponse.json(flowers);
  } catch (error) {
    logger.error('GET', '/api/flowers', error);
    return NextResponse.json(
      { error: 'Failed to fetch flowers' },
      { status: 500 }
    );
  }
} 