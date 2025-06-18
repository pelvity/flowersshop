-- Fix Row Level Security (RLS) policies for flower_colors table
-- This migration adds proper RLS policies to allow authenticated users to modify flower_colors

-- Enable RLS on the flower_colors table
ALTER TABLE IF EXISTS public.flower_colors ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS flower_colors_select_policy ON public.flower_colors;
DROP POLICY IF EXISTS flower_colors_insert_policy ON public.flower_colors;
DROP POLICY IF EXISTS flower_colors_update_policy ON public.flower_colors;
DROP POLICY IF EXISTS flower_colors_delete_policy ON public.flower_colors;

-- Create policies for flower_colors
-- Allow anyone to select
CREATE POLICY flower_colors_select_policy ON public.flower_colors
  FOR SELECT USING (true);

-- Allow authenticated users to insert
CREATE POLICY flower_colors_insert_policy ON public.flower_colors
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to update
CREATE POLICY flower_colors_update_policy ON public.flower_colors
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Allow authenticated users to delete
CREATE POLICY flower_colors_delete_policy ON public.flower_colors
  FOR DELETE USING (auth.role() = 'authenticated'); 