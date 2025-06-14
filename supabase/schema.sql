-- Generated SQL Schema based on TypeScript types
-- Generated on: 2025-06-14T17:22:38.525Z

-- Table: bouquets
CREATE TABLE IF NOT EXISTS public.bouquets (
  id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL,
  discount_price NUMERIC,
  category_id TEXT,
  featured BOOLEAN NOT NULL,
  in_stock BOOLEAN NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  tags TEXT NOT NULL,
  PRIMARY KEY (id)
);

COMMENT ON TABLE public.bouquets IS 'Table for bouquets';

-- Table: bouquet_media
CREATE TABLE IF NOT EXISTS public.bouquet_media (
  id TEXT NOT NULL,
  bouquet_id TEXT NOT NULL,
  media_type TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_url TEXT,
  file_name TEXT NOT NULL,
  file_size NUMERIC NOT NULL,
  content_type TEXT NOT NULL,
  display_order NUMERIC NOT NULL,
  is_thumbnail BOOLEAN NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  PRIMARY KEY (id)
);

COMMENT ON TABLE public.bouquet_media IS 'Table for bouquet_media';

-- Table: flowers
CREATE TABLE IF NOT EXISTS public.flowers (
  id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL,
  in_stock NUMERIC NOT NULL,
  low_stock_threshold NUMERIC NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  PRIMARY KEY (id)
);

COMMENT ON TABLE public.flowers IS 'Table for flowers';

-- Table: categories
CREATE TABLE IF NOT EXISTS public.categories (
  id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  PRIMARY KEY (id)
);

COMMENT ON TABLE public.categories IS 'Table for categories';

-- Table: tags
CREATE TABLE IF NOT EXISTS public.tags (
  id TEXT NOT NULL,
  name TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  PRIMARY KEY (id)
);

COMMENT ON TABLE public.tags IS 'Table for tags';

-- Table: bouquet_flowers
CREATE TABLE IF NOT EXISTS public.bouquet_flowers (
  id TEXT NOT NULL,
  bouquet_id TEXT NOT NULL,
  flower_id TEXT NOT NULL,
  quantity NUMERIC NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  PRIMARY KEY (id)
);

COMMENT ON TABLE public.bouquet_flowers IS 'Table for bouquet_flowers';

