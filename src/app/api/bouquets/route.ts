import { NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/utils/supabase/server';
import { ApiLogger } from '@/utils/api-logger';
import { generateUUID, toUUID, isValidUUID } from '@/utils/uuid';
import { getCachedData, setCachedData } from '@/lib/redis';
import { Bouquet, BouquetMedia } from '@/lib/supabase';

// Create an API logger specifically for bouquets endpoints
const logger = new ApiLogger('BouquetsAPI');

// Define types for our API data structures
interface BouquetFlowerData {
  id: string;
  flower_id: string;
  name: string;
  quantity: number;
}

export async function GET(request: Request) {
  const startTime = logger.request('GET', '/api/bouquets');
  
  try {
    const url = new URL(request.url);
    const featured = url.searchParams.get('featured') === 'true';
    const categoryId = url.searchParams.get('category');
    const limit = url.searchParams.get('limit');
    const withFlowers = url.searchParams.get('withFlowers') !== 'false'; // Default to true
  
    // Create cache key based on query parameters
    let cacheKey = 'bouquets:list';
    if (featured) cacheKey = 'featured:bouquets';
    if (categoryId) cacheKey += `:category:${categoryId}`;
    if (limit) cacheKey += `:limit:${limit}`;
    if (withFlowers) cacheKey += ':with-flowers';
    
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
    const { data: bouquets, error } = await query;
    
    if (error) {
      logger.error('GET', '/api/bouquets', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // If no bouquets or not requesting with flowers, just return the bouquets
    if (!bouquets || bouquets.length === 0 || !withFlowers) {
      // Store in cache for future requests (60 minutes TTL)
      console.log(`[API_BOUQUETS] 💾 Storing ${bouquets?.length || 0} bouquets in cache with key "${cacheKey}"`);
      await setCachedData(cacheKey, bouquets, 60 * 60);
      
      logger.response('GET', '/api/bouquets', 200, startTime, bouquets);
      return NextResponse.json(bouquets);
    }
    
    // If withFlowers is true, fetch flower information for each bouquet
    const bouquetIds = bouquets.map(b => b.id);
    
    // Fetch all bouquet-flower relationships with flower details
    const { data: allBouquetFlowers, error: flowersError } = await supabase
      .from('bouquet_flowers')
      .select(`
        id,
        bouquet_id,
        flower_id,
        quantity,
        flowers:flower_id(id, name)
      `)
      .in('bouquet_id', bouquetIds);
    
    if (flowersError) {
      logger.error('GET', '/api/bouquets/flowers', flowersError);
      // Continue with just the bouquets if flower fetch fails
    }
    
    // Fetch media for all bouquets in a single query
    const { data: allMedia, error: mediaError } = await supabase
      .from('bouquet_media')
      .select('*')
      .in('bouquet_id', bouquetIds)
      .order('display_order');
    
    if (mediaError) {
      logger.error('GET', '/api/bouquets/media', mediaError);
      // Continue execution even if media fetch fails
    }
    
    // Group media by bouquet_id
    const mediaByBouquetId: Record<string, BouquetMedia[]> = {};
    if (allMedia && allMedia.length > 0) {
      allMedia.forEach(media => {
        if (!mediaByBouquetId[media.bouquet_id]) {
          mediaByBouquetId[media.bouquet_id] = [];
        }
        mediaByBouquetId[media.bouquet_id].push(media);
      });
    }
    
    // Group flowers by bouquet_id
    const flowersByBouquetId: Record<string, BouquetFlowerData[]> = {};
    if (allBouquetFlowers && allBouquetFlowers.length > 0) {
      allBouquetFlowers.forEach(item => {
        if (!flowersByBouquetId[item.bouquet_id]) {
          flowersByBouquetId[item.bouquet_id] = [];
        }
        
        // Handle the nested flowers object safely
        let flowerName = 'Unknown Flower';
        try {
          // @ts-ignore - Ignore TypeScript errors for this specific line
          if (item.flowers && typeof item.flowers === 'object' && item.flowers.name) {
            // @ts-ignore
            flowerName = item.flowers.name;
          }
        } catch (e) {
          console.error('Error accessing flower name:', e);
        }
        
        flowersByBouquetId[item.bouquet_id].push({
          id: item.id,
          flower_id: item.flower_id,
          name: flowerName,
          quantity: item.quantity
        });
      });
    }
    
    // Add flower and media information to each bouquet
    const enhancedBouquets = bouquets.map(bouquet => {
      const bouquetMedia = mediaByBouquetId[bouquet.id] || [];
      
      // Find thumbnail - first priority is the one marked as thumbnail, then first in order
      const thumbnail = bouquetMedia.find(m => m.is_thumbnail) || bouquetMedia[0] || null;
      
      // Calculate image URL from the thumbnail if available
      let imageUrl = null;
      if (thumbnail) {
        if (thumbnail.file_url) {
          imageUrl = thumbnail.file_url;
        } else if (thumbnail.file_path) {
          // Use the utility function to get file URL from path
          const { getFileUrl } = require('@/utils/cloudflare-worker');
          imageUrl = getFileUrl(thumbnail.file_path);
        }
      } else {
        // Set a default placeholder if no media is available
        imageUrl = '/placeholder-bouquet.jpg';
      }
      
      return {
        ...bouquet,
        flowers: flowersByBouquetId[bouquet.id] || [],
        media: bouquetMedia,
        thumbnail,
        image: imageUrl
      };
    });
    
    // Store in cache for future requests (60 minutes TTL)
    console.log(`[API_BOUQUETS] 💾 Storing ${enhancedBouquets.length} bouquets with flowers in cache with key "${cacheKey}"`);
    await setCachedData(cacheKey, enhancedBouquets, 60 * 60);
    
    // Log the successful response
    logger.response('GET', '/api/bouquets', 200, startTime, enhancedBouquets);
    
    return NextResponse.json(enhancedBouquets);
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