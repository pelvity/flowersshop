-- Add image_path column to bouquets table if it doesn't exist
ALTER TABLE bouquets ADD COLUMN IF NOT EXISTS image_path text;

-- Fix existing bouquet data where image_url exists but image_path is null
UPDATE bouquets
SET image_path = SUBSTRING(image, POSITION('/' IN image) + 1)
WHERE image IS NOT NULL AND image_path IS NULL;
