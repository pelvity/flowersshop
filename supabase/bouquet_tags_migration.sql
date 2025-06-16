-- Create the bouquet_tags join table
CREATE TABLE IF NOT EXISTS public.bouquet_tags (
  id TEXT PRIMARY KEY,
  bouquet_id TEXT NOT NULL REFERENCES public.bouquets(id) ON DELETE CASCADE,
  tag_id TEXT NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(bouquet_id, tag_id)
);

COMMENT ON TABLE public.bouquet_tags IS 'Join table for bouquets and tags';

-- Add RLS policies for bouquet_tags
ALTER TABLE public.bouquet_tags ENABLE ROW LEVEL SECURITY;

-- Create policy to allow read access to everyone
CREATE POLICY "Allow read access for all users" 
  ON public.bouquet_tags 
  FOR SELECT 
  TO public 
  USING (true);

-- Create policy to allow insert/update/delete for authenticated users
CREATE POLICY "Allow write access for authenticated users" 
  ON public.bouquet_tags 
  FOR ALL 
  TO authenticated 
  USING (true); 