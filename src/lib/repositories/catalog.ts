import { createClient } from '@/utils/supabase/server';
import type { Bouquet, Category, Flower } from '@/lib/supabase';
import { TranslationsService } from '@/lib/i18n/translations-service';
import { Locale, defaultLocale } from '../../../config/i18n';
import { toUUID } from '@/utils/uuid';

export interface CatalogRepository {
  getBouquets(locale?: Locale): Promise<Bouquet[]>;
  getBouquetById(id: string, locale?: Locale): Promise<Bouquet | null>;
  getBouquetsByCategory(categoryId: string, locale?: Locale): Promise<Bouquet[]>;
  getFeaturedBouquets(locale?: Locale): Promise<Bouquet[]>;
  getRelatedBouquets(bouquetId: string, categoryId?: string, tagIds?: string[], locale?: Locale): Promise<Bouquet[]>;
  getCategories(locale?: Locale): Promise<Category[]>;
  getCategoryById(id: string, locale?: Locale): Promise<Category | null>;
  getFlowers(locale?: Locale): Promise<Flower[]>;
  getFlowerById(id: string, locale?: Locale): Promise<Flower | null>;
}

class SupabaseCatalogRepository implements CatalogRepository {
  async getBouquets(locale: Locale = defaultLocale): Promise<Bouquet[]> {
    const supabase = await createClient();
    
    // Get all bouquets
    const { data: bouquets, error } = await supabase
      .from('bouquets')
      .select('*')
      .eq('in_stock', true)
      .order('name');
    
    if (error) throw error;
    
    // For each bouquet, get its thumbnail image
    if (bouquets && bouquets.length > 0) {
      const bouquetsWithMedia = await Promise.all(
        bouquets.map(async (bouquet) => {
          const { data: media } = await supabase
            .from('bouquet_media')
            .select('*')
            .eq('bouquet_id', bouquet.id)
            .eq('is_thumbnail', true)
            .limit(1)
            .single();
          
          // Add the thumbnail URL to the bouquet object
          return {
            ...bouquet,
            thumbnail: media || null,
            image: media ? media.file_url : null
          };
        })
      );
      
      // Apply translations if locale is not the default
      if (locale !== defaultLocale) {
        return await TranslationsService.translateEntities(bouquetsWithMedia, 'bouquets', locale);
      }
      
      return bouquetsWithMedia;
    }
    
    return bouquets || [];
  }

  async getBouquetById(id: string, locale: Locale = defaultLocale): Promise<Bouquet | null> {
    const supabase = await createClient();
    
    // Get the bouquet data
    const { data, error } = await supabase
      .from('bouquets')
      .select('*')
      .eq('id', toUUID(id))
      .single();
    
    if (error) throw error;
    if (!data) return null;
    
    // Get all media items for this bouquet
    const { data: mediaItems } = await supabase
      .from('bouquet_media')
      .select('*')
      .eq('bouquet_id', data.id)
      .order('display_order', { ascending: true });
    
    // Find the thumbnail image
    const thumbnail = mediaItems?.find(item => item.is_thumbnail) || mediaItems?.[0] || null;
    
    // Get all flowers in this bouquet
    const { data: bouquetFlowers } = await supabase
      .from('bouquet_flowers')
      .select('*, flower:flower_id(*)')
      .eq('bouquet_id', data.id);
    
    // Get flower media for each flower
    const flowers = await Promise.all(
      bouquetFlowers?.map(async item => {
        // Get flower media, especially thumbnail
        const { data: flowerMedia } = await supabase
          .from('flower_media')
          .select('*')
          .eq('flower_id', item.flower_id)
          .order('is_thumbnail', { ascending: false })
          .limit(1);
          
        return {
          id: item.id,
          flower_id: item.flower_id,
          name: item.flower?.name || 'Unknown Flower',
          description: item.flower?.description || '',
          quantity: item.quantity,
          image: flowerMedia?.[0]?.file_url || null,
          media: flowerMedia || []
        };
      }) || []
    );
    
    // Add media, thumbnail and flowers to the bouquet object
    const bouquetWithMediaAndFlowers = {
      ...data,
      media: mediaItems || [],
      image: thumbnail?.file_url || null,
      thumbnail,
      flowers
    };
    
    // Apply translations if locale is not the default and data exists
    if (locale !== defaultLocale) {
      return await TranslationsService.translateEntity(bouquetWithMediaAndFlowers, 'bouquets', locale);
    }
    
    return bouquetWithMediaAndFlowers;
  }

