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