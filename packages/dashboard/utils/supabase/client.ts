import { createBrowserClient } from '@supabase/ssr';
import type { TypedSupabaseClient } from '@/utils/types';
import { useMemo } from 'react';
import { Database, StepService, WorkflowService } from '@growly/sdk';

let client: TypedSupabaseClient | undefined;

export function getSupabaseBrowserClient() {
  if (client) {
    return client;
  }

  client = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  return client;
}

// @growly/sdk
export const workflowService = new WorkflowService(getSupabaseBrowserClient());
export const stepService = new StepService(getSupabaseBrowserClient());

function useSupabaseBrowser() {
  return useMemo(getSupabaseBrowserClient, []);
}

export default useSupabaseBrowser;
