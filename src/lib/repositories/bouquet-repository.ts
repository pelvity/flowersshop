import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/supabase';
import { 
  Bouquet, 
  BouquetFilter, 
  PaginatedResult, 
  PaginationOptions,
  Tag
} from './repository-types';

export class BouquetRepository {
  private supabase = createClientComponentClient<Database>();

  /**
   * Get all bouquets with optional filtering and pagination
   */
  async getAll(
    filter?: BouquetFilter,
    pagination?: PaginationOptions
  ): Promise<PaginatedResult<Bouquet>> {
    // Start with the base query
    let query = this.supabase
      .from('bouquets')
      .select('*, categories(*)');
    
    // Apply filters if provided
    if (filter) {
      if (filter.categoryId) {
        query = query.eq('category_id', filter.categoryId);
      }
      
      if (filter.featured !== undefined) {
        query = query.eq('featured', filter.featured);
      }
      
      if (filter.inStock !== undefined) {
        query = query.eq('in_stock', filter.inStock);
      }
      
      if (filter.minPrice !== undefined) {
        query = query.gte('price', filter.minPrice);
      }
      
      if (filter.maxPrice !== undefined) {
        query = query.lte('price', filter.maxPrice);
      }
      
      if (filter.searchQuery) {
        query = query.or(`name.ilike.%${filter.searchQuery}%,description.ilike.%${filter.searchQuery}%`);
      }
    }
    
    // Get count before applying pagination
    // Using a separate query for count
    const { count } = await this.supabase
      .from('bouquets')
      .select('*', { count: 'exact', head: true });
    
    const total = count || 0;
    
    // Apply pagination if provided
    if (pagination) {
      const { page, pageSize } = pagination;
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      
      query = query.range(from, to);
    }
    
    // Execute the query
    const { data: bouquets, error } = await query.order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching bouquets:', error);
      throw error;
    }
    
    // Fetch tags for each bouquet
    const bouquetsWithTags = await Promise.all(
      (bouquets || []).map(async (bouquet) => {
        const tags = await this.getBouquetTags(bouquet.id);
        return {
          ...bouquet,
          tags
        };
      })
    );
    
    return {
      data: bouquetsWithTags,
      total,
      page: pagination?.page || 1,
      pageSize: pagination?.pageSize || bouquetsWithTags.length,
      totalPages: pagination ? Math.ceil(total / pagination.pageSize) : 1
    };
  }
  
  /**
   * Get a single bouquet by ID with all related data
   */
  async getById(id: string): Promise<Bouquet | null> {
    // Get the bouquet with its category
    const { data: bouquet, error } = await this.supabase
      .from('bouquets')
      .select('*, categories(*)')
      .eq('id', id)
      .single();
      
    if (error) {
      console.error('Error fetching bouquet:', error);
      return null;
    }
    
    if (!bouquet) {
      return null;
    }
    
    // Get tags
    const tags = await this.getBouquetTags(id);
    
    // Get media
    const { data: media } = await this.supabase
      .from('bouquet_media')
      .select('*')
      .eq('bouquet_id', id)
      .order('display_order', { ascending: true });
      
    // Get flowers composition
    const { data: bouquetFlowers } = await this.supabase
      .from('bouquet_flowers')
      .select('*, flowers(*)')
      .eq('bouquet_id', id);
      
    const flowers = bouquetFlowers?.map(bf => ({
      flower: bf.flowers,
      quantity: bf.quantity
    })) || [];
    
    // Return the complete bouquet with all related data
    return {
      ...bouquet,
      tags,
      media: media || [],
      flowers
    };
  }
  
  /**
   * Get featured bouquets
   */
  async getFeatured(limit: number = 6): Promise<Bouquet[]> {
    return this.getAll(
      { featured: true },
      { page: 1, pageSize: limit }
    ).then(result => result.data);
  }
  
  /**
   * Get tags for a bouquet
   */
  private async getBouquetTags(bouquetId: string): Promise<Tag[]> {
    const { data } = await this.supabase
      .from('bouquet_tags')
      .select('tags(*)')
      .eq('bouquet_id', bouquetId);
      
    // Transform the nested tags structure to a flat array of Tag objects
    // Using explicit type casting to handle Supabase typing issues
    return data?.map(item => {
      const tagData = item.tags as any;
      return {
        id: tagData.id,
        name: tagData.name,
        created_at: tagData.created_at,
        updated_at: tagData.updated_at
      } as Tag;
    }) || [];
  }
  
  /**
   * Create a new bouquet
   */
  async create(bouquet: Partial<Bouquet>): Promise<Bouquet | null> {
    const { tags, ...bouquetData } = bouquet;
    
    // Insert the bouquet
    const { data, error } = await this.supabase
      .from('bouquets')
      .insert(bouquetData)
      .select()
      .single();
      
    if (error || !data) {
      console.error('Error creating bouquet:', error);
      return null;
    }
    
    // Add tags if provided
    if (tags && tags.length > 0) {
      await this.updateBouquetTags(data.id, tags);
    }
    
    return this.getById(data.id);
  }
  
  /**
   * Update an existing bouquet
   */
  async update(id: string, bouquet: Partial<Bouquet>): Promise<Bouquet | null> {
    const { tags, ...bouquetData } = bouquet;
    
    // Update the bouquet
    const { error } = await this.supabase
      .from('bouquets')
      .update(bouquetData)
      .eq('id', id);
      
    if (error) {
      console.error('Error updating bouquet:', error);
      return null;
    }
    
    // Update tags if provided
    if (tags) {
      await this.updateBouquetTags(id, tags);
    }
    
    return this.getById(id);
  }
  
  /**
   * Delete a bouquet
   */
  async delete(id: string): Promise<boolean> {
    const { error } = await this.supabase
      .from('bouquets')
      .delete()
      .eq('id', id);
      
    return !error;
  }
  
  /**
   * Update tags for a bouquet
   */
  private async updateBouquetTags(bouquetId: string, tags: Tag[]): Promise<void> {
    // First delete existing tags
    await this.supabase
      .from('bouquet_tags')
      .delete()
      .eq('bouquet_id', bouquetId);
      
    // Then insert new tags
    if (tags.length > 0) {
      const tagRows = tags.map(tag => ({
        bouquet_id: bouquetId,
        tag_id: tag.id
      }));
      
      await this.supabase
        .from('bouquet_tags')
        .insert(tagRows);
    }
  }
} 