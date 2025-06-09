-- Create bouquet_media table for storing images and videos
CREATE TABLE IF NOT EXISTS bouquet_media (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bouquet_id UUID NOT NULL REFERENCES bouquets(id) ON DELETE CASCADE,
  media_type VARCHAR(10) NOT NULL CHECK (media_type IN ('image', 'video')),
  file_path VARCHAR(255) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_size INTEGER NOT NULL,
  content_type VARCHAR(100) NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_thumbnail BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups by bouquet_id
CREATE INDEX IF NOT EXISTS idx_bouquet_media_bouquet_id ON bouquet_media(bouquet_id);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_bouquet_media_timestamp
BEFORE UPDATE ON bouquet_media
FOR EACH ROW
EXECUTE PROCEDURE update_modified_column(); 