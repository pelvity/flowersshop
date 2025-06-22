import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { ApiLogger } from '@/utils/api-logger';
import { toUUID } from '@/utils/uuid';
import { getCachedData, setCachedData } from '@/lib/redis';

// Create an API logger for tag endpoints
const logger = new ApiLogger('TagsAPI');

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const bouquetId = toUUID(params.id);
  const startTime = logger.request('GET', `/api/tags/bouquet/${bouquetId}`);
  
  try {
    // Create cache key for this bouquet's tags
    const cacheKey = `bouquet:${bouquetId}:tags`;
    console.log(`[API_TAGS] 🔍 Checking cache for key: "${cacheKey}"`);
    
    // Try to get data from cache first
    const cachedData = await getCachedData<any[]>(cacheKey);
    if (cachedData) {
      console.log(`[API_TAGS] ⚡ Serving bouquet tags from cache: ${bouquetId}`);
      logger.response('GET', `/api/tags/bouquet/${bouquetId}`, 200, startTime, cachedData);
      return NextResponse.json(cachedData);
    }
    
    console.log(`[API_TAGS] 🔄 Cache miss, fetching bouquet tags from database: ${bouquetId}`);
    
    // If not in cache, fetch from database
    const supabase = await createClient();
    
    // First get the tag IDs for this bouquet
    const { data: bouquetTags, error: bouquetTagsError } = await supabase
      .from('bouquet_tags')
      .select('tag_id')
      .eq('bouquet_id', bouquetId);
    
    if (bouquetTagsError) {
      logger.error('GET', `/api/tags/bouquet/${bouquetId}`, bouquetTagsError);
      return NextResponse.json({ error: bouquetTagsError.message }, { status: 500 });
    }
    
    // If no tags found, return empty array
    if (!bouquetTags || bouquetTags.length === 0) {
      logger.response('GET', `/api/tags/bouquet/${bouquetId}`, 200, startTime, []);
      return NextResponse.json([]);
    }
    
    // Extract tag IDs
    const tagIds = bouquetTags.map(bt => bt.tag_id);
    
    // Get the tag details
    const { data: tags, error: tagsError } = await supabase
      .from('tags')
      .select('*')
      .in('id', tagIds);
    
    if (tagsError) {
      logger.error('GET', `/api/tags/bouquet/${bouquetId}`, tagsError);
      return NextResponse.json({ error: tagsError.message }, { status: 500 });
    }
    
    // Store in cache for future requests (30 minutes TTL)
    console.log(`[API_TAGS] 💾 Storing bouquet tags in cache with key "${cacheKey}"`);
    await setCachedData(cacheKey, tags, 30 * 60);
    
    logger.response('GET', `/api/tags/bouquet/${bouquetId}`, 200, startTime, tags);
    return NextResponse.json(tags || []);
  } catch (error) {
    logger.error('GET', `/api/tags/bouquet/${bouquetId}`, error);
    return NextResponse.json({ error: 'Failed to fetch tags for bouquet' }, { status: 500 });
  }
} 