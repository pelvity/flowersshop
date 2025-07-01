/**
 * Client-side API utility for fetching data from our API endpoints.
 * This should be used by client components instead of directly accessing Supabase.
 */

import { Bouquet, Category, Tag } from '@/lib/supabase';

/**
 * Helper function to get the base URL for API requests
 * In the browser, we use the current origin
 * In server components, we need the full URL including protocol and hostname
 */
function getApiUrl(path: string): string {
  // In the browser, we can use relative URLs
  if (typeof window !== 'undefined') {
    return path;
  }
  
  // In server components, we need absolute URLs
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 
                  process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000';
  return `${baseUrl}${path}`;
}

/**
 * Fetch all bouquets with optional filters
 */
export async function fetchBouquets(
  options?: {
    withFlowers?: boolean;
    featured?: boolean;
    categoryId?: string;
    limit?: number;
  },
  headers?: HeadersInit
): Promise<Bouquet[]> {
  const params = new URLSearchParams();
  
  if (options?.withFlowers) {
    params.append('withFlowers', 'true');
  }
  
  if (options?.featured) {
    params.append('featured', 'true');
  }
  
  if (options?.categoryId) {
    params.append('category', options.categoryId);
  }
  
  if (options?.limit) {
    params.append('limit', options.limit.toString());
  }
  
  const queryString = params.toString() ? `?${params.toString()}` : '';
  const url = getApiUrl(`/api/bouquets${queryString}`);
  
  try {
    const response = await fetch(url, {
      cache: 'no-store', // Don't cache in browser, rely on Redis cache
      headers: headers,
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch bouquets: ${response.status}`);
    }
    
    return response.json();
  } catch (error) {
    console.error('Error fetching bouquets:', error, 'URL:', url);
    return [];
  }
}

/**
 * Fetch a single bouquet by ID
 */
export async function fetchBouquet(id: string, headers?: HeadersInit): Promise<Bouquet> {
  const url = getApiUrl(`/api/bouquets/${id}`);
  
  try {
    const response = await fetch(url, {
      cache: 'no-store',
      headers: headers,
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch bouquet: ${response.status}`);
    }
    
    return response.json();
  } catch (error) {
    console.error(`Error fetching bouquet ${id}:`, error, 'URL:', url);
    throw error;
  }
}

/**
 * Fetch all categories
 */
export async function fetchCategories(headers?: HeadersInit): Promise<Category[]> {
  const url = getApiUrl('/api/categories');
  
  try {
    const response = await fetch(url, {
      cache: 'no-store',
      headers: headers,
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch categories: ${response.status}`);
    }
    
    return response.json();
  } catch (error) {
    console.error('Error fetching categories:', error, 'URL:', url);
    return [];
  }
}

/**
 * Fetch all tags
 */
export async function fetchTags(headers?: HeadersInit): Promise<Tag[]> {
  const url = getApiUrl('/api/tags');
  
  try {
    const response = await fetch(url, {
      cache: 'no-store',
      headers: headers,
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch tags: ${response.status}`);
    }
    
    return response.json();
  } catch (error) {
    console.error('Error fetching tags:', error, 'URL:', url);
    return [];
  }
}

/**
 * Fetch tags for a specific bouquet
 */
export async function fetchTagsForBouquet(
  bouquetId: string,
  headers?: HeadersInit
): Promise<Tag[]> {
  const url = getApiUrl(`/api/tags/bouquet/${bouquetId}`);
  
  try {
    const response = await fetch(url, {
      cache: 'no-store',
      headers: headers,
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch tags for bouquet: ${response.status}`);
    }
    
    return response.json();
  } catch (error) {
    console.error(`Error fetching tags for bouquet ${bouquetId}:`, error, 'URL:', url);
    return [];
  }
}

/**
 * Fetch all flowers
 */
export async function fetchFlowers(
  options?: {
    includeColors?: boolean;
  },
  headers?: HeadersInit
): Promise<any[]> {
  const params = new URLSearchParams();
  
  if (options?.includeColors) {
    params.append('includeColors', 'true');
  }
  
  const queryString = params.toString() ? `?${params.toString()}` : '';
  const url = getApiUrl(`/api/flowers${queryString}`);
  
  try {
    const response = await fetch(url, {
      cache: 'no-store',
      headers: headers,
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch flowers: ${response.status}`);
    }
    
    return response.json();
  } catch (error) {
    console.error('Error fetching flowers:', error, 'URL:', url);
    return [];
  }
} 