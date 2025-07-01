import { createClient } from '@/utils/supabase/server';
import { createAdminLoggingClient, createServerLoggingClient } from '@/utils/supabase-logger';
import { Database } from '@/types/supabase';
import { toUUID, generateUUID } from '@/utils/uuid';

// Define basic types based on Database
type DatabaseBouquet = Database['public']['Tables']['bouquets']['Row'];
export type Category = Database['public']['Tables']['categories']['Row'];
export type Flower = Database['public']['Tables']['flowers']['Row'];
export type Tag = Database['public']['Tables']['tags']['Row'];
export type BouquetFlower = Database['public']['Tables']['bouquet_flowers']['Row'];
export type BouquetMedia = Database['public']['Tables']['bouquet_media']['Row'];

// Extended Bouquet type that includes media-related fields
export type Bouquet = DatabaseBouquet & {
  // These fields are added by the repository when fetching
  media?: BouquetMedia[];
  image?: string | null;  // URL of the thumbnail image
  thumbnail?: BouquetMedia | null;  // Full thumbnail media object
  flowers?: Array<{
    id: string;
    flower_id: string;
    name: string;
    quantity: number;
  }>;  // Flowers in the bouquet
};

// Type for flower in a custom bouquet with quantity and color
export interface FlowerQuantity {
  flowerId: string;
  quantity: number;
  color: string;
  flowerName?: string; // Optional name for display purposes
}

// Define a repository for Supabase operations
export async function getFlowers() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('flowers')
    .select('*')
    .eq('is_available', true)
    .order('name');
  
  if (error) {
    console.error('Error fetching flowers:', error);
    return [];
  }
  
  return data || [];
}

export async function getBouquetById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('bouquets')
    .select(`
      *,
      bouquet_flowers!inner(
        flower_id,
        quantity
      )
    `)
    .eq('id', toUUID(id))
    .single();
  
  if (error) {
    console.error('Error fetching bouquet:', error);
    return null;
  }
  
  return data;
}

export async function getFlowersByIds(ids: string[]) {
  if (!ids.length) return [];
  
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('flowers')
    .select('*')
    .in('id', ids.map(id => toUUID(id)));
  
  if (error) {
    console.error('Error fetching flowers by ids:', error);
    return [];
  }
  
  return data || [];
}

// Calculate price for a custom bouquet
export function calculateCustomBouquetPrice(flowerQuantities: FlowerQuantity[], flowers?: Flower[]): number {
  if (!flowerQuantities.length) return 0;
  
  // If flowers are provided, use them, otherwise they need to be fetched (client-side)
  if (flowers && flowers.length) {
    return flowerQuantities.reduce((total, item) => {
      const flower = flowers.find(f => f.id === item.flowerId);
      return total + (flower ? flower.price * item.quantity : 0);
    }, 0);
  }
  
  // This is a fallback for client-side calculations
  return 0;
}

// Repository functions for Flowers
export const FlowerRepository = {
  async getAll(): Promise<Flower[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('flowers')
      .select('*')
      .order('name');
      
    if (error) throw error;
    return data || [];
  },
  
  async getById(id: string): Promise<Flower | null> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('flowers')
      .select('*')
      .eq('id', toUUID(id))
      .single();
      
    if (error) throw error;
    return data;
  },
  
  async create(flower: Omit<Flower, 'id' | 'created_at' | 'updated_at'>): Promise<Flower> {
    const supabase = await createClient();
    const flowerWithId = {
      ...flower,
      id: generateUUID()
    };
    const { data, error } = await supabase
      .from('flowers')
      .insert([flowerWithId])
      .select()
      .single();
      
    if (error) throw error;
    return data;
  },
  
  async update(id: string, flower: Partial<Omit<Flower, 'id' | 'created_at' | 'updated_at'>>): Promise<Flower> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('flowers')
      .update(flower)
      .eq('id', toUUID(id))
      .select()
      .single();
      
    if (error) throw error;
    return data;
  },
  
  async delete(id: string): Promise<void> {
    const supabase = await createClient();
    const { error } = await supabase
      .from('flowers')
      .delete()
      .eq('id', toUUID(id));
      
    if (error) throw error;
  },
  
  async getColors(flowerId: string): Promise<string[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('flower_colors')
      .select('color_id')
      .eq('flower_id', toUUID(flowerId));
    
    if (error) throw error;
    return data?.map(item => item.color_id) || [];
  },
  
  async setColors(flowerId: string, colorIds: string[]): Promise<void> {
    const supabase = await createClient();
    
    // First delete existing color associations
    const { error: deleteError } = await supabase
      .from('flower_colors')
      .delete()
      .eq('flower_id', toUUID(flowerId));
    
    if (deleteError) throw deleteError;
    
    // Skip if no colors to add
    if (!colorIds.length) return;
    
    // Create new color associations
    const flowerColors = colorIds.map(colorId => ({
      flower_id: toUUID(flowerId),
      color_id: toUUID(colorId)
    }));
    
    const { error: insertError } = await supabase
      .from('flower_colors')
      .insert(flowerColors);
    
    if (insertError) throw insertError;
  }
};

