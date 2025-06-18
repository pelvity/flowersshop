import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

// Create a Supabase client
const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: NextRequest) {
  try {
    // Get the video URL or path from the query string
    const { searchParams } = new URL(request.url);
    const mediaId = searchParams.get('id');
    
    if (!mediaId) {
      return NextResponse.json(
        { error: 'Media ID is required' },
        { status: 400 }
      );
    }
    
    // Get the media item from the database
    const { data: media, error } = await supabase
      .from('bouquet_media')
      .select('*')
      .eq('id', mediaId)
      .single();
    
    if (error || !media) {
      return NextResponse.json(
        { error: 'Media not found' },
        { status: 404 }
      );
    }
    
    // For now, just redirect to the original media URL
    // In the future, this could generate a real thumbnail from the video
    const fileUrl = media.file_url || 
      `https://flowershop-media-server.pelvity.workers.dev/${media.file_path}`;
    
    // Redirect to the file URL (this will show the first frame of the video)
    return NextResponse.redirect(fileUrl);
  } catch (error) {
    console.error('Error serving thumbnail:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
} 