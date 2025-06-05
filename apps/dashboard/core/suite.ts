import { ENV_VARIABLES } from '@/constants/env';

import { createSuiteCore } from '@getgrowly/core';

/**
 * SDK for interacting with the Growly Suite API.
 */
export const suiteCore = (() => {
  if (!ENV_VARIABLES.SUPABASE_URL || !ENV_VARIABLES.SUPABASE_ANON_KEY) {
    throw new Error('Missing environment variables');
  }
  return createSuiteCore(ENV_VARIABLES.SUPABASE_URL, ENV_VARIABLES.SUPABASE_ANON_KEY);
})();
