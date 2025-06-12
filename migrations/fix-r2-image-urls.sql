-- Fix Cloudflare R2 URL structure for bouquet_media table

-- Update the file_url in bouquet_media to ensure correct format
-- This fixes potential issues with missing or incorrect URLs
UPDATE bouquet_media
SET file_url = CONCAT('https://942bcfdd09a12d8ce5ad15cc5b8b1c10.r2.cloudflarestorage.com/', 
                      'flowershop-r2/', 
                      file_path)
WHERE file_path IS NOT NULL;

-- Also update main bouquet table to ensure thumbnail URLs are correct
UPDATE bouquets
SET image_url = CONCAT('https://942bcfdd09a12d8ce5ad15cc5b8b1c10.r2.cloudflarestorage.com/', 
                       'flowershop-r2/', 
                       image_path)
WHERE image_path IS NOT NULL AND (image_url IS NULL OR image_url NOT LIKE 'https://942bcfdd09a12d8ce5ad15cc5b8b1c10.r2.cloudflarestorage.com/%');

-- Log the change
DO $$
BEGIN
  RAISE NOTICE 'Updated R2 image URLs to use consistent format';
END $$; 