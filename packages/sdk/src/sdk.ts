import { PublicDatabaseService, WorkflowService } from './services';
import { OrganizationService } from './services/organization.service';
import { SupabaseClientService } from './services/supabase-client.service';

/**
 * Create a new instance of the Growly Suite SDK that uses Supabase as the database.
 * @param supabaseUrl The URL of your Supabase instance.
 * @param supabaseKey The public key of your Supabase instance.
 */
export const createSuiteSdk = (supabaseUrl: string, supabaseKey: string) => {
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

  // Custom services.
  const workflowService = new WorkflowService(workflowDatabaseService, stepDatabaseService);
  const organizationService = new OrganizationService(organizationDatabaseService, workflowService);
  return {
    db: {
      users: userDatabaseService,
      workflows: workflowDatabaseService,
      steps: stepDatabaseService,
      organizations: organizationDatabaseService,
    },
    organizations: organizationService,
    workflows: workflowService,
  };
};
