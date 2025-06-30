import { createClient } from '@supabase/supabase-js';

import { checkSupabaseConfig, supabaseConfig } from './supabase-config';

// Initialize Supabase client with anon key for public operations
export const supabase = createClient(supabaseConfig.url, supabaseConfig.anonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
});

/**
 * Uploads a file to Supabase storage
 * @param file File to upload
 * @param bucketType 'profiles' or 'organizations'
 * @param path Path prefix for the file (typically a user or org ID)
 * @returns URL of uploaded file or null if upload failed
 */
export async function uploadToSupabase(
  file: File,
  bucketType: 'profiles' | 'organizations',
  path: string
): Promise<string | null> {
  try {
    // Check if Supabase is configured
    if (!checkSupabaseConfig()) {
      console.warn('File upload skipped: Supabase not configured');
      return null;
    }

    // Get the actual bucket name from config
    const bucketName = supabaseConfig.buckets[bucketType];

    // Create unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${path}_${Date.now()}.${fileExt}`;
    const filePath = `${path}/${fileName}`;

    // Check storage bucket exists
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(bucket => bucket.name === bucketName);

    if (!bucketExists) {
      console.error(`Bucket '${bucketName}' does not exist. Creating bucket...`);
      try {
        // Attempt to create bucket if it doesn't exist
        const { error: createError } = await supabase.storage.createBucket(bucketName, {
          public: true, // Make the bucket public
        });

        if (createError) {
          console.error(`Failed to create bucket '${bucketName}':`, createError);
          return null;
        }
      } catch (err) {
        console.error(`Error creating bucket '${bucketName}':`, err);
        return null;
      }
    }

    // Upload file to Supabase storage
    const { data, error } = await supabase.storage.from(bucketName).upload(filePath, file, {
      cacheControl: '3600',
      upsert: true,
    });

    if (error) {
      console.error(`Error uploading file to ${bucketType} bucket:`, error);
      // Check for policy-related errors
      if (
        error.message?.includes('new row violates row-level security') ||
        error.message?.includes('permission denied')
      ) {
        console.error('Permission denied. This is likely due to Row Level Security policies.');
        console.error('Please make sure the storage bucket has appropriate RLS policies set up.');
      }
      return null;
    }

    // Get public URL
    const { data: urlData } = supabase.storage.from(bucketName).getPublicUrl(data?.path || '');

    return urlData.publicUrl;
  } catch (error) {
    console.error('Error in uploadToSupabase:', error);
    return null;
  }
}
