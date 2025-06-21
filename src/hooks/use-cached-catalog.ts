'use client';

import { useCachedData } from '@/lib/api-cache';
import { Locale, defaultLocale } from '../../config/i18n';
import { CachedCatalogRepository } from '@/lib/repositories/cached-catalog';
import { Bouquet, Category, Flower } from '@/lib/supabase';
import { useLocale } from 'next-intl';

// Create a singleton instance of the cached repository
const cachedCatalogRepo = new CachedCatalogRepository();

export function useCachedCatalog() {
  const locale = useLocale() as Locale || defaultLocale;
  
  const useCategories = (options = { ttlMinutes: 1440 }) => {
    return useCachedData<Category[]>(
      `categories:${locale}`,
      () => cachedCatalogRepo.getCategories(locale),
      options
    );
  };
  
  const useCategory = (id: string | null, options = { ttlMinutes: 1440 }) => {
    return useCachedData<Category | null>(
      `category:${id}:${locale}`,
      () => id ? cachedCatalogRepo.getCategoryById(id, locale) : Promise.resolve(null),
      { ...options, enabled: !!id }
    );
  };
  
  const useBouquets = (options = { ttlMinutes: 60 }) => {
    return useCachedData<Bouquet[]>(
      `bouquets:${locale}`,
      () => cachedCatalogRepo.getBouquets(locale),
      options
    );
  };
  
  const useBouquet = (id: string | null, options = { ttlMinutes: 120 }) => {
    return useCachedData<Bouquet | null>(
      `bouquet:${id}:${locale}`,
      () => id ? cachedCatalogRepo.getBouquetById(id, locale) : Promise.resolve(null),
      { ...options, enabled: !!id }
    );
  };
  
  const useBouquetsByCategory = (categoryId: string | null, options = { ttlMinutes: 60 }) => {
    return useCachedData<Bouquet[]>(
      `bouquets:category:${categoryId}:${locale}`,
      () => categoryId ? cachedCatalogRepo.getBouquetsByCategory(categoryId, locale) : Promise.resolve([]),
      { ...options, enabled: !!categoryId }
    );
  };
  
  const useFeaturedBouquets = (options = { ttlMinutes: 180 }) => {
    return useCachedData<Bouquet[]>(
      `bouquets:featured:${locale}`,
      () => cachedCatalogRepo.getFeaturedBouquets(locale),
      options
    );
  };
  
  const useRelatedBouquets = (
    bouquetId: string | null, 
    categoryId?: string, 
    tagIds?: string[], 
    options = { ttlMinutes: 60 }
  ) => {
    const tagsKey = tagIds?.join(',') || 'none';
    return useCachedData<Bouquet[]>(
      `bouquets:related:${bouquetId}:${categoryId || 'none'}:${tagsKey}:${locale}`,
      () => bouquetId 
        ? cachedCatalogRepo.getRelatedBouquets(bouquetId, categoryId, tagIds, locale) 
        : Promise.resolve([]),
      { ...options, enabled: !!bouquetId }
    );
  };
  
  const useFlowers = (options = { ttlMinutes: 1440 }) => {
    return useCachedData<Flower[]>(
      `flowers:${locale}`,
      () => cachedCatalogRepo.getFlowers(locale),
      options
    );
  };
  
  const useFlower = (id: string | null, options = { ttlMinutes: 1440 }) => {
    return useCachedData<Flower | null>(
      `flower:${id}:${locale}`,
      () => id ? cachedCatalogRepo.getFlowerById(id, locale) : Promise.resolve(null),
      { ...options, enabled: !!id }
    );
  };
  
  return {
    useCategories,
    useCategory,
    useBouquets,
    useBouquet,
    useBouquetsByCategory,
    useFeaturedBouquets,
    useRelatedBouquets,
    useFlowers,
    useFlower
  };
} 