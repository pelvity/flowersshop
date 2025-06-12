-- Create a new storage bucket for bouquet media files
INSERT INTO storage.buckets (id, name, public)
VALUES ('bouquet-media', 'bouquet-media', true)
ON CONFLICT (id) DO NOTHING;

-- Set up simple storage policies for portfolio website (admin only)

-- Allow public read access (portfolio visitors can view images)
CREATE POLICY "Allow public to view media files"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'bouquet-media');

-- Only allow admin role to insert/upload files
CREATE POLICY "Allow admins to upload files"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'bouquet-media' AND
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Only allow admin role to update files
CREATE POLICY "Allow admins to update files"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'bouquet-media' AND
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Only allow admin role to delete files
CREATE POLICY "Allow admins to delete files"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'bouquet-media' AND
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
); 