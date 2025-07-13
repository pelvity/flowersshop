import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/supabase';
import { createClient as createClientSide } from '@/utils/supabase/client';
import { createClient as createServerSide } from '@/utils/supabase/server';

/**
 * Media item interface matching the category_media table
 */
export interface CategoryMedia {
  id: string;
  category_id: string;
  media_type: 'image' | 'video';
  file_path: string;
  file_url?: string;
  file_name: string;
  file_size: number;
  content_type: string;
  display_order: number;
  is_thumbnail: boolean;
  created_at: string;
  updated_at: string;
}

export class CategoryMediaRepository {
  // Use the server client that can work in both server and client components
  private async getClient() {
    // We need to determine if we're running on client or server side
    const isServer = typeof window === 'undefined';
    
    if (isServer) {
      // Use server client when running on server
      return await createServerSide();
    } else {
      // Use client when running on client side
      return createClientSide();
    }
  }

  /**
   * Get all media for a category
   */
  async getMediaForCategory(categoryId: string): Promise<CategoryMedia[]> {
    try {
      const supabase = await this.getClient();
      const { data, error } = await supabase
        .from('category_media')
        .select('*')
        .eq('category_id', categoryId)
        .order('display_order');
        
      if (error) {
        console.error('Error fetching category media:', error);
        return [];
      }
      
      return data || [];
    } catch (err) {
      console.error('Unexpected error in getMediaForCategory:', err);
      return [];
    }
  }
  
  /**
   * Create a new media item for a category
   */
  async create(media: Partial<CategoryMedia>): Promise<CategoryMedia | null> {
    try {
      const supabase = await this.getClient();
      const { data, error } = await supabase
        .from('category_media')
        .insert(media)
        .select()
        .single();
        
      if (error) {
        console.error('Error creating category media:', error);
        return null;
      }
      
      return data;
    } catch (err) {
      console.error('Unexpected error in create:', err);
      return null;
    }
  }
  
  /**
   * Update an existing media item
   */
  async update(id: string, media: Partial<CategoryMedia>): Promise<CategoryMedia | null> {
    try {
      const supabase = await this.getClient();
      const { data, error } = await supabase
        .from('category_media')
        .update(media)
        .eq('id', id)
        .select()
        .single();
        
      if (error) {
        console.error('Error updating category media:', error);
        return null;
      }
      
      return data;
    } catch (err) {
      console.error('Unexpected error in update:', err);
      return null;
    }
  }
  
  /**
   * Delete a media item
   */
  async delete(id: string): Promise<boolean> {
    try {
      console.log(`CategoryMediaRepository: Deleting category media with ID: ${id}`);
      const supabase = await this.getClient();
      
      // First get the media item to verify it exists
      const { data: mediaItem, error: fetchError } = await supabase
        .from('category_media')
        .select('*')
        .eq('id', id)
        .single();
      
      if (fetchError) {
        console.error('Error fetching category media item:', fetchError);
        return false;
      }
      
      if (!mediaItem) {
        console.error('Category media item not found with ID:', id);
        return false;
      }
      
      console.log('Found category media item to delete:', mediaItem);
      
      // Delete the database record
      const { error } = await supabase
        .from('category_media')
        .delete()
        .eq('id', id);
        
      if (error) {
        console.error('Error deleting category media from database:', error);
        return false;
      }
      
      console.log(`Successfully deleted category media with ID ${id} from database`);
      return true;
    } catch (err) {
      console.error('Unexpected error in delete:', err);
      return false;
    }
  }
  
  /**
   * Update display order for multiple media items
   */
  async updateDisplayOrder(mediaItems: { id: string; display_order: number }[]): Promise<boolean> {
    try {
      const supabase = await this.getClient();
      // We'll use a transaction to update all items
      const updates = mediaItems.map(item => 
        supabase
          .from('category_media')
          .update({ display_order: item.display_order })
          .eq('id', item.id)
      );
      
      // Execute all updates
      const results = await Promise.all(updates);
      
      // Check if any update had an error
      const hasError = results.some(result => result.error);
      
      return !hasError;
    } catch (err) {
      console.error('Unexpected error in updateDisplayOrder:', err);
      return false;
    }
  }
  
  /**
   * Set a specific media item as the thumbnail and unset others
   */
  async setThumbnail(categoryId: string, mediaId: string): Promise<boolean> {
    try {
      const supabase = await this.getClient();
      // First, unset all thumbnails for this category
      const { error: unsetError } = await supabase
        .from('category_media')
        .update({ is_thumbnail: false })
        .eq('category_id', categoryId);
        
      if (unsetError) {
        console.error('Error unsetting thumbnails:', unsetError);
        return false;
      }
      
      // Then set the selected item as thumbnail
      const { error: setError } = await supabase
        .from('category_media')
        .update({ is_thumbnail: true })
        .eq('id', mediaId);
        
      if (setError) {
        console.error('Error setting thumbnail:', setError);
        return false;
      }
      
      return true;
    } catch (err) {
      console.error('Unexpected error in setThumbnail:', err);
      return false;
    }
  }
} 