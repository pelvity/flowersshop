import { NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/utils/supabase/server';
import { ApiLogger } from '@/utils/api-logger';
import { generateUUID, toUUID, isValidUUID } from '@/utils/uuid';
import { getCachedData, setCachedData } from '@/lib/redis';

// Create an API logger specifically for bouquets endpoints
const logger = new ApiLogger('BouquetsAPI');

export async function GET(request: Request) {
  const startTime = logger.request('GET', '/api/bouquets');
  
  try {
  const url = new URL(request.url);
  const featured = url.searchParams.get('featured') === 'true';
    const categoryId = url.searchParams.get('category');
    const limit = url.searchParams.get('limit');
  
    // Create cache key based on query parameters
    let cacheKey = 'bouquets:list';
    if (featured) cacheKey = 'featured:bouquets';
    if (categoryId) cacheKey = `category:${categoryId}:bouquets`;
    if (limit) cacheKey += `:limit:${limit}`;
    
    console.log(`[API_BOUQUETS] 🔍 Checking cache for key: "${cacheKey}"`);
  
    // Try to get data from cache first
    const cachedData = await getCachedData<any[]>(cacheKey);
    if (cachedData) {
      console.log(`[API_BOUQUETS] ⚡ Serving ${cachedData.length} bouquets from cache`);
      logger.response('GET', '/api/bouquets', 200, startTime, cachedData);
      return NextResponse.json(cachedData);
    }
    
    // If not in cache, fetch from database
    console.log(`[API_BOUQUETS] 🔄 Cache miss, fetching from database`);
    const supabase = await createClient();
    
    let query = supabase.from('bouquets').select('*');
    
    // Apply filters
    if (featured) {
      query = query.eq('featured', true);
    }
    
    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }
    
    // Apply limit if specified
    if (limit && !isNaN(parseInt(limit))) {
      query = query.limit(parseInt(limit));
    }
    
    // Execute query
    const { data, error } = await query;
    
    if (error) {
      logger.error('GET', '/api/bouquets', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    // Store in cache for future requests (60 minutes TTL)
    console.log(`[API_BOUQUETS] 💾 Storing ${data?.length || 0} bouquets in cache with key "${cacheKey}"`);
    await setCachedData(cacheKey, data, 60 * 60);
    
    // Log the successful response
    logger.response('GET', '/api/bouquets', 200, startTime, data);
    
    return NextResponse.json(data);
  } catch (error) {
    // Log any unexpected errors
    logger.error('GET', '/api/bouquets', error);
    return NextResponse.json({ error: 'Failed to fetch bouquets' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const startTime = logger.request('POST', '/api/bouquets');
  
  try {
    // Parse the request body
    const bouquetData = await request.json();
    
    // Create Supabase admin client
    const supabase = await createAdminClient();
    
    // Extract flowers and tags from bouquet data if present
    const { flowers, tags, ...bouquetDetails } = bouquetData;
    
    // Validate category_id
    if (!bouquetDetails.category_id || !isValidUUID(bouquetDetails.category_id)) {
      const error = new Error('Valid category_id is required');
      logger.error('POST', '/api/bouquets', error, { bouquetData });
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    
    // Generate a UUID for the new bouquet
    const bouquetWithId = {
      ...bouquetDetails,
      id: generateUUID()
    };
    
    // Create the bouquet
    const { data, error } = await supabase
      .from('bouquets')
      .insert([bouquetWithId])
      .select()
      .single();
    
    if (error) {
      logger.error('POST', '/api/bouquets', error, { bouquetData });
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    // If flowers were included, add them to the bouquet
    if (flowers && Array.isArray(flowers) && flowers.length > 0) {
      const bouquetId = data.id;
      
      // Prepare bouquet flowers data with proper UUIDs, filtering out invalid ones
      const bouquetFlowers = flowers
        .filter((flower: any) => flower.id && isValidUUID(flower.id))
        .map((flower: any) => ({
          bouquet_id: bouquetId,
          flower_id: toUUID(flower.id),
          quantity: flower.quantity
        }));
      
      if (bouquetFlowers.length > 0) {
        // Insert the bouquet flowers
        const { error: flowersError } = await supabase
          .from('bouquet_flowers')
          .insert(bouquetFlowers);
        
        if (flowersError) {
          logger.error('POST', '/api/bouquets/flowers', flowersError, { bouquetFlowers });
          // We don't return an error here as the bouquet was created successfully
          // but we should log the error
        }
      }
    }
    
    // If tags were included, add them to the bouquet
    if (tags && Array.isArray(tags) && tags.length > 0) {
      const bouquetId = data.id;
      
      // Prepare bouquet tags data, filtering out invalid ones
      const bouquetTags = tags
        .map((tag: any) => (typeof tag === 'string' ? tag : tag.id))
        .filter((tagId: any) => tagId && isValidUUID(tagId))
        .map((tagId: string) => ({
          bouquet_id: bouquetId,
          tag_id: tagId
        }));
      
      if (bouquetTags.length > 0) {
        // Insert the bouquet tags
        const { error: tagsError } = await supabase
          .from('bouquet_tags')
          .insert(bouquetTags);
        
        if (tagsError) {
          logger.error('POST', '/api/bouquets/tags', tagsError, { bouquetTags });
          // We don't return an error here as the bouquet was created successfully
          // but we should log the error
        }
      }
    }
    
    // Log the successful response
    logger.response('POST', '/api/bouquets', 201, startTime, data);
    
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    // Log any unexpected errors
    logger.error('POST', '/api/bouquets', error);
    return NextResponse.json(
      { error: 'Failed to create bouquet' }, 
      { status: 500 }
    );
  }
} 