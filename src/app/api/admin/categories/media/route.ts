import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/server';
import { CategoryMediaRepository } from '@/lib/repositories/category-media-repository';
import { deleteFromWorker } from '@/utils/cloudflare-worker';

// POST: Add new media for a category
export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    
    if (!payload.category_id) {
      return NextResponse.json({ error: 'Category ID is required' }, { status: 400 });
    }

    // Use the repository pattern instead of direct Supabase calls
    const categoryMediaRepo = new CategoryMediaRepository();
    let newMedia = await categoryMediaRepo.create(payload);
    
    if (!newMedia) {
      // If repository fails, try using admin client directly as fallback
      const supabase = await createAdminClient();
      const { data, error } = await supabase
        .from('category_media')
        .insert(payload)
        .select()
        .single();
      
      if (error) {
        console.error('Admin client error adding category media:', error);
        return NextResponse.json({ 
          error: 'Failed to add category media', 
          details: error.message 
        }, { status: 500 });
      }
      
      if (!data) {
        return NextResponse.json({ 
          error: 'Failed to add category media, no data returned'
        }, { status: 500 });
      }
      
      newMedia = data;
    }

    // At this point, newMedia is guaranteed to be non-null
    // If this is a thumbnail, make sure it's the only thumbnail
    if (payload.is_thumbnail && newMedia) {
      await categoryMediaRepo.setThumbnail(payload.category_id, newMedia.id);
    }

    return NextResponse.json(newMedia, { status: 201 });
  } catch (error) {
    console.error('Error adding category media:', error);
    return NextResponse.json({ 
      error: 'Failed to add category media',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

// GET: Fetch media for a category
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get('categoryId');
    
    if (!categoryId) {
      return NextResponse.json({ error: 'Category ID is required' }, { status: 400 });
    }
    
    // Use repository to get media for this category
    const categoryMediaRepo = new CategoryMediaRepository();
    const mediaItems = await categoryMediaRepo.getMediaForCategory(categoryId);
    
    return NextResponse.json(mediaItems);
  } catch (error) {
    console.error('Error fetching category media:', error);
    return NextResponse.json({ error: 'Failed to fetch category media' }, { status: 500 });
  }
}

// DELETE: Remove media from a category
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Media ID is required' }, { status: 400 });
    }
    
    console.log(`Attempting to delete category media with ID: ${id}`);

    // First fetch the media item to get its file path
    const supabase = await createAdminClient();
    const { data: mediaItem, error: fetchError } = await supabase
      .from('category_media')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError) {
      console.error('Error fetching category media item for deletion:', fetchError);
      return NextResponse.json({
        error: 'Failed to fetch category media item',
        details: fetchError.message
      }, { status: 500 });
    }
    
    if (!mediaItem) {
      console.error('Category media item not found:', id);
      return NextResponse.json({ error: 'Category media item not found' }, { status: 404 });
    }

    console.log('Found category media item to delete:', mediaItem);

    // Delete from database using repository
    const categoryMediaRepo = new CategoryMediaRepository();
    const success = await categoryMediaRepo.delete(id);
    
    if (!success) {
      console.error('Repository failed to delete category media, trying direct deletion');
      // If repository fails, try using admin client directly
      const { error } = await supabase
        .from('category_media')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Admin client error deleting category media:', error);
        return NextResponse.json({ 
          error: 'Failed to delete category media',
          details: error.message
        }, { status: 500 });
      }
    }

    console.log(`Successfully deleted category media with ID ${id} from database`);

    // Also delete from R2 storage if we have a file path
    if (mediaItem.file_path) {
      try {
        // Clean file path to avoid double slashes
        const cleanFilePath = mediaItem.file_path.startsWith('/')
          ? mediaItem.file_path.substring(1)
          : mediaItem.file_path;

        console.log(`Attempting to delete file from storage: ${cleanFilePath}`);
        const deleteResult = await deleteFromWorker(cleanFilePath);

        if (!deleteResult.success) {
          console.warn(`Failed to delete file from storage:`, deleteResult.error);
          // Don't throw error here - we want to continue even if storage deletion fails
        } else {
          console.log(`Successfully deleted file from R2 storage: ${cleanFilePath}`);
        }
      } catch (storageError) {
        console.warn(`Error deleting from storage, will require cleanup later:`, storageError);
      }
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting category media:', error);
    return NextResponse.json({ 
      error: 'Failed to delete category media',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

// PATCH: Update media properties (like display_order or is_thumbnail)
export async function PATCH(req: NextRequest) {
  try {
    const payload = await req.json();
    
    if (!payload.id) {
      return NextResponse.json({ error: 'Media ID is required' }, { status: 400 });
    }
    
    const categoryMediaRepo = new CategoryMediaRepository();
    
    // If setting this as thumbnail, handle that specially
    if (payload.is_thumbnail && payload.category_id) {
      const success = await categoryMediaRepo.setThumbnail(payload.category_id, payload.id);
      if (!success) {
        return NextResponse.json({ error: 'Failed to set thumbnail' }, { status: 500 });
      }
    }
    
    // Update the media record
    const updatedMedia = await categoryMediaRepo.update(payload.id, payload);
    
    if (!updatedMedia) {
      return NextResponse.json({ error: 'Failed to update category media' }, { status: 500 });
    }
    
    return NextResponse.json(updatedMedia);
  } catch (error) {
    console.error('Error updating category media:', error);
    return NextResponse.json({ 
      error: 'Failed to update category media',
      details: error instanceof Error ? error.message : String(error) 
    }, { status: 500 });
  }
} 