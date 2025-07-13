-- Fix category_media RLS policies
-- First, drop all existing policies to start fresh
DROP POLICY IF EXISTS "Admin users can manage category media" ON category_media;
DROP POLICY IF EXISTS "Public users can view category media" ON category_media;
DROP POLICY IF EXISTS "Service role has full access to category_media" ON category_media;

-- Create policy for admin users to perform all operations
CREATE POLICY "admin_can_manage_category_media" ON category_media
  FOR ALL USING (
    auth.role() = 'authenticated' AND 
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() AND profiles.is_admin = true
    )
  ) WITH CHECK (
    auth.role() = 'authenticated' AND 
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() AND profiles.is_admin = true
    )
  );

-- Create policy for service role to have full access
CREATE POLICY "service_role_can_manage_category_media" ON category_media
  FOR ALL USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Create policy for public/anonymous users to view category media
CREATE POLICY "public_can_view_category_media" ON category_media
  FOR SELECT USING (true);

-- Add comment explaining the policies
COMMENT ON TABLE category_media IS 'Stores media assets for categories with RLS policies: admin users can manage, service role has full access, public can view'; 