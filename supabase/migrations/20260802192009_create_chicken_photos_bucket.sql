/*
# Create chicken_photos storage bucket

1. Storage
- Create a public bucket named `chicken_photos` for chicken profile photos.
- Public bucket so photos can be displayed via public URLs in the app.

2. Security
- Storage policies on the `objects` table for the `chicken_photos` bucket:
  - SELECT (read): public — anyone can view photos (public bucket).
  - INSERT: authenticated users can upload to their own folder path.
  - UPDATE: owners can update their own objects.
  - DELETE: owners can delete their own objects.
- Folder paths are scoped per user: `chicken_photos/<user_id>/<filename>`.
*/

INSERT INTO storage.buckets (id, name, public)
VALUES ('chicken_photos', 'chicken_photos', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public read access for chicken_photos" ON storage.objects;
CREATE POLICY "Public read access for chicken_photos"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'chicken_photos');

DROP POLICY IF EXISTS "Authenticated upload to chicken_photos" ON storage.objects;
CREATE POLICY "Authenticated upload to chicken_photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'chicken_photos');

DROP POLICY IF EXISTS "Owner update chicken_photos" ON storage.objects;
CREATE POLICY "Owner update chicken_photos"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'chicken_photos' AND owner = auth.uid())
WITH CHECK (bucket_id = 'chicken_photos' AND owner = auth.uid());

DROP POLICY IF EXISTS "Owner delete chicken_photos" ON storage.objects;
CREATE POLICY "Owner delete chicken_photos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'chicken_photos' AND owner = auth.uid());