// Repository functions for Bouquets
export const BouquetRepository = {
  async getAll(): Promise<Bouquet[]> {
    console.log('[SUPABASE LOG] Fetching all bouquets');
    const startTime = performance.now();
    
    try {
      // Check Redis cache first
      const cacheKey = 'bouquets:all';
      console.log(`[SUPABASE LOG] 🔍 Checking Redis cache for key: "${cacheKey}"`);
      
      // Import Redis functions
      const { getCachedData, setCachedData } = await import('@/lib/redis');
      
      // Try to get data from cache
      const cachedData = await getCachedData<Bouquet[]>(cacheKey);
      if (cachedData) {
        console.log(`[SUPABASE LOG] ⚡ Serving ${cachedData.length} bouquets from Redis cache`);
        return cachedData;
      }
      
      console.log(`[SUPABASE LOG] 🔄 Redis cache miss, fetching from database`);
      
      const supabase = await createServerLoggingClient();
      
      // First, get all bouquets
      const { data: bouquets, error } = await supabase
        .from('bouquets')
        .select('*')
        .order('name');
        
      if (error) throw error;
      
      // If no bouquets returned, just return empty array
      if (!bouquets || bouquets.length === 0) {
        const endTime = performance.now();
        console.log(`[SUPABASE LOG] Fetched 0 bouquets in ${(endTime - startTime).toFixed(2)}ms`);
        return [];
      }
      
      // Get all bouquet IDs
      const bouquetIds = bouquets.map(b => b.id);
      
      // Fetch media for all bouquets in a single query for efficiency
      const { data: allMedia, error: mediaError } = await supabase
        .from('bouquet_media')
        .select('*')
        .in('bouquet_id', bouquetIds)
        .order('display_order');
      
      if (mediaError) {
        console.warn('[SUPABASE WARNING] Error fetching bouquet media:', mediaError);
        // Continue execution even if media fetch fails
      }
      
      // Group media by bouquet_id for easier assignment
      const mediaByBouquetId: Record<string, BouquetMedia[]> = {};
      if (allMedia && allMedia.length > 0) {
        allMedia.forEach(media => {
          if (!mediaByBouquetId[media.bouquet_id]) {
            mediaByBouquetId[media.bouquet_id] = [];
          }
          mediaByBouquetId[media.bouquet_id].push(media);
        });
      }
      
      // Enhance bouquets with media and thumbnail information
      const enhancedBouquets = bouquets.map(bouquet => {
        const bouquetMedia = mediaByBouquetId[bouquet.id] || [];
        
        // Find thumbnail - first priority is the one marked as thumbnail, then first in order
        const thumbnail = bouquetMedia.find(m => m.is_thumbnail) || bouquetMedia[0] || null;
        
        // Calculate image URL from the thumbnail if available
        let imageUrl = null;
        if (thumbnail) {
          if (thumbnail.file_url) {
            imageUrl = thumbnail.file_url;
          } else if (thumbnail.file_path) {
            // Use the utility function to get file URL from path
            const { getFileUrl } = require('@/utils/cloudflare-worker');
            imageUrl = getFileUrl(thumbnail.file_path);
          }
        } else {
          // Set a default placeholder if no media is available
          imageUrl = '/placeholder-bouquet.jpg';
        }
        
        return {
          ...bouquet,
          media: bouquetMedia,
          thumbnail,
          image: imageUrl
        } as Bouquet;
      });
      
      // Store in Redis cache (1 hour TTL)
      console.log(`[SUPABASE LOG] 💾 Storing ${enhancedBouquets.length} bouquets in Redis cache`);
      await setCachedData(cacheKey, enhancedBouquets, 60 * 60);
      
      const endTime = performance.now();
      console.log(`[SUPABASE LOG] Fetched ${enhancedBouquets.length} bouquets with media in ${(endTime - startTime).toFixed(2)}ms`);
      
      return enhancedBouquets;
    } catch (error) {
      console.error('[SUPABASE ERROR] Failed to fetch bouquets:', error);
      throw error;
    }
  },
  
  async getAllWithFlowers(): Promise<Bouquet[]> {
    console.log('[SUPABASE LOG] Fetching all bouquets with flowers');
    const startTime = performance.now();
    
    try {
      // Check Redis cache first
      const cacheKey = 'bouquets:all:with-flowers';
      console.log(`[SUPABASE LOG] 🔍 Checking Redis cache for key: "${cacheKey}"`);
      
      // Import Redis functions
      const { getCachedData, setCachedData } = await import('@/lib/redis');
      
      // Try to get data from cache
      const cachedData = await getCachedData<Bouquet[]>(cacheKey);
      if (cachedData) {
        console.log(`[SUPABASE LOG] ⚡ Serving ${cachedData.length} bouquets with flowers from Redis cache`);
        return cachedData;
      }
      
      console.log(`[SUPABASE LOG] 🔄 Redis cache miss, fetching from database`);
      
      // If not in cache, fetch from database
      // First get all bouquets with media
      const bouquets = await this.getAll();
      
      if (!bouquets || bouquets.length === 0) {
        return [];
      }
      
      const supabase = await createServerLoggingClient();
      
      // Get all bouquet IDs
      const bouquetIds = bouquets.map(b => b.id);
      
      // Fetch all bouquet-flower relationships with flower details in a single query
      const { data: allBouquetFlowers, error: flowersError } = await supabase
        .from('bouquet_flowers')
        .select(`
          id,
          bouquet_id,
          flower_id,
          quantity,
          flowers:flower_id(id, name)
        `)
        .in('bouquet_id', bouquetIds);
        
      if (flowersError) {
        console.warn('[SUPABASE WARNING] Error fetching bouquet flowers:', flowersError);
        // Continue execution even if flower fetch fails
        return bouquets;
      }
      
      // Group flowers by bouquet_id
      const flowersByBouquetId: Record<string, any[]> = {};
      if (allBouquetFlowers && allBouquetFlowers.length > 0) {
        allBouquetFlowers.forEach(item => {
          if (!flowersByBouquetId[item.bouquet_id]) {
            flowersByBouquetId[item.bouquet_id] = [];
          }
          
          flowersByBouquetId[item.bouquet_id].push({
            id: item.id,
            flower_id: item.flower_id,
            name: item.flowers ? item.flowers.name : 'Unknown Flower',
            quantity: item.quantity
          });
        });
      }
      
      // Add flower information to each bouquet
      const enhancedBouquets = bouquets.map(bouquet => ({
        ...bouquet,
        flowers: flowersByBouquetId[bouquet.id] || []
      }));
      
      // Store in Redis cache (1 hour TTL)
      console.log(`[SUPABASE LOG] 💾 Storing ${enhancedBouquets.length} bouquets with flowers in Redis cache`);
      await setCachedData(cacheKey, enhancedBouquets, 60 * 60);
      
      const endTime = performance.now();
      console.log(`[SUPABASE LOG] Fetched ${enhancedBouquets.length} bouquets with flowers in ${(endTime - startTime).toFixed(2)}ms`);
      
      return enhancedBouquets;
    } catch (error) {
      console.error('[SUPABASE ERROR] Failed to fetch bouquets with flowers:', error);
      throw error;
    }
  },
  
  async getById(id: string): Promise<Bouquet | null> {
    console.log(`[SUPABASE LOG] Fetching bouquet with ID: ${id}`);
    const startTime = performance.now();
    
    try {
      // Check Redis cache first
      const cacheKey = `bouquet:${id}`;
      console.log(`[SUPABASE LOG] 🔍 Checking Redis cache for key: "${cacheKey}"`);
      
      // Import Redis functions
      const { getCachedData, setCachedData } = await import('@/lib/redis');
      
      // Try to get data from cache
      const cachedData = await getCachedData<Bouquet | null>(cacheKey);
      if (cachedData) {
        console.log(`[SUPABASE LOG] ⚡ Serving bouquet from Redis cache: ${id}`);
        return cachedData;
      }
      
      console.log(`[SUPABASE LOG] 🔄 Redis cache miss, fetching bouquet from database: ${id}`);
      
      const supabase = await createServerLoggingClient();
      const { data, error } = await supabase
        .from('bouquets')
        .select('*')
        .eq('id', toUUID(id))
        .single();
        
      if (error) throw error;
      
      // Store in Redis cache (30 minutes TTL)
      console.log(`[SUPABASE LOG] 💾 Storing bouquet in Redis cache with key "${cacheKey}"`);
      await setCachedData(cacheKey, data, 30 * 60);
      
      const endTime = performance.now();
      console.log(`[SUPABASE LOG] Bouquet fetch completed in ${(endTime - startTime).toFixed(2)}ms. Found: ${data ? 'Yes' : 'No'}`);
      
      return data;
    } catch (error) {
      console.error(`[SUPABASE ERROR] Failed to fetch bouquet with ID ${id}:`, error);
      throw error;
    }
  },
  
  async getBouquetWithFlowers(id: string): Promise<{ bouquet: Bouquet, flowers: BouquetFlower[] }> {
    console.log(`[SUPABASE LOG] Fetching bouquet with flowers. ID: ${id}`);
    const startTime = performance.now();
    
    try {
      const supabase = await createServerLoggingClient();
      // Get the bouquet
      const { data: bouquet, error: bouquetError } = await supabase
        .from('bouquets')
        .select('*')
        .eq('id', toUUID(id))
        .single();
        
      if (bouquetError) throw bouquetError;
      
      // Get the bouquet flowers with flower details
      const { data: bouquetFlowers, error: flowersError } = await supabase
        .from('bouquet_flowers')
        .select(`
          id,
          bouquet_id,
          flower_id,
          quantity,
          created_at,
          updated_at,
          flowers(*)
        `)
        .eq('bouquet_id', toUUID(id));
        
      if (flowersError) throw flowersError;
      
      const endTime = performance.now();
      console.log(`[SUPABASE LOG] Bouquet with flowers fetch completed in ${(endTime - startTime).toFixed(2)}ms. Flowers count: ${bouquetFlowers?.length || 0}`);
      
      return {
        bouquet,
        flowers: bouquetFlowers || []
      };
    } catch (error) {
      console.error(`[SUPABASE ERROR] Failed to fetch bouquet with flowers. ID: ${id}:`, error);
      throw error;
    }
  },
  
  async create(bouquet: Omit<Bouquet, 'id' | 'created_at' | 'updated_at'>): Promise<Bouquet> {
    console.log('[SUPABASE LOG] Creating new bouquet:', bouquet.name);
    const startTime = performance.now();
    
    try {
      const supabase = await createServerLoggingClient();
      
      // Generate a UUID for new bouquets
      const bouquetWithId = {
        ...bouquet,
        id: generateUUID()
      };
      
      const { data, error } = await supabase
        .from('bouquets')
        .insert([bouquetWithId])
        .select()
        .single();
        
      if (error) throw error;
      
      const endTime = performance.now();
      console.log(`[SUPABASE LOG] Bouquet created successfully in ${(endTime - startTime).toFixed(2)}ms. ID: ${data.id}`);
      
      return data;
    } catch (error) {
      console.error('[SUPABASE ERROR] Failed to create bouquet:', error);
      throw error;
    }
  },
  
  async update(id: string, bouquet: Partial<Omit<Bouquet, 'id' | 'created_at' | 'updated_at'>>): Promise<Bouquet> {
    console.log(`[SUPABASE LOG] Updating bouquet. ID: ${id}`);
    const startTime = performance.now();
    
    try {
      const supabase = await createServerLoggingClient();
      const { data, error } = await supabase
        .from('bouquets')
        .update(bouquet)
        .eq('id', toUUID(id))
        .select()
        .single();
        
      if (error) throw error;
      
      const endTime = performance.now();
      console.log(`[SUPABASE LOG] Bouquet updated successfully in ${(endTime - startTime).toFixed(2)}ms. ID: ${data.id}`);
      
      return data;
    } catch (error) {
      console.error(`[SUPABASE ERROR] Failed to update bouquet. ID: ${id}:`, error);
      throw error;
    }
  },
  
  async delete(id: string): Promise<void> {
    const supabase = await createClient();
    const { error } = await supabase
      .from('bouquets')
      .delete()
      .eq('id', toUUID(id));
      
    if (error) throw error;
  },
  
  async addFlowerToBouquet(bouquetId: string, flowerId: string, quantity: number): Promise<void> {
    const supabase = await createClient();
    const { error } = await supabase
      .from('bouquet_flowers')
      .insert([{
        bouquet_id: toUUID(bouquetId),
        flower_id: toUUID(flowerId),
        quantity
      }]);
      
    if (error) throw error;
  },
  
  async updateBouquetFlower(id: string, quantity: number): Promise<void> {
    const supabase = await createClient();
    const { error } = await supabase
      .from('bouquet_flowers')
      .update({ quantity })
      .eq('id', toUUID(id));
      
    if (error) throw error;
  },
  
  async removeFlowerFromBouquet(id: string): Promise<void> {
    const supabase = await createClient();
    const { error } = await supabase
      .from('bouquet_flowers')
      .delete()
      .eq('id', toUUID(id));
      
    if (error) throw error;
  }
};

