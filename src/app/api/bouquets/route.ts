import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { ApiLogger } from '@/utils/api-logger';
import { generateUUID, toUUID } from '@/utils/uuid';

// Create an API logger specifically for bouquets endpoints
const logger = new ApiLogger('BouquetsAPI');

export async function GET(request: Request) {
  // Extract query parameters if needed
  const url = new URL(request.url);
  const featured = url.searchParams.get('featured') === 'true';
  const limit = parseInt(url.searchParams.get('limit') || '100');
  
  // Log the request
  const startTime = logger.request('GET', '/api/bouquets', { featured, limit });
  
  try {
    // Create Supabase client
    const supabase = await createClient();
    
    // Build the query
    let query = supabase.from('bouquets').select('*');
    
    // Apply filters if provided
    if (featured) {
      query = query.eq('featured', true);
    }
    
    // Apply limit
    query = query.limit(limit);
    
    // Execute the query
    const { data, error } = await query;
    
    if (error) {
      logger.error('GET', '/api/bouquets', error, { featured, limit });
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    // Log the successful response
    logger.response('GET', '/api/bouquets', 200, startTime, data);
    
    return NextResponse.json(data);
  } catch (error) {
    // Log any unexpected errors
    logger.error('GET', '/api/bouquets', error, { featured, limit });
    return NextResponse.json(
      { error: 'Failed to fetch bouquets' }, 
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const startTime = logger.request('POST', '/api/bouquets');
  
  try {
    // Parse the request body
    const bouquetData = await request.json();
    
    // Create Supabase client
    const supabase = await createClient();
    
    // Extract flowers from bouquet data if present
    const { flowers, ...bouquetDetails } = bouquetData;
    
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
      
      // Prepare bouquet flowers data with proper UUIDs
      const bouquetFlowers = flowers.map((flower: any) => ({
        bouquet_id: bouquetId,
        flower_id: toUUID(flower.id),
        quantity: flower.quantity
      }));
      
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