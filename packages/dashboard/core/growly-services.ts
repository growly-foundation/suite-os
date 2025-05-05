import { createGrowlySdk } from '@growly/sdk';

export const growlySdk = createGrowlySdk(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
