-- Migration to ensure proper bouquet_media table structure
-- This is complementary to the previous remove-redundant-image-columns.sql migration

-- Make sure bouquet_media table has the right structure
CREATE TABLE IF NOT EXISTS bouquet_media (
  id UUID NOT NULL DEFAULT extensions.uuid_generate_v4(),
  bouquet_id UUID NOT NULL,
  media_type VARCHAR(10) NOT NULL CHECK (media_type IN ('image', 'video')),
  file_path VARCHAR(255) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_size INTEGER NOT NULL,
  content_type VARCHAR(100) NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_thumbnail BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NULL DEFAULT now(),
  file_url TEXT NULL,
  CONSTRAINT bouquet_media_pkey PRIMARY KEY (id),
  CONSTRAINT bouquet_media_bouquet_id_fkey FOREIGN KEY (bouquet_id) REFERENCES bouquets (id) ON DELETE CASCADE
);

-- Create index for faster lookups by bouquet_id if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_bouquet_media_bouquet_id ON bouquet_media(bouquet_id);

-- Ensure only one thumbnail per bouquet 
-- (we can have this as a business logic rule rather than a DB constraint to be more flexible)

-- Make sure update_modified_column function exists
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to update updated_at timestamp if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_bouquet_media_timestamp'
  ) THEN
    CREATE TRIGGER update_bouquet_media_timestamp
    BEFORE UPDATE ON bouquet_media
    FOR EACH ROW
    EXECUTE PROCEDURE update_modified_column();
  END IF;
END
$$; 