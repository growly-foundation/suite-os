-- Enum for status
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'status') THEN
        CREATE TYPE status AS ENUM ('active', 'inactive');
    END IF;
END
$$;

-- Workflow table
CREATE TABLE IF NOT EXISTS workflows (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    status status NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
comment on table public.workflows is 'Workflows for each organization.';

GRANT ALL ON TABLE workflows TO postgres;
GRANT ALL ON TABLE workflows TO service_role;

-- Step table
CREATE TABLE IF NOT EXISTS steps (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id uuid REFERENCES workflows(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    conditions JSONB NOT NULL,
    action JSONB NOT NULL,
    status status NOT NULL DEFAULT 'active',
    index INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
comment on table public.steps is 'Steps for each workflow.';

CREATE TABLE IF NOT EXISTS step_sessions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    step_id uuid REFERENCES steps(id) ON DELETE CASCADE,
    user_id uuid REFERENCES users(id) ON DELETE CASCADE,
    agent_id uuid REFERENCES agents(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
comment on table public.step_sessions is 'Step sessions for each step.';

-- Add column `is_beast_mode`
ALTER TABLE steps ADD COLUMN is_beast_mode BOOLEAN NOT NULL DEFAULT FALSE;

-- Add column `is_repeat`
ALTER TABLE steps ADD COLUMN is_repeat BOOLEAN NOT NULL DEFAULT FALSE;

GRANT ALL ON TABLE steps TO postgres;
GRANT ALL ON TABLE steps TO service_role;

GRANT ALL ON TABLE step_sessions TO postgres;
GRANT ALL ON TABLE step_sessions TO service_role;

