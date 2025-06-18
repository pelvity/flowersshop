import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

// Create a Supabase client with the service role key (server-side only)
const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const data = await request.json();
    const { 
      bouquet_id, 
      media_type, 
      file_path, 
      file_url, 
      file_name, 
      file_size, 
      content_type, 
      display_order, 
      is_thumbnail 
    } = data;

    // Validate required fields
    if (!bouquet_id || !file_path) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create a new media record using service role
    const { data: media, error } = await supabaseAdmin
      .from('bouquet_media')
      .insert({
        bouquet_id,
        media_type,
        file_path,
        file_url,
        file_name,
        file_size,
        content_type,
        display_order,
        is_thumbnail
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving media to database:', error);
      return NextResponse.json(
        { error: 'Failed to save media to database', details: error },
        { status: 500 }
      );
    }

    return NextResponse.json(media);
  } catch (error) {
    console.error('Unexpected error in media upload API:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Get the media ID from the URL
    const { searchParams } = new URL(request.url);
    const mediaId = searchParams.get('id');

    if (!mediaId) {
      return NextResponse.json(
        { error: 'Media ID is required' },
        { status: 400 }
      );
    }

    // First, get the media item to know what type it is and which bouquet it belongs to
    const { data: mediaItem, error: fetchError } = await supabaseAdmin
      .from('bouquet_media')
      .select('*')
      .eq('id', mediaId)
      .single();

    if (fetchError) {
      console.error('Error fetching media item:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch media item', details: fetchError },
        { status: 500 }
      );
    }

    // If this is an image, check if there are videos that depend on it
    if (mediaItem.media_type === 'image') {
      // Count all media for this bouquet
      const { data: mediaItems, error: countError } = await supabaseAdmin
        .from('bouquet_media')
        .select('*')
        .eq('bouquet_id', mediaItem.bouquet_id);

      if (countError) {
        console.error('Error counting media items:', countError);
        return NextResponse.json(
          { error: 'Failed to count media items', details: countError },
          { status: 500 }
        );
      }

      const imageCount = mediaItems.filter(item => item.media_type === 'image').length;
      const videoCount = mediaItems.filter(item => item.media_type === 'video').length;
      const isLastImage = imageCount === 1;

      // If this is the last image and there are videos, prevent deletion
      if (isLastImage && videoCount > 0) {
        return NextResponse.json(
          { 
            error: 'Cannot delete the last image when videos are present. At least one image is required as a thumbnail for videos.' 
          },
          { status: 400 }
        );
      }

      // If this was the thumbnail and we're deleting it, set another image as thumbnail
      if (mediaItem.is_thumbnail && imageCount > 1) {
        // Find another image to set as thumbnail
        const otherImages = mediaItems.filter(
          item => item.media_type === 'image' && item.id !== mediaId
        );
        
        if (otherImages.length > 0) {
          const { error: updateError } = await supabaseAdmin
            .from('bouquet_media')
            .update({ is_thumbnail: true })
            .eq('id', otherImages[0].id);
            
          if (updateError) {
            console.error('Error updating new thumbnail:', updateError);
            // Continue with deletion even if setting new thumbnail fails
          }
        }
      }
    }

    // Delete the media record
    const { error } = await supabaseAdmin
      .from('bouquet_media')
      .delete()
      .eq('id', mediaId);

    if (error) {
      console.error('Error deleting media from database:', error);
      return NextResponse.json(
        { error: 'Failed to delete media from database', details: error },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Unexpected error in media delete API:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
} 