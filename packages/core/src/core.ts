import { SupabaseClient } from '@supabase/supabase-js';
import {
  FunctionService,
  OrganizationService,
  PublicDatabaseService,
  WorkflowService,
} from './services';
import { SupabaseClientService } from './services/supabase-client.service';

/**
 * The Growly Suite SDK.
 *
 * Use this to interact with the core databases of Growly Suite.
 *
 * @example
 * ```typescript
 * const suiteCore = createSuiteCore('https://your-supabase-url.supabase.co', 'your-supabase-key');
 * ```
 */
export interface SuiteDatabaseCore {
  db: {
    client: SupabaseClient;
    admins: PublicDatabaseService<'admins'>;
    users: PublicDatabaseService<'users'>;
    workflows: PublicDatabaseService<'workflows'>;
    steps: PublicDatabaseService<'steps'>;
    organizations: PublicDatabaseService<'organizations'>;
    admin_organizations: PublicDatabaseService<'admin_organizations'>;
    messages: PublicDatabaseService<'messages'>;
    agents: PublicDatabaseService<'agents'>;
  };
  fn: FunctionService;
  workflows: WorkflowService;
  organizations: OrganizationService;
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
  const adminDatabaseService = new PublicDatabaseService<'admins'>(supabaseClientService, 'admins');
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
  const adminOrganizationDatabaseService = new PublicDatabaseService<'admin_organizations'>(
    supabaseClientService,
    'admin_organizations'
  );

  // Edge functions.
  const functionService = new FunctionService(supabaseClientService);

  // Custom services.
  const workflowService = new WorkflowService(workflowDatabaseService, stepDatabaseService);
  const organizationService = new OrganizationService(
    organizationDatabaseService,
    adminOrganizationDatabaseService,
    agentDatabaseService,
    workflowService,
    functionService
  );

  return {
    fn: functionService,
    db: {
      client: supabaseClientService.getClient(),
      admins: adminDatabaseService,
      users: userDatabaseService,
      workflows: workflowDatabaseService,
      steps: stepDatabaseService,
      organizations: organizationDatabaseService,
      admin_organizations: adminOrganizationDatabaseService,
      messages: messageDatabaseService,
      agents: agentDatabaseService,
    },
    workflows: workflowService,
    organizations: organizationService,
  };
};
