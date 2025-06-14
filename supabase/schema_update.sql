-- Schema Update for FlowersShop Database
-- This script updates the database schema to follow best practices
-- Note: This will reset data in the affected tables

-- Drop existing tables to rebuild them with proper relationships
-- Using CASCADE to automatically drop dependent objects
DROP TABLE IF EXISTS public.bouquet_flowers CASCADE;
DROP TABLE IF EXISTS public.bouquet_media CASCADE;
DROP TABLE IF EXISTS public.bouquets CASCADE;
DROP TABLE IF EXISTS public.flowers CASCADE;
DROP TABLE IF EXISTS public.categories CASCADE;
DROP TABLE IF EXISTS public.tags CASCADE;

-- Create extension for UUID generation if not exists
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Table: categories
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

COMMENT ON TABLE public.categories IS 'Table for bouquet categories';

-- Table: tags
CREATE TABLE public.tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

COMMENT ON TABLE public.tags IS 'Table for filtering tags';

-- Table: flowers
CREATE TABLE public.flowers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  in_stock INTEGER NOT NULL DEFAULT 0,
  low_stock_threshold INTEGER NOT NULL DEFAULT 5,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

COMMENT ON TABLE public.flowers IS 'Table for individual flowers';

-- Table: bouquets
CREATE TABLE public.bouquets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  discount_price DECIMAL(10,2),
  category_id UUID REFERENCES public.categories(id),
  featured BOOLEAN NOT NULL DEFAULT false,
  in_stock BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

COMMENT ON TABLE public.bouquets IS 'Table for bouquet products';

-- Create indexes for bouquets table
CREATE INDEX idx_bouquets_category ON public.bouquets(category_id);
CREATE INDEX idx_bouquets_featured ON public.bouquets(featured) WHERE featured = true;

-- Table: bouquet_media
CREATE TABLE public.bouquet_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bouquet_id UUID NOT NULL REFERENCES public.bouquets(id) ON DELETE CASCADE,
  media_type TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_url TEXT,
  file_name TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  content_type TEXT NOT NULL,
  display_order INTEGER NOT NULL,
  is_thumbnail BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

COMMENT ON TABLE public.bouquet_media IS 'Table for bouquet images and media';
CREATE INDEX idx_bouquet_media_bouquet ON public.bouquet_media(bouquet_id);

-- Junction table for bouquets and tags (many-to-many)
CREATE TABLE public.bouquet_tags (
  bouquet_id UUID NOT NULL REFERENCES public.bouquets(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  PRIMARY KEY (bouquet_id, tag_id)
);

COMMENT ON TABLE public.bouquet_tags IS 'Junction table for bouquet-tag relationships';
CREATE INDEX idx_bouquet_tags_tag ON public.bouquet_tags(tag_id);

-- Table: bouquet_flowers (composition)
CREATE TABLE public.bouquet_flowers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bouquet_id UUID NOT NULL REFERENCES public.bouquets(id) ON DELETE CASCADE,
  flower_id UUID NOT NULL REFERENCES public.flowers(id),
  quantity INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

COMMENT ON TABLE public.bouquet_flowers IS 'Junction table for bouquet composition';
CREATE INDEX idx_bouquet_flowers_bouquet ON public.bouquet_flowers(bouquet_id);
CREATE INDEX idx_bouquet_flowers_flower ON public.bouquet_flowers(flower_id);

-- Recreate order_items table with reference to new bouquets table
-- This assumes order_items was depending on bouquets
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL,
  bouquet_id UUID REFERENCES public.bouquets(id),
  quantity INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

COMMENT ON TABLE public.order_items IS 'Table for order line items';
CREATE INDEX idx_order_items_order ON public.order_items(order_id);
CREATE INDEX idx_order_items_bouquet ON public.order_items(bouquet_id);

-- Create a function to update timestamps automatically
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for all tables to update timestamps
CREATE TRIGGER update_bouquets_timestamp
BEFORE UPDATE ON public.bouquets
FOR EACH ROW EXECUTE PROCEDURE update_timestamp();

CREATE TRIGGER update_bouquet_media_timestamp
BEFORE UPDATE ON public.bouquet_media
FOR EACH ROW EXECUTE PROCEDURE update_timestamp();

CREATE TRIGGER update_flowers_timestamp
BEFORE UPDATE ON public.flowers
FOR EACH ROW EXECUTE PROCEDURE update_timestamp();

CREATE TRIGGER update_categories_timestamp
BEFORE UPDATE ON public.categories
FOR EACH ROW EXECUTE PROCEDURE update_timestamp();

CREATE TRIGGER update_tags_timestamp
BEFORE UPDATE ON public.tags
FOR EACH ROW EXECUTE PROCEDURE update_timestamp();

CREATE TRIGGER update_bouquet_flowers_timestamp
BEFORE UPDATE ON public.bouquet_flowers
FOR EACH ROW EXECUTE PROCEDURE update_timestamp();

CREATE TRIGGER update_order_items_timestamp
BEFORE UPDATE ON public.order_items
FOR EACH ROW EXECUTE PROCEDURE update_timestamp();

-- Create a stored procedure for updating bouquet composition
CREATE OR REPLACE FUNCTION update_bouquet_composition(
  p_bouquet_id UUID,
  p_flower_quantities JSONB
) RETURNS void AS $$
BEGIN
  -- Delete existing composition
  DELETE FROM public.bouquet_flowers
  WHERE bouquet_id = p_bouquet_id;
  
  -- Insert new composition
  INSERT INTO public.bouquet_flowers (bouquet_id, flower_id, quantity)
  SELECT 
    p_bouquet_id,
    (jsonb_array_elements(p_flower_quantities)->>'flower_id')::UUID,
    (jsonb_array_elements(p_flower_quantities)->>'quantity')::INTEGER;
END;
$$ LANGUAGE plpgsql;

-- Create RLS policies for security (assuming you're using Supabase)
-- Example: Only allow authenticated users to insert/update bouquets
ALTER TABLE public.bouquets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access" ON public.bouquets FOR SELECT USING (true);
CREATE POLICY "Allow authenticated insert" ON public.bouquets FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated update" ON public.bouquets FOR UPDATE USING (auth.role() = 'authenticated');

-- Enable similar policies for other tables as needed 