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
      const { data, error } = await this.supabase
        .from('flower_colors')
        .select('color:color_id(*)')
        .eq('flower_id', flowerId);
        
      if (error) {
        console.error('Error fetching colors for flower:', error);
        return [];
      }
      
      // Transform the nested colors structure to a flat array of Color objects
      // Using explicit type casting to handle Supabase typing issues
      return data.map(item => {
        const colorData = item.color as any;
        return {
          id: colorData.id,
          name: colorData.name,
          hex_code: colorData.hex_code,
          created_at: colorData.created_at,
          updated_at: colorData.updated_at
        } as Color;
      }) || [];
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
      const { data, error } = await this.supabase
        .from('colors')
        .select(`
          *,
          translations:color_translations!inner(*)
        `)
        .eq('translations.locale', locale)
        .order('name');
        
      if (error) {
        console.error('Error fetching colors with translations:', error);
        return [];
      }
      
      return data.map(item => {
        const translations = item.translations as any[];
        return {
          ...item,
          translated_name: translations.length > 0 ? translations[0].name : item.name
        } as ColorWithTranslation;
      }) || [];
    } catch (err) {
      console.error('Unexpected error in getAllWithTranslations:', err);
      return [];
    }
  }
} 