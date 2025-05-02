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
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    status status NOT NULL,
    created_at TIMESTAMP NOT NULL
);

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
