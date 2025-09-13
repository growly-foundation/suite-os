-- Enum for status
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'resource_type') THEN
        CREATE TYPE resource_type AS ENUM ('contract', 'link', 'document', 'text');
    END IF;
END
$$;

-- Agents table

CREATE TABLE IF NOT EXISTS agents (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    model TEXT NOT NULL,
    status status NOT NULL DEFAULT 'active',
    created_at TIMESTAMP NOT NULL DEFAULT now()
);
comment on table public.agents is 'Agents for each organization.';

GRANT ALL ON TABLE agents TO postgres;
GRANT ALL ON TABLE agents TO service_role;

CREATE TABLE IF NOT EXISTS resources (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type resource_type NOT NULL,
    value JSONB NOT NULL,
    status status NOT NULL DEFAULT 'active',
    created_at TIMESTAMP NOT NULL DEFAULT now()
);
comment on table public.resources is 'Resources for each organization.';

GRANT ALL ON TABLE resources TO postgres;
GRANT ALL ON TABLE resources TO service_role;

-- New junction table to associate agents with workflows

CREATE TABLE IF NOT EXISTS agent_workflows (
    agent_id uuid REFERENCES agents(id) ON DELETE CASCADE,
    workflow_id uuid REFERENCES workflows(id) ON DELETE CASCADE,
    status status NOT NULL DEFAULT 'active',
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    PRIMARY KEY (agent_id, workflow_id)
);
comment on table public.agent_workflows is 'Associates agents with their referenced workflows.';

GRANT ALL ON TABLE agent_workflows TO postgres;
GRANT ALL ON TABLE agent_workflows TO service_role;

-- New junction table to associate agents with resources

CREATE TABLE IF NOT EXISTS agent_resources (
    agent_id uuid REFERENCES agents(id) ON DELETE CASCADE,
    resource_id uuid REFERENCES resources(id) ON DELETE CASCADE,
    status status NOT NULL DEFAULT 'active',
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    PRIMARY KEY (agent_id, resource_id)
);
comment on table public.agent_resources is 'Associates agents with their referenced resources.';

GRANT ALL ON TABLE agent_resources TO postgres;
GRANT ALL ON TABLE agent_resources TO service_role;

-- Step sessions table (moved here to avoid circular dependencies)
CREATE TABLE IF NOT EXISTS step_sessions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    step_id uuid REFERENCES steps(id) ON DELETE CASCADE,
    user_id uuid REFERENCES users(id) ON DELETE CASCADE,
    agent_id uuid REFERENCES agents(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
comment on table public.step_sessions is 'Step sessions for each step.';

GRANT ALL ON TABLE step_sessions TO postgres;
GRANT ALL ON TABLE step_sessions TO service_role;

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS agent_workflows_agent_id_idx ON agent_workflows(agent_id);
CREATE INDEX IF NOT EXISTS agent_workflows_workflow_id_idx ON agent_workflows(workflow_id);
CREATE INDEX IF NOT EXISTS agent_resources_agent_id_idx ON agent_resources(agent_id);
CREATE INDEX IF NOT EXISTS agent_resources_resource_id_idx ON agent_resources(resource_id);

CREATE INDEX IF NOT EXISTS step_sessions_step_id_idx ON step_sessions(step_id);
CREATE INDEX IF NOT EXISTS step_sessions_user_id_idx ON step_sessions(user_id);
CREATE INDEX IF NOT EXISTS step_sessions_agent_id_idx ON step_sessions(agent_id);

CREATE INDEX IF NOT EXISTS resources_organization_id_idx ON resources(organization_id);
CREATE INDEX IF NOT EXISTS agents_organization_id_idx ON agents(organization_id);

-- Create composite indexes for faster queries
CREATE INDEX IF NOT EXISTS agent_workflows_agent_id_workflow_id_idx ON agent_workflows(agent_id, workflow_id);
CREATE INDEX IF NOT EXISTS agent_resources_agent_id_resource_id_idx ON agent_resources(agent_id, resource_id);
CREATE INDEX IF NOT EXISTS step_sessions_step_id_user_id_agent_id_idx ON step_sessions(step_id, user_id, agent_id);
