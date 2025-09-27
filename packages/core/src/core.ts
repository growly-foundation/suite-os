import { SupabaseClient, createClient } from '@supabase/supabase-js';

import {
  AgentService,
  ConversationService,
  FunctionService,
  OrganizationService,
  PublicDatabaseService,
  StepService,
  UserPersonaService,
  UserService,
  WorkflowService,
} from './services';

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
  /** The database services. */
  db: {
    /** Manages admin users. */
    admins: PublicDatabaseService<'admins'>;

    /** Manages admin organizations relationship. */
    admin_organizations: PublicDatabaseService<'admin_organizations'>;

    /** Manages agents. */
    agents: PublicDatabaseService<'agents'>;

    /** Manages agent workflows relationship. */
    agent_workflows: PublicDatabaseService<'agent_workflows'>;

    /** Manages agent resources relationship. */
    agent_resources: PublicDatabaseService<'agent_resources'>;

    /** The Supabase client. */
    client: SupabaseClient;

    /** Manages conversations. */
    conversation: PublicDatabaseService<'conversation'>;

    /** Manages messages. */
    messages: PublicDatabaseService<'messages'>;

    /** Manages organizations. */
    organizations: PublicDatabaseService<'organizations'>;

    /** Manages resources. */
    resources: PublicDatabaseService<'resources'>;

    /** Manages steps. */
    steps: PublicDatabaseService<'steps'>;

    /** Manages step sessions. */
    step_sessions: PublicDatabaseService<'step_sessions'>;

    /** Manages users. */
    users: PublicDatabaseService<'users'>;

    /** Manages user personas. */
    user_personas: PublicDatabaseService<'user_personas'>;

    /** Manages workflows. */
    workflows: PublicDatabaseService<'workflows'>;
  };

  /** Agent services. */
  agents: AgentService;

  /** Organization services. */
  organizations: OrganizationService;

  /** User services. */
  users: UserService;

  /** User persona services. */
  userPersonas: UserPersonaService;

  /** Conversation services. */
  conversations: ConversationService;

  /** Workflow services. */
  workflows: WorkflowService;

  /** Step services. */
  steps: StepService;

  /** Function services. */
  fn: FunctionService;
}

/**
 * Create a new instance of the Growly Suite SDK that uses Supabase as the database.
 * @param supabaseUrl The URL of your Supabase instance.
 * @param supabaseKey The public key of your Supabase instance.
 */
export const createSuiteCore = (supabaseUrl: string, supabaseKey: string): SuiteDatabaseCore => {
  const supabaseClientService = createClient(supabaseUrl, supabaseKey);

  // Database services.
  const adminDatabaseService = new PublicDatabaseService<'admins'>(supabaseClientService, 'admins');
  const userDatabaseService = new PublicDatabaseService<'users'>(supabaseClientService, 'users');
  const conversationDatabaseService = new PublicDatabaseService<'conversation'>(
    supabaseClientService,
    'conversation'
  );
  const workflowDatabaseService = new PublicDatabaseService<'workflows'>(
    supabaseClientService,
    'workflows'
  );
  const stepDatabaseService = new PublicDatabaseService<'steps'>(supabaseClientService, 'steps');
  const stepSessionsDatabaseService = new PublicDatabaseService<'step_sessions'>(
    supabaseClientService,
    'step_sessions'
  );
  const organizationDatabaseService = new PublicDatabaseService<'organizations'>(
    supabaseClientService,
    'organizations'
  );
  const messageDatabaseService = new PublicDatabaseService<'messages'>(
    supabaseClientService,
    'messages'
  );
  const resourceDatabaseService = new PublicDatabaseService<'resources'>(
    supabaseClientService,
    'resources'
  );
  const agentDatabaseService = new PublicDatabaseService<'agents'>(supabaseClientService, 'agents');
  const agentResourcesDatabaseService = new PublicDatabaseService<'agent_resources'>(
    supabaseClientService,
    'agent_resources'
  );
  const agentWorkflowsService = new PublicDatabaseService<'agent_workflows'>(
    supabaseClientService,
    'agent_workflows'
  );
  const adminOrganizationDatabaseService = new PublicDatabaseService<'admin_organizations'>(
    supabaseClientService,
    'admin_organizations'
  );
  const userPersonasDatabaseService = new PublicDatabaseService<'user_personas'>(
    supabaseClientService,
    'user_personas'
  );

  // Edge functions.
  const functionService = new FunctionService(supabaseClientService);

  // Custom services.
  const workflowService = new WorkflowService(
    workflowDatabaseService,
    stepDatabaseService,
    agentWorkflowsService
  );
  const stepService = new StepService(stepDatabaseService);
  const agentService = new AgentService(
    workflowService,
    agentDatabaseService,
    agentWorkflowsService,
    agentResourcesDatabaseService,
    resourceDatabaseService
  );
  const organizationService = new OrganizationService(
    organizationDatabaseService,
    adminOrganizationDatabaseService,
    agentDatabaseService,
    workflowService
  );
  const userPersonaService = new UserPersonaService(
    userDatabaseService,
    userPersonasDatabaseService
  );
  const userService = new UserService(
    userDatabaseService,
    userPersonasDatabaseService,
    userPersonaService,
    supabaseClientService
  );
  const conversationService = new ConversationService(
    supabaseClientService,
    messageDatabaseService,
    conversationDatabaseService
  );

  const db = {
    admins: adminDatabaseService,
    admin_organizations: adminOrganizationDatabaseService,
    agents: agentDatabaseService,
    agent_workflows: agentWorkflowsService,
    agent_resources: agentResourcesDatabaseService,
    conversation: conversationDatabaseService,
    client: supabaseClientService,
    organizations: organizationDatabaseService,
    messages: messageDatabaseService,
    resources: resourceDatabaseService,
    steps: stepDatabaseService,
    step_sessions: stepSessionsDatabaseService,
    users: userDatabaseService,
    user_personas: userPersonasDatabaseService,
    workflows: workflowDatabaseService,
  };

  return {
    db,
    fn: functionService,
    agents: agentService,
    conversations: conversationService,
    workflows: workflowService,
    organizations: organizationService,
    steps: stepService,
    users: userService,
    userPersonas: userPersonaService,
  };
};
