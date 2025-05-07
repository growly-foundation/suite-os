-- Enum for status
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'status') THEN
        CREATE TYPE status AS ENUM ('active', 'inactive');
    END IF;
END
$$;

-- Organization table
CREATE TABLE IF NOT EXISTS organizations (
    id TEXT PRIMARY KEY,
    user_id uuid REFERENCES next_auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL
);
comment on table public.organizations is 'Organizations for each user.';

-- Workflow table
CREATE TABLE IF NOT EXISTS workflows (
    id TEXT PRIMARY KEY,
    organization_id TEXT REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    status status NOT NULL,
    created_at TIMESTAMP NOT NULL
);
comment on table public.workflows is 'Workflows for each organization.';

-- Step table
CREATE TABLE IF NOT EXISTS steps (
    id TEXT PRIMARY KEY,
    workflow_id TEXT REFERENCES workflows(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    conditions JSONB NOT NULL,
    action JSONB NOT NULL,
    status status NOT NULL,
    created_at TIMESTAMP NOT NULL
);
comment on table public.steps is 'Steps for each workflow.';
