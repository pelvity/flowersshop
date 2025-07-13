// Basic Database types for Supabase
export interface Database {
  public: {
    Tables: {
      bouquets: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          price: number;
          discount_price: number | null;
          category_id: string | null;
          featured: boolean;
          in_stock: boolean;
          created_at: string;
          updated_at: string;
          tags: string[];
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          price: number;
          discount_price?: number | null;
          category_id?: string | null;
          featured?: boolean;
          in_stock?: boolean;
          created_at?: string;
          updated_at?: string;
          tags?: string[];
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          price?: number;
          discount_price?: number | null;
          category_id?: string | null;
          featured?: boolean;
          in_stock?: boolean;
          created_at?: string;
          updated_at?: string;
          tags?: string[];
        };
      };
      bouquet_media: {
        Row: {
          id: string;
          bouquet_id: string;
          media_type: string;
          file_path: string;
          file_url: string | null;
          file_name: string;
          file_size: number;
          content_type: string;
          display_order: number;
          is_thumbnail: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          bouquet_id: string;
          media_type: string;
          file_path: string;
          file_url?: string | null;
          file_name: string;
          file_size: number;
          content_type: string;
          display_order?: number;
          is_thumbnail?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          bouquet_id?: string;
          media_type?: string;
          file_path?: string;
          file_url?: string | null;
          file_name?: string;
          file_size?: number;
          content_type?: string;
          display_order?: number;
          is_thumbnail?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      category_media: {
        Row: {
          id: string;
          category_id: string;
          media_type: string;
          file_path: string;
          file_url: string | null;
          file_name: string;
          file_size: number;
          content_type: string;
          display_order: number;
          is_thumbnail: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          category_id: string;
          media_type: string;
          file_path: string;
          file_url?: string | null;
          file_name: string;
          file_size: number;
          content_type: string;
          display_order?: number;
          is_thumbnail?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          category_id?: string;
          media_type?: string;
          file_path?: string;
          file_url?: string | null;
          file_name?: string;
          file_size?: number;
          content_type?: string;
          display_order?: number;
          is_thumbnail?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      flowers: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          price: number;
          in_stock: number;
          low_stock_threshold: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          price: number;
          in_stock?: number;
          low_stock_threshold?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          price?: number;
          in_stock?: number;
          low_stock_threshold?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      categories: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      tags: {
        Row: {
          id: string;
          name: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      bouquet_flowers: {
        Row: {
          id: string;
          bouquet_id: string;
          flower_id: string;
          quantity: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          bouquet_id: string;
          flower_id: string;
          quantity: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          bouquet_id?: string;
          flower_id?: string;
          quantity?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
} 