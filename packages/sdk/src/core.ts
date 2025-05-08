import { SupabaseClient } from '@supabase/supabase-js';
import { PublicDatabaseService, WorkflowService } from './services';
import { OrganizationService } from './services/organization.service';
import { SupabaseClientService } from './services/supabase-client.service';

/**
 * The Growly Suite SDK.
 *
 * Use this to interact with the core databases of Growly Suite.
 *
 * @example
 * ```typescript
 * const sdk = createSuiteSdk('https://your-supabase-url.supabase.co', 'your-supabase-key');
 * ```
 */
export interface SuiteDatabaseCore {
  db: {
    client: SupabaseClient;
    users: PublicDatabaseService<'users'>;
    workflows: PublicDatabaseService<'workflows'>;
    steps: PublicDatabaseService<'steps'>;
    organizations: PublicDatabaseService<'organizations'>;
    messages: PublicDatabaseService<'messages'>;
    agents: PublicDatabaseService<'agents'>;
  };
  organizations: OrganizationService;
  workflows: WorkflowService;
}

/**
 * Create a new instance of the Growly Suite SDK that uses Supabase as the database.
 * @param supabaseUrl The URL of your Supabase instance.
 * @param supabaseKey The public key of your Supabase instance.
 */
export const createSuiteDatabaseCore = (
  supabaseUrl: string,
  supabaseKey: string
): SuiteDatabaseCore => {
  const supabaseClientService = new SupabaseClientService(supabaseUrl, supabaseKey);

  // Database services.
  const userDatabaseService = new PublicDatabaseService<'users'>(supabaseClientService, 'users');
  const workflowDatabaseService = new PublicDatabaseService<'workflows'>(
    supabaseClientService,
    'workflows'
  );
  const stepDatabaseService = new PublicDatabaseService<'steps'>(supabaseClientService, 'steps');
  const organizationDatabaseService = new PublicDatabaseService<'organizations'>(
    supabaseClientService,
    'organizations'
  );
  const messageDatabaseService = new PublicDatabaseService<'messages'>(
    supabaseClientService,
    'messages'
  );
  const agentDatabaseService = new PublicDatabaseService<'agents'>(supabaseClientService, 'agents');

  // Custom services.
  const workflowService = new WorkflowService(workflowDatabaseService, stepDatabaseService);
  const organizationService = new OrganizationService(organizationDatabaseService, workflowService);
  return {
    db: {
      client: supabaseClientService.getClient(),
      users: userDatabaseService,
      workflows: workflowDatabaseService,
      steps: stepDatabaseService,
      organizations: organizationDatabaseService,
      messages: messageDatabaseService,
      agents: agentDatabaseService,
    },
    organizations: organizationService,
    workflows: workflowService,
  };
};
