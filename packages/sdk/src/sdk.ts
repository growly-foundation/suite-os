import { PublicDatabaseService, AuthDatabaseService, WorkflowService } from './services';
import { OrganizationService } from './services/organization.service';
import { SupabaseClientService } from './services/supabase-client.service';

/**
 * Create a new instance of the Growly SDK that uses Supabase as the database.
 * @param supabaseUrl The URL of your Supabase instance.
 * @param supabaseKey The public key of your Supabase instance.
 */
export const createGrowlySdk = (supabaseUrl: string, supabaseKey: string) => {
  const supabaseClientService = new SupabaseClientService(supabaseUrl, supabaseKey);

  // Database services.
  const workflowDatabaseService = new PublicDatabaseService<'workflows'>(
    supabaseClientService,
    'workflows'
  );
  const stepDatabaseService = new PublicDatabaseService<'steps'>(supabaseClientService, 'steps');
  const organizationDatabaseService = new PublicDatabaseService<'organizations'>(
    supabaseClientService,
    'organizations'
  );
  const userDatabaseService = new AuthDatabaseService<'users'>(supabaseClientService, 'users');

  // Custom services.
  const workflowService = new WorkflowService(workflowDatabaseService, stepDatabaseService);
  const organizationService = new OrganizationService(organizationDatabaseService, workflowService);
  return {
    db: {
      workflow: workflowDatabaseService,
      step: stepDatabaseService,
      organization: organizationDatabaseService,
      user: userDatabaseService,
    },
    organization: organizationService,
    workflow: workflowService,
  };
};
