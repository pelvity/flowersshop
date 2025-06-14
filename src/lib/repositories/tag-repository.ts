import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/supabase';
import { Tag } from './repository-types';

export class TagRepository {
  private supabase = createClientComponentClient<Database>();

  /**
   * Get all tags
   */
  async getAll(): Promise<Tag[]> {
    const { data, error } = await this.supabase
      .from('tags')
      .select('*')
      .order('name');
      
    if (error) {
      console.error('Error fetching tags:', error);
      return [];
    }
    
    return data || [];
  }
  
  /**
   * Get a tag by ID
   */
  async getById(id: string): Promise<Tag | null> {
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
  }
  
  /**
   * Create a new tag
   */
  async create(tag: Partial<Tag>): Promise<Tag | null> {
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
  }
  
  /**
   * Update an existing tag
   */
  async update(id: string, tag: Partial<Tag>): Promise<Tag | null> {
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
  }
  
  /**
   * Delete a tag
   */
  async delete(id: string): Promise<boolean> {
    const { error } = await this.supabase
      .from('tags')
      .delete()
      .eq('id', id);
      
    return !error;
  }
  
  /**
   * Get tags for a bouquet
   */
  async getTagsForBouquet(bouquetId: string): Promise<Tag[]> {
    const { data, error } = await this.supabase
      .from('bouquet_tags')
      .select('tags(*)')
      .eq('bouquet_id', bouquetId);
      
    if (error) {
      console.error('Error fetching tags for bouquet:', error);
      return [];
    }
    
    // Transform the nested tags structure to a flat array of Tag objects
    // Using explicit type casting to handle Supabase typing issues
    return data.map(item => {
      const tagData = item.tags as any;
      return {
        id: tagData.id,
        name: tagData.name,
        created_at: tagData.created_at,
        updated_at: tagData.updated_at
      } as Tag;
    }) || [];
  }
} 