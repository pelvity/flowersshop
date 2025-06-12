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
    
    // Add media and thumbnail to the bouquet object
    const bouquetWithMedia = {
      ...data,
      media: mediaItems || [],
      image: thumbnail?.file_url || null,
      thumbnail
    };
    
    // Apply translations if locale is not the default and data exists
    if (locale !== defaultLocale) {
      return await TranslationsService.translateEntity(bouquetWithMedia, 'bouquets', locale);
    }
    
    return bouquetWithMedia;
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
}

// Export a singleton instance
export const catalogRepository: CatalogRepository = new SupabaseCatalogRepository(); 