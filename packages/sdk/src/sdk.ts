import { StepDatabaseService, WorkflowService } from './services';
import { WorkflowDatabaseService } from './services/workflow-database.service';
import { SupabaseClientService } from './services/supabase-client.service';

/**
 * Create a new instance of the Growly SDK that uses Supabase as the database.
 * @param supabaseUrl The URL of your Supabase instance.
 * @param supabaseKey The public key of your Supabase instance.
 */
export const createGrowlySdk = (supabaseUrl: string, supabaseKey: string) => {
  const supabaseClientService = new SupabaseClientService(supabaseUrl, supabaseKey);
  const workflowDatabaseService = new WorkflowDatabaseService(supabaseClientService);
  const stepDatabaseService = new StepDatabaseService(supabaseClientService);
  const workflowService = new WorkflowService(workflowDatabaseService, stepDatabaseService);
  return {
    db: {
      workflow: workflowDatabaseService,
      step: stepDatabaseService,
    },
    workflow: workflowService,
  };
};
