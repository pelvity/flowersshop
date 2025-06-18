import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/supabase';

/**
 * Media item interface matching the flower_media table
 */
export interface FlowerMedia {
  id: string;
  flower_id: string;
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

export class FlowerMediaRepository {
  private supabase = createClientComponentClient<Database>();

  /**
   * Get all media for a flower
   */
  async getMediaForFlower(flowerId: string): Promise<FlowerMedia[]> {
    try {
      const { data, error } = await this.supabase
        .from('flower_media')
        .select('*')
        .eq('flower_id', flowerId)
        .order('display_order');
        
      if (error) {
        console.error('Error fetching flower media:', error);
        return [];
      }
      
      return data || [];
    } catch (err) {
      console.error('Unexpected error in getMediaForFlower:', err);
      return [];
    }
  }
  
  /**
   * Create a new media item for a flower
   */
  async create(media: Partial<FlowerMedia>): Promise<FlowerMedia | null> {
    try {
      const { data, error } = await this.supabase
        .from('flower_media')
        .insert(media)
        .select()
        .single();
        
      if (error) {
        console.error('Error creating flower media:', error);
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
  async update(id: string, media: Partial<FlowerMedia>): Promise<FlowerMedia | null> {
    try {
      const { data, error } = await this.supabase
        .from('flower_media')
        .update(media)
        .eq('id', id)
        .select()
        .single();
        
      if (error) {
        console.error('Error updating flower media:', error);
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
      const { error } = await this.supabase
        .from('flower_media')
        .delete()
        .eq('id', id);
        
      return !error;
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
      // We'll use a transaction to update all items
      const updates = mediaItems.map(item => 
        this.supabase
          .from('flower_media')
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
  async setThumbnail(flowerId: string, mediaId: string): Promise<boolean> {
    try {
      // First, unset all thumbnails for this flower
      const { error: unsetError } = await this.supabase
        .from('flower_media')
        .update({ is_thumbnail: false })
        .eq('flower_id', flowerId);
        
      if (unsetError) {
        console.error('Error unsetting thumbnails:', unsetError);
        return false;
      }
      
      // Then set the selected item as thumbnail
      const { error: setError } = await this.supabase
        .from('flower_media')
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