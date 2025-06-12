-- Validate that our database structure is as expected after all migrations

-- Check if bouquets columns were properly removed
DO $$
BEGIN
  IF EXISTS (SELECT 1 
             FROM information_schema.columns 
             WHERE table_name = 'bouquets' 
               AND column_name IN ('image', 'image_path', 'image_url')) THEN
    RAISE NOTICE 'WARNING: Some image columns still exist in the bouquets table!';
  ELSE 
    RAISE NOTICE 'SUCCESS: All redundant image columns have been removed from the bouquets table.';
  END IF;

  -- Check if bouquet_media table exists and has necessary columns
  IF EXISTS (SELECT 1 
             FROM information_schema.tables 
             WHERE table_name = 'bouquet_media') THEN
    
    -- Check for required columns
    IF EXISTS (SELECT 1 
               FROM information_schema.columns 
               WHERE table_name = 'bouquet_media' 
                 AND column_name = 'file_url') THEN
      RAISE NOTICE 'SUCCESS: The bouquet_media table has the file_url column.';
    ELSE
      RAISE NOTICE 'WARNING: The bouquet_media table is missing the file_url column!';
    END IF;
    
    IF EXISTS (SELECT 1 
               FROM information_schema.columns 
               WHERE table_name = 'bouquet_media' 
                 AND column_name = 'is_thumbnail') THEN
      RAISE NOTICE 'SUCCESS: The bouquet_media table has the is_thumbnail column.';
    ELSE
      RAISE NOTICE 'WARNING: The bouquet_media table is missing the is_thumbnail column!';
    END IF;
    
    -- Check for index
    IF EXISTS (SELECT 1 
               FROM pg_indexes 
               WHERE tablename = 'bouquet_media'
                 AND indexname = 'idx_bouquet_media_bouquet_id') THEN
      RAISE NOTICE 'SUCCESS: The bouquet_media table has the proper index on bouquet_id.';
    ELSE
      RAISE NOTICE 'WARNING: The bouquet_media table is missing the index on bouquet_id!';
    END IF;
    
    -- Check for trigger
    IF EXISTS (SELECT 1 
               FROM pg_trigger 
               WHERE tgname = 'update_bouquet_media_timestamp') THEN
      RAISE NOTICE 'SUCCESS: The bouquet_media update timestamp trigger is in place.';
    ELSE
      RAISE NOTICE 'WARNING: The bouquet_media update timestamp trigger is missing!';
    END IF;
  ELSE
    RAISE NOTICE 'ERROR: The bouquet_media table does not exist!';
  END IF;
END
$$; 