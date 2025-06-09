import { createClient } from '@/utils/supabase/server';
import type { Database } from '@/types/supabase';

// Define types based on Database
export type Bouquet = Database['public']['Tables']['bouquets']['Row'];
export type Category = Database['public']['Tables']['categories']['Row'];
export type Flower = Database['public']['Tables']['flowers']['Row'];
export type Tag = Database['public']['Tables']['tags']['Row'];
export type BouquetFlower = Database['public']['Tables']['bouquet_flowers']['Row'];

// Type for flower in a custom bouquet with quantity and color
export interface FlowerQuantity {
  flowerId: string;
  quantity: number;
  color: string;
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
    .eq('id', id)
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
    .in('id', ids);
  
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
      .eq('id', id)
      .single();
      
    if (error) throw error;
    return data;
  },
  
  async create(flower: Omit<Flower, 'id' | 'created_at' | 'updated_at'>): Promise<Flower> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('flowers')
      .insert([flower])
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
      .eq('id', id)
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
      .eq('id', id);
      
    if (error) throw error;
  }
};

// Repository functions for Bouquets
export const BouquetRepository = {
  async getAll(): Promise<Bouquet[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('bouquets')
      .select('*')
      .order('name');
      
    if (error) throw error;
    return data || [];
  },
  
  async getById(id: string): Promise<Bouquet | null> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('bouquets')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) throw error;
    return data;
  },
  
  async getBouquetWithFlowers(id: string): Promise<{ bouquet: Bouquet, flowers: BouquetFlower[] }> {
    const supabase = await createClient();
    // Get the bouquet
    const { data: bouquet, error: bouquetError } = await supabase
      .from('bouquets')
      .select('*')
      .eq('id', id)
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
      .eq('bouquet_id', id);
      
    if (flowersError) throw flowersError;
    
    return {
      bouquet,
      flowers: bouquetFlowers || []
    };
  },
  
  async create(bouquet: Omit<Bouquet, 'id' | 'created_at' | 'updated_at'>): Promise<Bouquet> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('bouquets')
      .insert([bouquet])
      .select()
      .single();
      
    if (error) throw error;
    return data;
  },
  
  async update(id: string, bouquet: Partial<Omit<Bouquet, 'id' | 'created_at' | 'updated_at'>>): Promise<Bouquet> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('bouquets')
      .update(bouquet)
      .eq('id', id)
      .select()
      .single();
      
    if (error) throw error;
    return data;
  },
  
  async delete(id: string): Promise<void> {
    const supabase = await createClient();
    const { error } = await supabase
      .from('bouquets')
      .delete()
      .eq('id', id);
      
    if (error) throw error;
  },
  
  async addFlowerToBouquet(bouquetId: string, flowerId: string, quantity: number): Promise<void> {
    const supabase = await createClient();
    const { error } = await supabase
      .from('bouquet_flowers')
      .insert([{
        bouquet_id: bouquetId,
        flower_id: flowerId,
        quantity: quantity
      }]);
      
    if (error) throw error;
  },
  
  async updateBouquetFlower(id: string, quantity: number): Promise<void> {
    const supabase = await createClient();
    const { error } = await supabase
      .from('bouquet_flowers')
      .update({ quantity })
      .eq('id', id);
      
    if (error) throw error;
  },
  
  async removeFlowerFromBouquet(id: string): Promise<void> {
    const supabase = await createClient();
    const { error } = await supabase
      .from('bouquet_flowers')
      .delete()
      .eq('id', id);
      
    if (error) throw error;
  }
};

// Repository functions for Categories
export const CategoryRepository = {
  async getAll(): Promise<Category[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');
      
    if (error) throw error;
    return data || [];
  },
  
  async getById(id: string): Promise<Category | null> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) throw error;
    return data;
  },
  
  async create(category: Omit<Category, 'id' | 'created_at' | 'updated_at'>): Promise<Category> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('categories')
      .insert([category])
      .select()
      .single();
      
    if (error) throw error;
    return data;
  },
  
  async update(id: string, category: Partial<Omit<Category, 'id' | 'created_at' | 'updated_at'>>): Promise<Category> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('categories')
      .update(category)
      .eq('id', id)
      .select()
      .single();
      
    if (error) throw error;
    return data;
  },
  
  async delete(id: string): Promise<void> {
    const supabase = await createClient();
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);
      
    if (error) throw error;
  }
};

// Repository functions for Tags
export const TagRepository = {
  async getAll(): Promise<Tag[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('tags')
      .select('*')
      .order('name');
      
    if (error) throw error;
    return data || [];
  },
  
  async getById(id: string): Promise<Tag | null> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('tags')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) throw error;
    return data;
  },
  
  async create(tag: Omit<Tag, 'id' | 'created_at' | 'updated_at'>): Promise<Tag> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('tags')
      .insert([tag])
      .select()
      .single();
      
    if (error) throw error;
    return data;
  },
  
  async update(id: string, tag: Partial<Omit<Tag, 'id' | 'created_at' | 'updated_at'>>): Promise<Tag> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('tags')
      .update(tag)
      .eq('id', id)
      .select()
      .single();
      
    if (error) throw error;
    return data;
  },
  
  async delete(id: string): Promise<void> {
    const supabase = await createClient();
    const { error } = await supabase
      .from('tags')
      .delete()
      .eq('id', id);
      
    if (error) throw error;
  }
}; 