// Repository functions for Categories
export const CategoryRepository = {
  async getAll(): Promise<Category[]> {
    console.log('[SUPABASE LOG] Fetching all categories');
    const startTime = performance.now();
    
    try {
      const supabase = await createServerLoggingClient();
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');
        
      if (error) throw error;
      
      const endTime = performance.now();
      console.log(`[SUPABASE LOG] Fetched ${data?.length || 0} categories in ${(endTime - startTime).toFixed(2)}ms`);
      
      return data || [];
    } catch (error) {
      console.error('[SUPABASE ERROR] Failed to fetch categories:', error);
      throw error;
    }
  },
  
  async getById(id: string): Promise<Category | null> {
    console.log(`[SUPABASE LOG] Fetching category with ID: ${id}`);
    const startTime = performance.now();
    
    try {
      const supabase = await createServerLoggingClient();
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('id', toUUID(id))
        .single();
        
      if (error) throw error;
      
      const endTime = performance.now();
      console.log(`[SUPABASE LOG] Category fetch completed in ${(endTime - startTime).toFixed(2)}ms. Found: ${data ? 'Yes' : 'No'}`);
      
      return data;
    } catch (error) {
      console.error(`[SUPABASE ERROR] Failed to fetch category with ID ${id}:`, error);
      throw error;
    }
  },
  
  async create(category: Omit<Category, 'id' | 'created_at' | 'updated_at'>): Promise<Category> {
    console.log(`[SUPABASE LOG] Creating new category: ${category.name}`);
    const startTime = performance.now();
    
    try {
      const supabase = await createServerLoggingClient();
      const categoryWithId = {
        ...category,
        id: generateUUID()
      };
      const { data, error } = await supabase
        .from('categories')
        .insert([categoryWithId])
        .select()
        .single();
        
      if (error) throw error;
      
      const endTime = performance.now();
      console.log(`[SUPABASE LOG] Category created in ${(endTime - startTime).toFixed(2)}ms. New ID: ${data.id}`);
      
      return data;
    } catch (error) {
      console.error('[SUPABASE ERROR] Failed to create category:', error);
      throw error;
    }
  },
  
  async update(id: string, category: Partial<Omit<Category, 'id' | 'created_at' | 'updated_at'>>): Promise<Category> {
    console.log(`[SUPABASE LOG] Updating category with ID: ${id}`);
    const startTime = performance.now();
    
    try {
      const supabase = await createServerLoggingClient();
      const { data, error } = await supabase
        .from('categories')
        .update(category)
        .eq('id', toUUID(id))
        .select()
        .single();
        
      if (error) throw error;
      
      const endTime = performance.now();
      console.log(`[SUPABASE LOG] Category updated in ${(endTime - startTime).toFixed(2)}ms`);
      
      return data;
    } catch (error) {
      console.error(`[SUPABASE ERROR] Failed to update category with ID ${id}:`, error);
      throw error;
    }
  },
  
  async delete(id: string): Promise<void> {
    console.log(`[SUPABASE LOG] Deleting category with ID: ${id}`);
    const startTime = performance.now();
    
    try {
      const supabase = await createServerLoggingClient();
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', toUUID(id));
        
      if (error) throw error;
      
      const endTime = performance.now();
      console.log(`[SUPABASE LOG] Category deleted in ${(endTime - startTime).toFixed(2)}ms`);
    } catch (error) {
      console.error(`[SUPABASE ERROR] Failed to delete category with ID ${id}:`, error);
      throw error;
    }
  }
};

