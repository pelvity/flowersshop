import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/supabase';
import { Color, ColorWithTranslation } from './repository-types';

export class ColorRepository {
  private supabase = createClientComponentClient<Database>();

  /**
   * Get all colors
   */
  async getAll(): Promise<Color[]> {
    try {
      const { data, error } = await this.supabase
        .from('colors')
        .select('*')
        .order('name');
        
      if (error) {
        console.error('Error fetching colors:', error);
        return [];
      }
      
      return data || [];
    } catch (err) {
      console.error('Unexpected error in getAll:', err);
      return [];
    }
  }
  
  /**
   * Get a color by ID
   */
  async getById(id: string): Promise<Color | null> {
    try {
      const { data, error } = await this.supabase
        .from('colors')
        .select('*')
        .eq('id', id)
        .single();
        
      if (error) {
        console.error('Error fetching color:', error);
        return null;
      }
      
      return data;
    } catch (err) {
      console.error('Unexpected error in getById:', err);
      return null;
    }
  }
  
  /**
   * Create a new color
   */
  async create(color: Partial<Color>): Promise<Color | null> {
    try {
      const { data, error } = await this.supabase
        .from('colors')
        .insert(color)
        .select()
        .single();
        
      if (error) {
        console.error('Error creating color:', error);
        return null;
      }
      
      return data;
    } catch (err) {
      console.error('Unexpected error in create:', err);
      return null;
    }
  }
  
  /**
   * Update an existing color
   */
  async update(id: string, color: Partial<Color>): Promise<Color | null> {
    try {
      const { data, error } = await this.supabase
        .from('colors')
        .update(color)
        .eq('id', id)
        .select()
        .single();
        
      if (error) {
        console.error('Error updating color:', error);
        return null;
      }
      
      return data;
    } catch (err) {
      console.error('Unexpected error in update:', err);
      return null;
    }
  }
  
  /**
   * Delete a color
   */
  async delete(id: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('colors')
        .delete()
        .eq('id', id);
        
      return !error;
    } catch (err) {
      console.error('Unexpected error in delete:', err);
      return false;
    }
  }
  
  /**
   * Get colors for a flower
   */
  async getColorsForFlower(flowerId: string): Promise<Color[]> {
    try {
      console.log(`Fetching colors for flower: ${flowerId}`);
      
      const { data, error } = await this.supabase
        .from('flower_colors')
        .select('colors(*)')
        .eq('flower_id', flowerId);
        
      if (error) {
        console.error('Error fetching colors for flower:', error);
        return [];
      }
      
      console.log('Colors data from Supabase for flower', flowerId, JSON.stringify(data, null, 2));

      if (!data || data.length === 0) {
        console.log(`No colors found for flower ${flowerId}`);
        return [];
      }
      
      // The data from Supabase is an array of objects, where each object has a 'colors' property.
      // This property can be a single object or null.
      const colors = data.map(item => {
        console.log('Processing color item:', item);
        return item.colors;
      }).filter(Boolean);
      
      console.log(`Processed ${colors.length} colors for flower ${flowerId}:`, colors);
      
      return colors as unknown as Color[];
    } catch (err) {
      console.error('Unexpected error in getColorsForFlower:', err);
      return [];
    }
  }
  
  /**
   * Set colors for a flower (replaces all existing associations)
   */
  async setColorsForFlower(flowerId: string, colorIds: string[]): Promise<boolean> {
    try {
      // First delete existing associations
      const { error: deleteError } = await this.supabase
        .from('flower_colors')
        .delete()
        .eq('flower_id', flowerId);
        
      if (deleteError) {
        console.error('Error deleting existing flower colors:', deleteError);
        return false;
      }
      
      // Then create new associations if there are any colors to add
      if (colorIds.length > 0) {
        const colorAssociations = colorIds.map(colorId => ({
          flower_id: flowerId,
          color_id: colorId
        }));
        
        const { error: insertError } = await this.supabase
          .from('flower_colors')
          .insert(colorAssociations);
          
        if (insertError) {
          console.error('Error inserting flower colors:', insertError);
          return false;
        }
      }
      
      return true;
    } catch (err) {
      console.error('Unexpected error in setColorsForFlower:', err);
      return false;
    }
  }
  
  /**
   * Get all colors with translations for a specific locale
   */
  async getAllWithTranslations(locale: string): Promise<ColorWithTranslation[]> {
    try {
      // Since color_translations table doesn't exist, just fetch colors directly
      const { data, error } = await this.supabase
        .from('colors')
        .select('*')
        .order('name');
        
      if (error) {
        console.error('Error fetching colors:', error);
        return [];
      }
      
      // Map each color to include a translated_name field that's the same as the name
      return (data || []).map(item => ({
        ...item,
        translated_name: item.name
      })) as ColorWithTranslation[];
    } catch (err) {
      console.error('Unexpected error in getAllWithTranslations:', err);
      return [];
    }
  }
} 