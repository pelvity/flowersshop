import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/supabase';
import { Tag } from './repository-types';

export class TagRepository {
  private supabase = createClientComponentClient<Database>();

  /**
   * Get all tags
   */
  async getAll(): Promise<Tag[]> {
    try {
      const { data, error } = await this.supabase
        .from('tags')
        .select('*')
        .order('name');
        
      if (error) {
        console.error('Error fetching tags:', error);
        return [];
      }
      
      return data || [];
    } catch (err) {
      console.error('Unexpected error in getAll:', err);
      return [];
    }
  }
  
  /**
   * Get a tag by ID
   */
  async getById(id: string): Promise<Tag | null> {
    try {
      const { data, error } = await this.supabase
        .from('tags')
        .select('*')
        .eq('id', id)
        .single();
        
      if (error) {
        console.error('Error fetching tag:', error);
        return null;
      }
      
      return data;
    } catch (err) {
      console.error('Unexpected error in getById:', err);
      return null;
    }
  }
  
  /**
   * Create a new tag
   */
  async create(tag: Partial<Tag>): Promise<Tag | null> {
    try {
      const { data, error } = await this.supabase
        .from('tags')
        .insert(tag)
        .select()
        .single();
        
      if (error) {
        console.error('Error creating tag:', error);
        return null;
      }
      
      return data;
    } catch (err) {
      console.error('Unexpected error in create:', err);
      return null;
    }
  }
  
  /**
   * Update an existing tag
   */
  async update(id: string, tag: Partial<Tag>): Promise<Tag | null> {
    try {
      const { data, error } = await this.supabase
        .from('tags')
        .update(tag)
        .eq('id', id)
        .select()
        .single();
        
      if (error) {
        console.error('Error updating tag:', error);
        return null;
      }
      
      return data;
    } catch (err) {
      console.error('Unexpected error in update:', err);
      return null;
    }
  }
  
  /**
   * Delete a tag
   */
  async delete(id: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('tags')
        .delete()
        .eq('id', id);
        
      return !error;
    } catch (err) {
      console.error('Unexpected error in delete:', err);
      return false;
    }
  }
  
  /**
   * Get tags for a bouquet
   */
  async getTagsForBouquet(bouquetId: string): Promise<Tag[]> {
    try {
      const { data, error } = await this.supabase
        .from('bouquet_tags')
        .select('tag:tag_id(*)')
        .eq('bouquet_id', bouquetId);
        
      if (error) {
        console.error('Error fetching tags for bouquet:', error);
        return [];
      }
      
      // Transform the nested tags structure to a flat array of Tag objects
      // Using explicit type casting to handle Supabase typing issues
      return data.map(item => {
        const tagData = item.tag as any;
        return {
          id: tagData.id,
          name: tagData.name,
          created_at: tagData.created_at,
          updated_at: tagData.updated_at
        } as Tag;
      }) || [];
    } catch (err) {
      console.error('Unexpected error in getTagsForBouquet:', err);
      return [];
    }
  }
} 