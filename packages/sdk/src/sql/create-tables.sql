-- Enum for status
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'status') THEN
        CREATE TYPE status AS ENUM ('active', 'inactive');
    END IF;
END
$$;

-- User table
CREATE TABLE IF NOT EXISTS users (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP NOT NULL DEFAULT now()
);
comment on table public.users is 'Users for the application.';

GRANT ALL ON TABLE users TO postgres;
GRANT ALL ON TABLE users TO service_role;

-- Organization table
CREATE TABLE IF NOT EXISTS organizations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT now()
);
comment on table public.organizations is 'Organizations for each user.';

GRANT ALL ON TABLE organizations TO postgres;
GRANT ALL ON TABLE organizations TO service_role;

-- Workflow table
CREATE TABLE IF NOT EXISTS workflows (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    status status NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT now()
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
    status status NOT NULL,
    index INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT now()
);
comment on table public.steps is 'Steps for each workflow.';

GRANT ALL ON TABLE steps TO postgres;
GRANT ALL ON TABLE steps TO service_role