// Repository functions for Tags
export const TagRepository = {
  async getAll(): Promise<Tag[]> {
    console.log('[SUPABASE LOG] Fetching all tags');
    const startTime = performance.now();
    
    try {
      const supabase = await createAdminLoggingClient();
      const { data, error } = await supabase
        .from('tags')
        .select('*')
        .order('name');
        
      if (error) throw error;
      
      const endTime = performance.now();
      console.log(`[SUPABASE LOG] Fetched ${data?.length || 0} tags in ${(endTime - startTime).toFixed(2)}ms`);
      
      return data || [];
    } catch (error) {
      console.error('[SUPABASE ERROR] Failed to fetch tags:', error);
      throw error;
    }
  },
  
  async getById(id: string): Promise<Tag | null> {
    console.log(`[SUPABASE LOG] Fetching tag with ID: ${id}`);
    const startTime = performance.now();
    
    try {
      const supabase = await createAdminLoggingClient();
      const { data, error } = await supabase
        .from('tags')
        .select('*')
        .eq('id', toUUID(id))
        .single();
        
      if (error) throw error;
      
      const endTime = performance.now();
      console.log(`[SUPABASE LOG] Tag fetch completed in ${(endTime - startTime).toFixed(2)}ms. Found: ${data ? 'Yes' : 'No'}`);
      
      return data;
    } catch (error) {
      console.error(`[SUPABASE ERROR] Failed to fetch tag with ID ${id}:`, error);
      throw error;
    }
  },
  
  async create(tag: Omit<Tag, 'id' | 'created_at' | 'updated_at'>): Promise<Tag> {
    console.log(`[SUPABASE LOG] Creating new tag: ${tag.name}`);
    const startTime = performance.now();
    
    try {
      const supabase = await createAdminLoggingClient();
      const tagWithId = {
        ...tag,
        id: generateUUID()
      };
      const { data, error } = await supabase
        .from('tags')
        .insert([tagWithId])
        .select()
        .single();
        
      if (error) throw error;
      
      const endTime = performance.now();
      console.log(`[SUPABASE LOG] Tag created in ${(endTime - startTime).toFixed(2)}ms. New ID: ${data.id}`);
      
      return data;
    } catch (error) {
      console.error('[SUPABASE ERROR] Failed to create tag:', error);
      throw error;
    }
  },
  
  async update(id: string, tag: Partial<Omit<Tag, 'id' | 'created_at' | 'updated_at'>>): Promise<Tag> {
    console.log(`[SUPABASE LOG] Updating tag with ID: ${id}`);
    const startTime = performance.now();
    
    try {
      const supabase = await createAdminLoggingClient();
      const { data, error } = await supabase
        .from('tags')
        .update(tag)
        .eq('id', toUUID(id))
        .select()
        .single();
        
      if (error) throw error;
      
      const endTime = performance.now();
      console.log(`[SUPABASE LOG] Tag updated in ${(endTime - startTime).toFixed(2)}ms`);
      
      return data;
    } catch (error) {
      console.error(`[SUPABASE ERROR] Failed to update tag with ID ${id}:`, error);
      throw error;
    }
  },
  
  async delete(id: string): Promise<void> {
    console.log(`[SUPABASE LOG] Deleting tag with ID: ${id}`);
    const startTime = performance.now();
    
    try {
      const supabase = await createAdminLoggingClient();
      const { error } = await supabase
        .from('tags')
        .delete()
        .eq('id', toUUID(id));
        
      if (error) throw error;
      
      const endTime = performance.now();
      console.log(`[SUPABASE LOG] Tag deleted in ${(endTime - startTime).toFixed(2)}ms`);
    } catch (error) {
      console.error(`[SUPABASE ERROR] Failed to delete tag with ID ${id}:`, error);
      throw error;
    }
  }
}; 