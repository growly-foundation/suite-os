-- Create storage buckets if they don't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-images', 'Profile Images', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('organization-logos', 'Organization Logos', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public access to profile images
CREATE POLICY "Public Access to Profile Images"
ON storage.objects FOR SELECT
USING (bucket_id = 'profile-images');

-- Allow authenticated users to upload profile images
CREATE POLICY "Authenticated users can upload profile images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'profile-images');

-- Allow users to update and delete their own profile images
CREATE POLICY "Users can update their own profile images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'profile-images');

CREATE POLICY "Users can delete their own profile images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'profile-images');

-- Allow public access to organization logos
CREATE POLICY "Public Access to Organization Logos"
ON storage.objects FOR SELECT
USING (bucket_id = 'organization-logos');

-- Allow authenticated users to upload organization logos
CREATE POLICY "Authenticated users can upload organization logos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'organization-logos');

-- Allow authenticated users to update/delete organization logos
CREATE POLICY "Authenticated users can update organization logos"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'organization-logos');

CREATE POLICY "Users can delete organization logos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'organization-logos');
