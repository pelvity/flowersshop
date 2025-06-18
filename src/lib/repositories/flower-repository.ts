import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/supabase';
import { Flower, FlowerMedia, Color } from './repository-types';
import { FlowerMediaRepository } from './flower-media-repository';
import { ColorRepository } from './color-repository';

export class FlowerRepository {
  private supabase = createClientComponentClient<Database>();
  private mediaRepository = new FlowerMediaRepository();
  private colorRepository = new ColorRepository();

  /**
   * Get all flowers with their media and colors
   */
  async getAll(): Promise<Flower[]> {
    try {
      const { data, error } = await this.supabase
        .from('flowers')
        .select('*')
        .order('name');
        
      if (error) {
        console.error('Error fetching flowers:', error);
        return [];
      }
      
      // Enhance each flower with media and colors
      const enhancedFlowers = await Promise.all(
        data.map(async flower => {
          const media = await this.mediaRepository.getMediaForFlower(flower.id);
          const colors = await this.colorRepository.getColorsForFlower(flower.id);
          
          return {
            ...flower,
            media,
            colors
          } as Flower;
        })
      );
      
      return enhancedFlowers;
    } catch (err) {
      console.error('Unexpected error in getAll:', err);
      return [];
    }
  }
  
  /**
   * Get a flower by ID with all related data
   */
  async getById(id: string): Promise<Flower | null> {
    try {
      const { data, error } = await this.supabase
        .from('flowers')
        .select('*')
        .eq('id', id)
        .single();
        
      if (error) {
        console.error('Error fetching flower:', error);
        return null;
      }
      
      // Get media
      const media = await this.mediaRepository.getMediaForFlower(id);
      
      // Get colors
      const colors = await this.colorRepository.getColorsForFlower(id);
      
      // Return the complete flower with all related data
      return {
        ...data,
        media,
        colors
      };
    } catch (err) {
      console.error('Unexpected error in getById:', err);
      return null;
    }
  }
  
  /**
   * Create a new flower
   */
  async create(flower: Partial<Flower>): Promise<Flower | null> {
    try {
      const { media, colors, ...flowerData } = flower;
      
      // Insert the flower
      const { data, error } = await this.supabase
        .from('flowers')
        .insert(flowerData)
        .select()
        .single();
        
      if (error || !data) {
        console.error('Error creating flower:', error);
        return null;
      }
      
      // Add colors if provided
      if (colors && colors.length > 0) {
        const colorIds = colors.map(c => c.color.id);
        await this.colorRepository.setColorsForFlower(data.id, colorIds);
      }
      
      // Add media if provided
      if (media && media.length > 0) {
        await Promise.all(
          media.map(m => 
            this.mediaRepository.addMedia({
              ...m,
              flower_id: data.id
            })
          )
        );
      }
      
      return this.getById(data.id);
    } catch (err) {
      console.error('Unexpected error in create:', err);
      return null;
    }
  }
  
  /**
   * Update a flower
   */
  async update(id: string, flower: Partial<Flower>): Promise<Flower | null> {
    try {
      const { media, colors, ...flowerData } = flower;
      
      // Update the flower
      const { error } = await this.supabase
        .from('flowers')
        .update(flowerData)
        .eq('id', id);
        
      if (error) {
        console.error('Error updating flower:', error);
        return null;
      }
      
      // Update colors if provided
      if (colors) {
        const colorIds = colors.map(c => c.color.id);
        await this.colorRepository.setColorsForFlower(id, colorIds);
      }
      
      // Update media is more complex and typically handled separately
      
      return this.getById(id);
    } catch (err) {
      console.error('Unexpected error in update:', err);
      return null;
    }
  }
  
  /**
   * Delete a flower
   */
  async delete(id: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('flowers')
        .delete()
        .eq('id', id);
        
      return !error;
    } catch (err) {
      console.error('Unexpected error in delete:', err);
      return false;
    }
  }
  
  /**
   * Search flowers by name, description, or other fields
   */
  async search(query: string): Promise<Flower[]> {
    try {
      const { data, error } = await this.supabase
        .from('flowers')
        .select('*')
        .or(`name.ilike.%${query}%,description.ilike.%${query}%,latin_name.ilike.%${query}%`)
        .order('name');
        
      if (error) {
        console.error('Error searching flowers:', error);
        return [];
      }
      
      // Enhance each flower with media and colors
      const enhancedFlowers = await Promise.all(
        data.map(async flower => {
          const media = await this.mediaRepository.getMediaForFlower(flower.id);
          const colors = await this.colorRepository.getColorsForFlower(flower.id);
          
          return {
            ...flower,
            media,
            colors
          } as Flower;
        })
      );
      
      return enhancedFlowers;
    } catch (err) {
      console.error('Unexpected error in search:', err);
      return [];
    }
  }
  
  /**
   * Get flowers by color
   */
  async getByColor(colorId: string): Promise<Flower[]> {
    try {
      const { data, error } = await this.supabase
        .from('flower_colors')
        .select('flower_id')
        .eq('color_id', colorId);
        
      if (error) {
        console.error('Error fetching flowers by color:', error);
        return [];
      }
      
      if (!data || data.length === 0) return [];
      
      // Get all flower IDs with this color
      const flowerIds = data.map(item => item.flower_id);
      
      // Get the flowers
      const { data: flowers, error: flowersError } = await this.supabase
        .from('flowers')
        .select('*')
        .in('id', flowerIds)
        .order('name');
        
      if (flowersError) {
        console.error('Error fetching flowers by IDs:', flowersError);
        return [];
      }
      
      // Enhance each flower with media and colors
      const enhancedFlowers = await Promise.all(
        flowers.map(async flower => {
          const media = await this.mediaRepository.getMediaForFlower(flower.id);
          const colors = await this.colorRepository.getColorsForFlower(flower.id);
          
          return {
            ...flower,
            media,
            colors
          } as Flower;
        })
      );
      
      return enhancedFlowers;
    } catch (err) {
      console.error('Unexpected error in getByColor:', err);
      return [];
    }
  }
} 