  async getBouquetsByCategory(categoryId: string, locale: Locale = defaultLocale): Promise<Bouquet[]> {
    const supabase = await createClient();
    
    // Get bouquets in the category
    const { data, error } = await supabase
      .from('bouquets')
      .select('*')
      .eq('category_id', toUUID(categoryId))
      .eq('in_stock', true)
      .order('name');
    
    if (error) throw error;
    
    // For each bouquet, get its thumbnail image
    if (data && data.length > 0) {
      const bouquetsWithMedia = await Promise.all(
        data.map(async (bouquet) => {
          const { data: media } = await supabase
            .from('bouquet_media')
            .select('*')
            .eq('bouquet_id', bouquet.id)
            .eq('is_thumbnail', true)
            .limit(1)
            .single();
          
          // Add the thumbnail URL to the bouquet object
          return {
            ...bouquet,
            thumbnail: media || null,
            image: media ? media.file_url : null
          };
        })
      );
      
      // Apply translations if locale is not the default
      if (locale !== defaultLocale) {
        return await TranslationsService.translateEntities(bouquetsWithMedia, 'bouquets', locale);
      }
      
      return bouquetsWithMedia;
    }
    
    // Apply translations if locale is not the default
    if (locale !== defaultLocale && data) {
      return await TranslationsService.translateEntities(data, 'bouquets', locale);
    }
    
    return data || [];
  }

  async getFeaturedBouquets(locale: Locale = defaultLocale): Promise<Bouquet[]> {
    const supabase = await createClient();
    
    // Get featured bouquets
    const { data, error } = await supabase
      .from('bouquets')
      .select('*')
      .eq('featured', true)
      .eq('in_stock', true)
      .order('name');
    
    if (error) throw error;
    
    // For each bouquet, get all media items
    if (data && data.length > 0) {
      const bouquetsWithMedia = await Promise.all(
        data.map(async (bouquet) => {
          // Get all media items for this bouquet
          const { data: mediaItems } = await supabase
            .from('bouquet_media')
            .select('*')
            .eq('bouquet_id', bouquet.id)
            .order('display_order', { ascending: true });
          
          // Find the thumbnail image
          const thumbnail = mediaItems?.find(item => item.is_thumbnail) || mediaItems?.[0] || null;
          
          // Add media and thumbnail to the bouquet object
          return {
            ...bouquet,
            media: mediaItems || [],
            image: thumbnail?.file_url || null,
            thumbnail
          };
        })
      );
      
      // Apply translations if locale is not the default
      if (locale !== defaultLocale) {
        return await TranslationsService.translateEntities(bouquetsWithMedia, 'bouquets', locale);
      }
      
      return bouquetsWithMedia;
    }
    
    // Apply translations if locale is not the default
    if (locale !== defaultLocale && data) {
      return await TranslationsService.translateEntities(data, 'bouquets', locale);
    }
    
    return data || [];
  }

  async getCategories(locale: Locale = defaultLocale): Promise<Category[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');
    
    if (error) throw error;
    
    // Apply translations if locale is not the default
    if (locale !== defaultLocale && data) {
      return await TranslationsService.translateEntities(data, 'categories', locale);
    }
    
    return data || [];
  }

  async getCategoryById(id: string, locale: Locale = defaultLocale): Promise<Category | null> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('id', toUUID(id))
      .single();
    
    if (error) throw error;
    
    // Apply translations if locale is not the default and data exists
    if (locale !== defaultLocale && data) {
      return await TranslationsService.translateEntity(data, 'categories', locale);
    }
    
