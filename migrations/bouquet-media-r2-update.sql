-- Add file_url column to bouquet_media table
ALTER TABLE bouquet_media ADD COLUMN IF NOT EXISTS file_url text;

-- Update existing records to set file_url based on file_path
UPDATE bouquet_media
SET file_url = CONCAT((SELECT value FROM secrets WHERE key = 'NEXT_PUBLIC_R2_ENDPOINT'), '/', 
                      (SELECT value FROM secrets WHERE key = 'NEXT_PUBLIC_R2_BUCKET_NAME'), '/', 
                      file_path)
WHERE file_url IS NULL AND file_path IS NOT NULL;

-- Comment: This migration adds the file_url column to the bouquet_media table to support 
-- direct URLs for media files stored in Cloudflare R2, eliminating the need to generate 
-- signed URLs for each request. 