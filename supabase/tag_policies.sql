-- Drop existing policies for tags table
DROP POLICY IF EXISTS "Allow read access for all users" ON public.tags;
DROP POLICY IF EXISTS "Allow write access for authenticated users" ON public.tags;
DROP POLICY IF EXISTS "Allow all access for authenticated users" ON public.tags;

-- Enable row level security
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;

-- Create policies for tags table
-- Allow read access for all users
CREATE POLICY "Allow read access for all users" 
  ON public.tags 
  FOR SELECT 
  TO public 
  USING (true);

-- Allow insert, update, delete for authenticated users
CREATE POLICY "Allow write access for authenticated users" 
  ON public.tags 
  FOR ALL 
  TO authenticated 
  USING (true);

-- Grant privileges to the service_role
GRANT ALL ON public.tags TO service_role;

-- Create policies for bouquet_tags join table if it exists
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'bouquet_tags') THEN
    -- Drop existing policies
    DROP POLICY IF EXISTS "Allow read access for all users" ON public.bouquet_tags;
    DROP POLICY IF EXISTS "Allow write access for authenticated users" ON public.bouquet_tags;
    
    -- Enable row level security
    ALTER TABLE public.bouquet_tags ENABLE ROW LEVEL SECURITY;
    
    -- Create policies for bouquet_tags table
    -- Allow read access for all users
    CREATE POLICY "Allow read access for all users" 
      ON public.bouquet_tags 
      FOR SELECT 
      TO public 
      USING (true);
    
    -- Allow insert, update, delete for authenticated users
    CREATE POLICY "Allow write access for authenticated users" 
      ON public.bouquet_tags 
      FOR ALL 
      TO authenticated 
      USING (true);
    
    -- Grant privileges to the service_role
    GRANT ALL ON public.bouquet_tags TO service_role;
  END IF;
END
$$; 