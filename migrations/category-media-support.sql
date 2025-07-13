-- Create category_media table for storing images for categories
CREATE TABLE IF NOT EXISTS category_media (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  media_type VARCHAR(10) NOT NULL CHECK (media_type IN ('image', 'video')),
  file_path VARCHAR(255) NOT NULL,
  file_url VARCHAR(255),
  file_name VARCHAR(255) NOT NULL,
  file_size INTEGER NOT NULL,
  content_type VARCHAR(100) NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_thumbnail BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups by category_id
CREATE INDEX IF NOT EXISTS idx_category_media_category_id ON category_media(category_id);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_category_media_timestamp()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_category_media_timestamp
BEFORE UPDATE ON category_media
FOR EACH ROW
EXECUTE PROCEDURE update_category_media_timestamp();

-- Add RLS policies
ALTER TABLE category_media ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS admin_category_media ON category_media;
DROP POLICY IF EXISTS anon_category_media_select ON category_media;

-- Create policy for admin users to perform all operations
CREATE POLICY "Admin users can manage category media" ON category_media
  FOR ALL USING (
    auth.role() = 'authenticated' AND (
      auth.uid() IN (SELECT user_id FROM profiles WHERE is_admin = true)
    )
  ) WITH CHECK (
    auth.role() = 'authenticated' AND (
      auth.uid() IN (SELECT user_id FROM profiles WHERE is_admin = true)
    )
  );

-- Anonymous can only read
CREATE POLICY "Public users can view category media" ON category_media
  FOR SELECT
  USING (true);

-- Add appropriate comments
COMMENT ON TABLE category_media IS 'Stores media assets for categories (images)';
COMMENT ON COLUMN category_media.category_id IS 'Reference to the category this media belongs to';
COMMENT ON COLUMN category_media.media_type IS 'Type of media (image or video)';
COMMENT ON COLUMN category_media.file_path IS 'Path to the file in storage';
COMMENT ON COLUMN category_media.file_url IS 'Public URL to access the file';
COMMENT ON COLUMN category_media.is_thumbnail IS 'Whether this media is the thumbnail for the category'; 