import { NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/utils/supabase/server';
import { ApiLogger } from '@/utils/api-logger';
import { toUUID } from '@/utils/uuid';

// Create an API logger for bouquet detail endpoints
const logger = new ApiLogger('BouquetDetailAPI');

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const bouquetId = toUUID(params.id);
  const startTime = logger.request('GET', `/api/bouquets/${bouquetId}`);
  
  try {
    const supabase = await createClient();
    
    // Get bouquet with its details
    const { data, error } = await supabase
      .from('bouquets')
      .select(`
        *,
        bouquet_flowers (
          id,
          flower_id,
          quantity,
          flowers (*)
        )
      `)
      .eq('id', bouquetId)
      .single();
    
    if (error) {
      logger.error('GET', `/api/bouquets/${bouquetId}`, error);
      return NextResponse.json({ error: error.message }, { status: error.code === 'PGRST116' ? 404 : 500 });
    }
    
    // Log the successful response
    logger.response('GET', `/api/bouquets/${bouquetId}`, 200, startTime, data);
    
    return NextResponse.json(data);
  } catch (error) {
    // Log any unexpected errors
    logger.error('GET', `/api/bouquets/${bouquetId}`, error);
    return NextResponse.json({ error: 'Failed to fetch bouquet details' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const bouquetId = toUUID(params.id);
  const startTime = logger.request('PUT', `/api/bouquets/${bouquetId}`);
  
  try {
    // Parse request body
    const updateData = await request.json();
    
    // Use admin client for operations requiring admin privileges
    const supabase = await createAdminClient();
    
    // Extract flowers and tags data from the request if present
    const { flowers, tags, ...bouquetData } = updateData;
    
    // Start a transaction by using multiple operations
    
    // 1. Update the bouquet details (only if we have bouquet data to update)
    let updatedBouquet = null;
    
    if (Object.keys(bouquetData).length > 0) {
      const { data, error: bouquetError } = await supabase
        .from('bouquets')
        .update(bouquetData)
        .eq('id', bouquetId)
        .select()
        .single();
      
      if (bouquetError) {
        logger.error('PUT', `/api/bouquets/${bouquetId}`, bouquetError, { bouquetData });
        return NextResponse.json({ error: bouquetError.message }, { status: 500 });
      }
      
      updatedBouquet = data;
    } else {
      // If we're only updating tags or flowers, fetch the current bouquet data
      const { data, error: fetchError } = await supabase
        .from('bouquets')
        .select()
        .eq('id', bouquetId)
        .single();
        
      if (fetchError) {
        logger.error('PUT', `/api/bouquets/${bouquetId}`, fetchError);
        return NextResponse.json({ error: fetchError.message }, { status: fetchError.code === 'PGRST116' ? 404 : 500 });
      }
      
      updatedBouquet = data;
    }
    
    // 2. If we have flowers data, update the bouquet flowers
    if (flowers && Array.isArray(flowers) && flowers.length > 0) {
      // First, remove all existing flower associations
      const { error: deleteError } = await supabase
        .from('bouquet_flowers')
        .delete()
        .eq('bouquet_id', bouquetId);
      
      if (deleteError) {
        logger.error('PUT', `/api/bouquets/${bouquetId}/flowers`, deleteError);
        return NextResponse.json({ error: deleteError.message }, { status: 500 });
      }
      
      // Then add the new flower associations
      const bouquetFlowers = flowers.map((flower: any) => ({
        bouquet_id: bouquetId,
        flower_id: toUUID(flower.id),
        quantity: flower.quantity
      }));
      
      const { error: insertError } = await supabase
        .from('bouquet_flowers')
        .insert(bouquetFlowers);
      
      if (insertError) {
        logger.error('PUT', `/api/bouquets/${bouquetId}/flowers`, insertError, { bouquetFlowers });
        return NextResponse.json({ error: insertError.message }, { status: 500 });
      }
    }
    
    // 3. If we have tags data, update the bouquet tags
    if (tags && Array.isArray(tags) && tags.length > 0) {
      // First, remove all existing tag associations
      const { error: deleteTagsError } = await supabase
        .from('bouquet_tags')
        .delete()
        .eq('bouquet_id', bouquetId);
      
      if (deleteTagsError) {
        logger.error('PUT', `/api/bouquets/${bouquetId}/tags`, deleteTagsError);
        return NextResponse.json({ error: deleteTagsError.message }, { status: 500 });
      }
      
      // Then add the new tag associations
      const bouquetTags = tags.map((tag: any) => ({
        bouquet_id: bouquetId,
        tag_id: typeof tag === 'string' ? tag : tag.id
      }));
      
      const { error: insertTagsError } = await supabase
        .from('bouquet_tags')
        .insert(bouquetTags);
      
      if (insertTagsError) {
        logger.error('PUT', `/api/bouquets/${bouquetId}/tags`, insertTagsError, { bouquetTags });
        return NextResponse.json({ error: insertTagsError.message }, { status: 500 });
      }
    }
    
    // Log the successful response
    logger.response('PUT', `/api/bouquets/${bouquetId}`, 200, startTime, updatedBouquet);
    
    return NextResponse.json(updatedBouquet);
  } catch (error) {
    // Log any unexpected errors
    logger.error('PUT', `/api/bouquets/${bouquetId}`, error);
    return NextResponse.json({ error: 'Failed to update bouquet' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const bouquetId = toUUID(params.id);
  const startTime = logger.request('DELETE', `/api/bouquets/${bouquetId}`);
  
  try {
    const supabase = await createAdminClient();
    
    // First delete all flower associations
    const { error: flowersError } = await supabase
      .from('bouquet_flowers')
      .delete()
      .eq('bouquet_id', bouquetId);
    
    if (flowersError) {
      logger.error('DELETE', `/api/bouquets/${bouquetId}/flowers`, flowersError);
      return NextResponse.json({ error: flowersError.message }, { status: 500 });
    }
    
    // Delete all tag associations
    const { error: tagsError } = await supabase
      .from('bouquet_tags')
      .delete()
      .eq('bouquet_id', bouquetId);
    
    if (tagsError) {
      logger.error('DELETE', `/api/bouquets/${bouquetId}/tags`, tagsError);
      return NextResponse.json({ error: tagsError.message }, { status: 500 });
    }
    
    // Then delete the bouquet
    const { error } = await supabase
      .from('bouquets')
      .delete()
      .eq('id', bouquetId);
    
    if (error) {
      logger.error('DELETE', `/api/bouquets/${bouquetId}`, error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    // Log the successful response
    logger.response('DELETE', `/api/bouquets/${bouquetId}`, 200, startTime);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    // Log any unexpected errors
    logger.error('DELETE', `/api/bouquets/${bouquetId}`, error);
    return NextResponse.json({ error: 'Failed to delete bouquet' }, { status: 500 });
  }
} 