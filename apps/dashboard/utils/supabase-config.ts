/**
 * Configuration for Supabase integration
 *
 * This file provides configuration values and checks for Supabase integration
 */

interface SupabaseConfig {
  url: string;
  anonKey: string;
  buckets: {
    profiles: string;
    organizations: string;
  };
  isConfigured: boolean;
}

// Get environment variables
const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Define bucket names - these must match the buckets created in Supabase
const buckets = {
  profiles: 'profile-images',
  organizations: 'organization-logos',
};

// Check if Supabase is properly configured
const isConfigured = Boolean(url && anonKey);

// Export configuration
export const supabaseConfig: SupabaseConfig = {
  url,
  anonKey,
  buckets,
  isConfigured,
};

// Helper function to check if Supabase is configured
export function checkSupabaseConfig(): boolean {
  if (!supabaseConfig.isConfigured) {
    console.warn(
      'Supabase is not configured properly. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.'
    );
    return false;
  }
  return true;
}
