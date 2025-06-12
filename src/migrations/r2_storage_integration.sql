-- Add R2 storage related fields to the flowers table
ALTER TABLE IF EXISTS public.flowers 
ADD COLUMN IF NOT EXISTS image_path TEXT,
ADD COLUMN IF NOT EXISTS image_url TEXT;

COMMENT ON COLUMN public.flowers.image_path IS 'Path to the image in R2 storage';
COMMENT ON COLUMN public.flowers.image_url IS 'Public URL to the image';

-- Add R2 storage related fields to the bouquets table
ALTER TABLE IF EXISTS public.bouquets 
ADD COLUMN IF NOT EXISTS image_path TEXT,
ADD COLUMN IF NOT EXISTS image_url TEXT;

COMMENT ON COLUMN public.bouquets.image_path IS 'Path to the image in R2 storage';
COMMENT ON COLUMN public.bouquets.image_url IS 'Public URL to the image';

-- Create media table for multiple images per bouquet
CREATE TABLE IF NOT EXISTS public.bouquet_media (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bouquet_id UUID NOT NULL REFERENCES public.bouquets(id) ON DELETE CASCADE,
    media_type TEXT NOT NULL DEFAULT 'image', -- 'image', 'video'
    file_path TEXT NOT NULL,
    file_url TEXT,
    file_name TEXT NOT NULL,
    file_size INT NOT NULL,
    content_type TEXT NOT NULL,
    is_thumbnail BOOLEAN NOT NULL DEFAULT false,
    display_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_bouquet_media_bouquet_id ON public.bouquet_media(bouquet_id);

-- Create media table for multiple images per flower
CREATE TABLE IF NOT EXISTS public.flower_media (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    flower_id UUID NOT NULL REFERENCES public.flowers(id) ON DELETE CASCADE,
    media_type TEXT NOT NULL DEFAULT 'image', -- 'image', 'video'
    file_path TEXT NOT NULL,
    file_url TEXT,
    file_name TEXT NOT NULL,
    file_size INT NOT NULL,
    content_type TEXT NOT NULL,
    is_thumbnail BOOLEAN NOT NULL DEFAULT false,
    display_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_flower_media_flower_id ON public.flower_media(flower_id);

-- Create RLS policies
ALTER TABLE public.bouquet_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flower_media ENABLE ROW LEVEL SECURITY;

-- Create policies for bouquet_media
CREATE POLICY "Allow select for anonymous users" 
    ON public.bouquet_media FOR SELECT 
    USING (true);

CREATE POLICY "Allow all for authenticated users" 
    ON public.bouquet_media FOR ALL 
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- Create policies for flower_media
CREATE POLICY "Allow select for anonymous users" 
    ON public.flower_media FOR SELECT 
    USING (true);

CREATE POLICY "Allow all for authenticated users" 
    ON public.flower_media FOR ALL 
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated'); 