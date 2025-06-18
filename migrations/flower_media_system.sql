-- Create flower_media table similar to bouquet_media
CREATE TABLE IF NOT EXISTS flower_media (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  flower_id UUID NOT NULL REFERENCES flowers(id) ON DELETE CASCADE,
  media_type VARCHAR(50) NOT NULL DEFAULT 'image', -- 'image' or 'video'
  file_path TEXT,
  file_name VARCHAR(255) NOT NULL,
  file_size INTEGER NOT NULL DEFAULT 0,
  content_type VARCHAR(100),
  display_order INTEGER NOT NULL DEFAULT 0,
  is_thumbnail BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_flower_media_flower_id ON flower_media(flower_id);
CREATE INDEX IF NOT EXISTS idx_flower_media_is_thumbnail ON flower_media(is_thumbnail);

-- Create function to update updated_at timestamp if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_flower_media_updated_at ON flower_media;
CREATE TRIGGER update_flower_media_updated_at
BEFORE UPDATE ON flower_media
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Create storage policy for flower media
INSERT INTO storage.buckets (id, name, public)
VALUES ('flower-media', 'flower-media', true)
ON CONFLICT (id) DO NOTHING;

-- Set up RLS policies for flower_media
ALTER TABLE flower_media ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users to manage flower media (for admin UI)
CREATE POLICY flower_media_auth_all_policy ON flower_media
FOR ALL USING (auth.role() = 'authenticated');

-- Create policy for public to read flower media
CREATE POLICY flower_media_public_read_policy ON flower_media
FOR SELECT USING (true);

-- Add flower_media to the list of public tables if the table exists
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'public_tables') THEN
    INSERT INTO public.public_tables (table_name, is_public)
    VALUES ('flower_media', true)
    ON CONFLICT (table_name) DO UPDATE
    SET is_public = true;
  END IF;
END
$$; 