    return data;
  }

  async getFlowers(locale: Locale = defaultLocale): Promise<Flower[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('flowers')
      .select('*')
      .eq('is_available', true)
      .order('name');
    
    if (error) throw error;
    
    // Apply translations if locale is not the default
    if (locale !== defaultLocale && data) {
      return await TranslationsService.translateEntities(data, 'flowers', locale, ['name', 'description', 'scientific_name']);
    }
    
    return data || [];
  }

  async getFlowerById(id: string, locale: Locale = defaultLocale): Promise<Flower | null> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('flowers')
      .select('*')
      .eq('id', toUUID(id))
      .single();
    
    if (error) throw error;
    
    // Apply translations if locale is not the default and data exists
    if (locale !== defaultLocale && data) {
      return await TranslationsService.translateEntity(data, 'flowers', locale, ['name', 'description', 'scientific_name']);
    }
    
    return data;
  }

  async getRelatedBouquets(
    bouquetId: string, 
    categoryId?: string, 
    tagIds: string[] = [],
    locale: Locale = defaultLocale
  ): Promise<Bouquet[]> {
    const supabase = await createClient();
    
    // Use either category ID or tags to find related bouquets
    let query = supabase
      .from('bouquets')
      .select('*')
      .eq('in_stock', true)
      .neq('id', toUUID(bouquetId)) // Exclude the current bouquet
      .limit(4); // Limit to 4 related bouquets
    
    if (categoryId) {
      // First try to find related bouquets in the same category
      query = query.eq('category_id', categoryId);
    } else if (tagIds && tagIds.length > 0) {
      // If no category, use tags to find related bouquets
      // Note: This is a simplified approach - ideally you'd use a junction table for tags
      // In this implementation, we'll assume the tags are stored as an array in the bouquet
      query = query.contains('tags', tagIds);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    // If we don't have enough related bouquets by category, fetch some featured ones
    if (!data || data.length < 4) {
      const limit = data ? 4 - data.length : 4;
      const { data: featuredData, error: featuredError } = await supabase
        .from('bouquets')
        .select('*')
        .eq('featured', true)
        .eq('in_stock', true)
        .neq('id', toUUID(bouquetId))
        .limit(limit);
      
      if (featuredError) throw featuredError;
      
      // Combine results, ensuring no duplicates
      const combinedData = [...(data || [])];
      
      if (featuredData) {
        for (const bouquet of featuredData) {
          if (!combinedData.some(b => b.id === bouquet.id)) {
            combinedData.push(bouquet);
          }
        }
      }
      
      // For each bouquet, get its thumbnail image
      if (combinedData.length > 0) {
        const bouquetsWithMedia = await Promise.all(
          combinedData.map(async (bouquet) => {
            const { data: mediaItems } = await supabase
              .from('bouquet_media')
              .select('*')
              .eq('bouquet_id', bouquet.id)
              .order('display_order', { ascending: true });
            
            // Find the thumbnail image
            const thumbnail = mediaItems?.find(item => item.is_thumbnail) || mediaItems?.[0] || null;
            
            return {
              ...bouquet,
              media: mediaItems || [],
              image: thumbnail?.file_url || null,
              thumbnail
            };
          })
        );
        
        // Apply translations if locale is not the default
        if (locale !== defaultLocale) {
          return await TranslationsService.translateEntities(bouquetsWithMedia, 'bouquets', locale);
        }
        
        return bouquetsWithMedia;
      }
    } else {
      // For each bouquet, get its thumbnail image
      const bouquetsWithMedia = await Promise.all(
        data.map(async (bouquet) => {
          const { data: mediaItems } = await supabase
            .from('bouquet_media')
            .select('*')
            .eq('bouquet_id', bouquet.id)
            .order('display_order', { ascending: true });
          
          // Find the thumbnail image
          const thumbnail = mediaItems?.find(item => item.is_thumbnail) || mediaItems?.[0] || null;
          
          return {
            ...bouquet,
            media: mediaItems || [],
            image: thumbnail?.file_url || null,
            thumbnail
          };
        })
      );
      
      // Apply translations if locale is not the default
      if (locale !== defaultLocale) {
        return await TranslationsService.translateEntities(bouquetsWithMedia, 'bouquets', locale);
      }
      
      return bouquetsWithMedia;
    }
    
    return [];
  }
}

// Export a singleton instance
export const catalogRepository: CatalogRepository = new SupabaseCatalogRepository(); 