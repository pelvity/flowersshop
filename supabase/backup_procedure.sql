-- Backup procedure for FlowersShop database
-- This creates a stored procedure that backs up the old tables before migration

CREATE OR REPLACE FUNCTION public.create_backup_tables()
RETURNS void AS $$
BEGIN
  -- Backup bouquets table
  DROP TABLE IF EXISTS public.bouquets_backup;
  EXECUTE 'CREATE TABLE public.bouquets_backup AS SELECT * FROM public.bouquets';
  
  -- Backup bouquet_media table
  DROP TABLE IF EXISTS public.bouquet_media_backup;
  EXECUTE 'CREATE TABLE public.bouquet_media_backup AS SELECT * FROM public.bouquet_media';
  
  -- Backup flowers table
  DROP TABLE IF EXISTS public.flowers_backup;
  EXECUTE 'CREATE TABLE public.flowers_backup AS SELECT * FROM public.flowers';
  
  -- Backup categories table
  DROP TABLE IF EXISTS public.categories_backup;
  EXECUTE 'CREATE TABLE public.categories_backup AS SELECT * FROM public.categories';
  
  -- Backup tags table
  DROP TABLE IF EXISTS public.tags_backup;
  EXECUTE 'CREATE TABLE public.tags_backup AS SELECT * FROM public.tags';
  
  -- Backup bouquet_flowers table
  DROP TABLE IF EXISTS public.bouquet_flowers_backup;
  EXECUTE 'CREATE TABLE public.bouquet_flowers_backup AS SELECT * FROM public.bouquet_flowers';
  
  -- Backup order_items table
  DROP TABLE IF EXISTS public.order_items_backup;
  EXECUTE 'CREATE TABLE public.order_items_backup AS SELECT * FROM public.order_items';
END;
$$ LANGUAGE plpgsql; 