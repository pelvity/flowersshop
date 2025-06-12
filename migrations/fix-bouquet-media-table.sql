-- Make sure bouquet_media table exists
CREATE TABLE IF NOT EXISTS bouquet_media (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bouquet_id UUID NOT NULL REFERENCES bouquets(id) ON DELETE CASCADE,
  media_type VARCHAR(10) NOT NULL CHECK (media_type IN ('image', 'video')),
  file_path VARCHAR(255) NOT NULL,
  file_url TEXT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_size INTEGER NOT NULL,
  content_type VARCHAR(100) NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_thumbnail BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups by bouquet_id if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_bouquet_media_bouquet_id ON bouquet_media(bouquet_id);

-- Make sure RLS policies exist
ALTER TABLE bouquet_media ENABLE ROW LEVEL SECURITY;

-- Allow anyone to view bouquet media
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'bouquet_media' AND policyname = 'Anyone can view bouquet_media'
  ) THEN
    CREATE POLICY "Anyone can view bouquet_media"
    ON bouquet_media FOR SELECT
    USING (true);
  END IF;
END
$$;

-- Only admins can create/update/delete bouquet media
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'bouquet_media' AND policyname = 'Only admins can create bouquet_media'
  ) THEN
    CREATE POLICY "Only admins can create bouquet_media"
    ON bouquet_media FOR INSERT
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid() AND role = 'admin'
      )
    );
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'bouquet_media' AND policyname = 'Only admins can update bouquet_media'
  ) THEN
    CREATE POLICY "Only admins can update bouquet_media"
    ON bouquet_media FOR UPDATE
    USING (
      EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid() AND role = 'admin'
      )
    );
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'bouquet_media' AND policyname = 'Only admins can delete bouquet_media'
  ) THEN
    CREATE POLICY "Only admins can delete bouquet_media"
    ON bouquet_media FOR DELETE
    USING (
      EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid() AND role = 'admin'
      )
    );
  END IF;
END
$$;
