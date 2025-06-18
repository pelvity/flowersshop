// Repository Types for FlowersShop
// These types match the updated database schema

export interface BaseEntity {
  id: string;
  created_at: string;
  updated_at: string;
}

export interface Category extends BaseEntity {
  name: string;
  description?: string;
}

export interface Tag extends BaseEntity {
  name: string;
}

export interface Color extends BaseEntity {
  name: string;
  hex_code: string;
  translations?: ColorTranslation[];
}

export interface ColorWithTranslation extends Color {
  translated_name: string;
}

export interface Flower extends BaseEntity {
  name: string;
  description?: string;
  price: number;
  discount_price?: number;
  latin_name?: string;
  care_instructions?: string;
  in_stock: boolean;
  
  // Relations (populated by repositories)
  tags?: Tag[];
  colors?: FlowerColor[];
  media?: FlowerMedia[];
}

export interface Bouquet extends BaseEntity {
  name: string;
  description?: string;
  price: number;
  discount_price?: number;
  category_id?: string;
  featured: boolean;
  in_stock: boolean;
  
  // Relations (populated by repositories)
  category?: Category;
  tags?: Tag[];
  flowers?: BouquetFlower[];
  media?: BouquetMedia[];
}

export interface BouquetMedia extends BaseEntity {
  bouquet_id: string;
  media_type: string;
  file_path: string;
  file_url?: string;
  file_name: string;
  file_size: number;
  content_type: string;
  display_order: number;
  is_thumbnail: boolean;
}

export interface FlowerMedia extends BaseEntity {
  flower_id: string;
  media_type: string;
  file_path: string;
  file_url?: string;
  file_name: string;
  file_size: number;
  content_type: string;
  display_order: number;
  is_thumbnail: boolean;
}

export interface BouquetFlower {
  flower: Flower;
  quantity: number;
}

export interface BouquetTag {
  bouquet_id: string;
  tag_id: string;
}

// Filter types for querying
export interface BouquetFilter {
  categoryId?: string;
  tagIds?: string[];
  featured?: boolean;
  inStock?: boolean;
  searchQuery?: string;
  minPrice?: number;
  maxPrice?: number;
}

// Pagination
export interface PaginationOptions {
  page: number;
  pageSize: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface FlowerColor {
  color: Color;
  flower_id: string;
  color_id: string;
}

export interface ColorTranslation {
  color_id: string;
  locale: string;
  name: string;
} 