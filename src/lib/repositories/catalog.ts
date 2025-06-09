import { createClient } from '@/utils/supabase/server';
import type { Bouquet, Category, Flower } from '@/lib/supabase';
import { TranslationsService } from '@/lib/i18n/translations-service';
import { Locale, defaultLocale } from '../../../config/i18n';

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
    const { data, error } = await supabase
      .from('bouquets')
      .select('*')
      .eq('in_stock', true)
      .order('name');
    
    if (error) throw error;
    
    // Apply translations if locale is not the default
    if (locale !== defaultLocale && data) {
      return await TranslationsService.translateEntities(data, 'bouquets', locale);
    }
    
    return data || [];
  }

  async getBouquetById(id: string, locale: Locale = defaultLocale): Promise<Bouquet | null> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('bouquets')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    // Apply translations if locale is not the default and data exists
    if (locale !== defaultLocale && data) {
      return await TranslationsService.translateEntity(data, 'bouquets', locale);
    }
    
    return data;
  }

  async getBouquetsByCategory(categoryId: string, locale: Locale = defaultLocale): Promise<Bouquet[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('bouquets')
      .select('*')
      .eq('category_id', categoryId)
      .eq('in_stock', true)
      .order('name');
    
    if (error) throw error;
    
    // Apply translations if locale is not the default
    if (locale !== defaultLocale && data) {
      return await TranslationsService.translateEntities(data, 'bouquets', locale);
    }
    
    return data || [];
  }

  async getFeaturedBouquets(locale: Locale = defaultLocale): Promise<Bouquet[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('bouquets')
      .select('*')
      .eq('featured', true)
      .eq('in_stock', true)
      .order('name');
    
    if (error) throw error;
    
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
      .eq('id', id)
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
      .eq('id', id)
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