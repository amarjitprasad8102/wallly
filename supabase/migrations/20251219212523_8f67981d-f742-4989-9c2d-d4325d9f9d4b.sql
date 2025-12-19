-- Create storage bucket for temporary chat images
INSERT INTO storage.buckets (id, name, public)
VALUES ('chat-images', 'chat-images', false)
ON CONFLICT (id) DO NOTHING;

-- Policy: Users can upload their own images
CREATE POLICY "Users can upload chat images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'chat-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Users can read their own images
CREATE POLICY "Users can read own chat images"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'chat-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Users can delete their own images
CREATE POLICY "Users can delete own chat images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'chat-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Allow reading with signed URLs (for receiving images)
CREATE POLICY "Anyone can read chat images with signed URL"
ON storage.objects FOR SELECT
USING (bucket_id = 'chat-images');