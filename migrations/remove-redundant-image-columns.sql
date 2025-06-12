-- Remove redundant image columns from bouquets table
-- Since all media is now managed through the bouquet_media table

-- Description: This migration removes the redundant image columns from the bouquets table
-- as all media information should be stored in the bouquet_media table with the is_thumbnail flag
-- to indicate which image is the main/featured one.

-- Remove the redundant columns
ALTER TABLE public.bouquets
DROP COLUMN IF EXISTS image,
DROP COLUMN IF EXISTS image_path,
DROP COLUMN IF EXISTS image_url;

-- Log the change
DO $$
BEGIN
  RAISE NOTICE 'Removed redundant image columns from bouquets table';
  RAISE NOTICE 'Media is now exclusively managed through the bouquet_media table';
  RAISE NOTICE 'Use the is_thumbnail flag in bouquet_media to identify the main/featured image';
END $$; 