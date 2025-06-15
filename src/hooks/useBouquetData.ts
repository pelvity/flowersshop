'use client';

import { useState, useEffect } from 'react';
import { createLoggingClient } from '@/utils/supabase-logger';
import { ApiLogger } from '@/utils/api-logger';
import { getFileUrl } from '@/utils/cloudflare-worker';
import { Tag } from '@/lib/repositories/repository-types';

// Define types
export type Flower = {
  id: string;
  name: string;
  price: number;
  description?: string | null;
  in_stock: number;
};

export type BouquetFlower = {
  id: string;
  bouquet_id: string;
  flower_id: string;
  quantity: number;
  flowers: Flower;
};

export type FlowerWithQuantity = {
  id: string;
  flower_id?: string;
  name: string;
  price: number;
  quantity: number;
};

export type BouquetMedia = {
  id: string;
  bouquet_id: string;
  media_type: 'image' | 'video';
  file_path: string;
  file_url?: string;
  file_name: string;
  file_size: number;
  content_type: string;
  display_order: number;
  is_thumbnail: boolean;
  created_at?: string;
  updated_at?: string;
  // For local state management
  file?: File;
  url?: string;
  isUploading?: boolean;
  uploadProgress?: number;
};

export type Bouquet = {
  id: string;
  name: string;
  price: string;
  discount_price: string;
  description: string;
  category_id: string;
  in_stock: boolean;
  featured: boolean;
  flowers: FlowerWithQuantity[];
  media: BouquetMedia[];
  tags: Tag[];
};

export type Category = {
  id: string;
  name: string;
  description?: string;
};

// Create logger
const logger = new ApiLogger('useBouquetData');

export function useBouquetData(bouquetId: string) {
  const [bouquet, setBouquet] = useState<Bouquet>({
    id: bouquetId,
    name: '',
    price: '',
    discount_price: '',
    description: '',
    category_id: '',
    in_stock: true,
    featured: false,
    flowers: [],
    media: [],
    tags: []
  });
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [availableFlowers, setAvailableFlowers] = useState<Flower[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch all data
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      const startTime = logger.request('GET', `bouquet/${bouquetId}`);
      
      try {
        const supabase = createLoggingClient();
        
        // Fetch the bouquet
        const { data: bouquetData, error: bouquetError } = await supabase
          .from('bouquets')
          .select('*')
          .eq('id', bouquetId)
          .single();
        
        if (bouquetError) throw bouquetError;
        
        // Fetch the bouquet flowers with flower details
        const { data: bouquetFlowers, error: flowersError } = await supabase
          .from('bouquet_flowers')
          .select(`
            id,
            bouquet_id,
            flower_id,
            quantity,
            flowers (
              id,
              name,
              price,
              description,
              in_stock
            )
          `)
          .eq('bouquet_id', bouquetId);
        
        if (flowersError) throw flowersError;
        
        // Fetch all categories
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('categories')
          .select('*')
          .order('name');
        
        if (categoriesError) throw categoriesError;
        
        // Fetch all available flowers for selection
        const { data: allFlowers, error: allFlowersError } = await supabase
          .from('flowers')
          .select('*')
          .order('name');
        
        if (allFlowersError) throw allFlowersError;
        
        // Fetch bouquet media
        const { data: bouquetMedia, error: mediaError } = await supabase
          .from('bouquet_media')
          .select('*')
          .eq('bouquet_id', bouquetId)
          .order('display_order');
        
        if (mediaError) {
          console.warn('Error fetching bouquet media:', mediaError);
          // Continue execution even if media table doesn't exist yet
          // This allows the app to function before migrations are run
        }
        
        // Fetch bouquet tags
        const { data: bouquetTags, error: tagsError } = await supabase
          .from('bouquet_tags')
          .select(`
            tags (
              id,
              name
            )
          `)
          .eq('bouquet_id', bouquetId);

        if (tagsError) {
          console.warn('Error fetching bouquet tags:', tagsError);
        }

        const transformedTags: Tag[] = bouquetTags
          ? bouquetTags.map((bt: any) => bt.tags).filter(Boolean)
          : [];
        
        // Transform the bouquet flowers data to the format expected by the component
        const transformedFlowers: FlowerWithQuantity[] = [];
        if (bouquetFlowers && bouquetFlowers.length > 0) {
          for (const bf of bouquetFlowers) {
            const flower = bf.flowers as any; // Use type assertion to avoid TypeScript errors
            transformedFlowers.push({
              id: bf.id,
              flower_id: bf.flower_id,
              name: flower?.name || '',
              price: flower?.price || 0,
              quantity: bf.quantity
            });
          }
        }
        
        // Set the state with fetched data
        setBouquet({
          ...bouquetData,
          price: bouquetData.price.toString(),
          discount_price: bouquetData.discount_price ? bouquetData.discount_price.toString() : '',
          flowers: transformedFlowers,
          media: bouquetMedia || [],
          tags: transformedTags || []
        });
        
        // Process and format media items with proper URLs
        if (bouquetMedia && bouquetMedia.length > 0) {
          const updatedMedia = bouquetMedia.map(media => {
            // Ensure we have a valid URL (either from file_url field or construct from file_path)
            let url = media.file_url || '';

            // If there's no file_url but there is a file_path, construct the URL using worker
            if (!url && media.file_path) {
              url = getFileUrl(media.file_path);
            }

            return { ...media, url };
          });
          
          setBouquet(prev => ({
            ...prev,
            media: updatedMedia
          }));
        }
        
        setCategories(categoriesData || []);
        setAvailableFlowers(allFlowers || []);
        logger.response('GET', `bouquet/${bouquetId}`, 200, startTime);
      } catch (err) {
        logger.error('GET', `bouquet/${bouquetId}`, err);
        console.error('Error fetching data:', err);
        setError('Error fetching bouquet data. Please try again.');
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, [bouquetId]);

  return {
    bouquet,
    setBouquet,
    categories,
    availableFlowers,
    loading,
    error,
    setError
  };
} 