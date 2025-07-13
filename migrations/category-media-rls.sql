-- Enable RLS on category_media table
ALTER TABLE category_media ENABLE ROW LEVEL SECURITY;

-- Create policy for admin users to select category media
CREATE POLICY "Admin users can select category media" ON category_media
  FOR SELECT USING (
    auth.role() = 'authenticated' AND (
      auth.uid() IN (SELECT user_id FROM profiles WHERE is_admin = true)
    )
  );

-- Create policy for admin users to insert category media
CREATE POLICY "Admin users can insert category media" ON category_media
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated' AND (
      auth.uid() IN (SELECT user_id FROM profiles WHERE is_admin = true)
    )
  );

-- Create policy for admin users to update category media
CREATE POLICY "Admin users can update category media" ON category_media
  FOR UPDATE USING (
    auth.role() = 'authenticated' AND (
      auth.uid() IN (SELECT user_id FROM profiles WHERE is_admin = true)
    )
  ) WITH CHECK (
    auth.role() = 'authenticated' AND (
      auth.uid() IN (SELECT user_id FROM profiles WHERE is_admin = true)
    )
  );

-- Create policy for admin users to delete category media
CREATE POLICY "Admin users can delete category media" ON category_media
  FOR DELETE USING (
    auth.role() = 'authenticated' AND (
      auth.uid() IN (SELECT user_id FROM profiles WHERE is_admin = true)
    )
  );

-- Create policy for public users to view category media
CREATE POLICY "Public users can view category media" ON category_media
  FOR SELECT USING (true); 