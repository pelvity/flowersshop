import { ApiCache } from '../api-cache';
import { CatalogRepository, catalogRepository } from './catalog';
import { Bouquet, Category, Flower } from '@/lib/supabase';
import { Locale, defaultLocale } from '../../../config/i18n';

/**
 * Cache TTL configurations (in minutes)
 * Adjust these values based on how frequently data changes
 */
export const CACHE_CONFIG = {
  bouquets: 60, // 1 hour
  bouquetDetails: 120, // 2 hours
  categories: 1440, // 24 hours
  flowers: 1440, // 24 hours
  featuredBouquets: 180, // 3 hours
};

/**
 * A wrapper around the CatalogRepository that adds caching to reduce API calls
 * Particularly useful for data that changes infrequently
 */
export class CachedCatalogRepository implements CatalogRepository {
  private repository: CatalogRepository;
  
  constructor(repository?: CatalogRepository) {
    this.repository = repository || catalogRepository;
  }
  
  async getBouquets(locale: Locale = defaultLocale): Promise<Bouquet[]> {
    const cacheKey = `bouquets:${locale}`;
    const cached = ApiCache.get<Bouquet[]>(cacheKey);
    
    if (cached) return cached;
    
    const bouquets = await this.repository.getBouquets(locale);
    ApiCache.set(cacheKey, bouquets, { ttlMinutes: CACHE_CONFIG.bouquets });
    
    return bouquets;
  }
  
  async getBouquetById(id: string, locale: Locale = defaultLocale): Promise<Bouquet | null> {
    const cacheKey = `bouquet:${id}:${locale}`;
    const cached = ApiCache.get<Bouquet | null>(cacheKey);
    
    if (cached) return cached;
    
    const bouquet = await this.repository.getBouquetById(id, locale);
    if (bouquet) {
      ApiCache.set(cacheKey, bouquet, { ttlMinutes: CACHE_CONFIG.bouquetDetails });
    }
    
    return bouquet;
  }
  
  async getBouquetsByCategory(categoryId: string, locale: Locale = defaultLocale): Promise<Bouquet[]> {
    const cacheKey = `bouquets:category:${categoryId}:${locale}`;
    const cached = ApiCache.get<Bouquet[]>(cacheKey);
    
    if (cached) return cached;
    
    const bouquets = await this.repository.getBouquetsByCategory(categoryId, locale);
    ApiCache.set(cacheKey, bouquets, { ttlMinutes: CACHE_CONFIG.bouquets });
    
    return bouquets;
  }
  
  async getFeaturedBouquets(locale: Locale = defaultLocale): Promise<Bouquet[]> {
    const cacheKey = `bouquets:featured:${locale}`;
    const cached = ApiCache.get<Bouquet[]>(cacheKey);
    
    if (cached) return cached;
    
    const bouquets = await this.repository.getFeaturedBouquets(locale);
    ApiCache.set(cacheKey, bouquets, { ttlMinutes: CACHE_CONFIG.featuredBouquets });
    
    return bouquets;
  }
  
  async getRelatedBouquets(bouquetId: string, categoryId?: string, tagIds?: string[], locale: Locale = defaultLocale): Promise<Bouquet[]> {
    const tagsKey = tagIds?.join(',') || 'none';
    const cacheKey = `bouquets:related:${bouquetId}:${categoryId || 'none'}:${tagsKey}:${locale}`;
    const cached = ApiCache.get<Bouquet[]>(cacheKey);
    
    if (cached) return cached;
    
    const bouquets = await this.repository.getRelatedBouquets(bouquetId, categoryId, tagIds, locale);
    ApiCache.set(cacheKey, bouquets, { ttlMinutes: CACHE_CONFIG.bouquets });
    
    return bouquets;
  }
  
  async getCategories(locale: Locale = defaultLocale): Promise<Category[]> {
    const cacheKey = `categories:${locale}`;
    const cached = ApiCache.get<Category[]>(cacheKey);
    
    if (cached) return cached;
    
    const categories = await this.repository.getCategories(locale);
    ApiCache.set(cacheKey, categories, { ttlMinutes: CACHE_CONFIG.categories });
    
    return categories;
  }
  
  async getCategoryById(id: string, locale: Locale = defaultLocale): Promise<Category | null> {
    const cacheKey = `category:${id}:${locale}`;
    const cached = ApiCache.get<Category | null>(cacheKey);
    
    if (cached) return cached;
    
    const category = await this.repository.getCategoryById(id, locale);
    if (category) {
      ApiCache.set(cacheKey, category, { ttlMinutes: CACHE_CONFIG.categories });
    }
    
    return category;
  }
  
  async getFlowers(locale: Locale = defaultLocale): Promise<Flower[]> {
    const cacheKey = `flowers:${locale}`;
    const cached = ApiCache.get<Flower[]>(cacheKey);
    
    if (cached) return cached;
    
    const flowers = await this.repository.getFlowers(locale);
    ApiCache.set(cacheKey, flowers, { ttlMinutes: CACHE_CONFIG.flowers });
    
    return flowers;
  }
  
  async getFlowerById(id: string, locale: Locale = defaultLocale): Promise<Flower | null> {
    const cacheKey = `flower:${id}:${locale}`;
    const cached = ApiCache.get<Flower | null>(cacheKey);
    
    if (cached) return cached;
    
    const flower = await this.repository.getFlowerById(id, locale);
    if (flower) {
      ApiCache.set(cacheKey, flower, { ttlMinutes: CACHE_CONFIG.flowers });
    }
    
    return flower;
  }
} 