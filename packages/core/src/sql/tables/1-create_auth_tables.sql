-- Admin table
CREATE TABLE IF NOT EXISTS admins (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    image_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
comment on table public.admins is 'Admins for the application.';

GRANT ALL ON TABLE admins TO postgres;
GRANT ALL ON TABLE admins TO service_role;

-- Organization table
CREATE TABLE IF NOT EXISTS organizations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    logo_url TEXT,
    handle TEXT,
    referral_source TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
comment on table public.organizations is 'Organizations for each admin.';

GRANT ALL ON TABLE organizations TO postgres;
GRANT ALL ON TABLE organizations TO service_role;

-- New junction table to associate admins with organizations

CREATE TABLE IF NOT EXISTS admin_organizations (
    admin_id uuid REFERENCES admins(id) ON DELETE CASCADE,
    organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
    role TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (admin_id, organization_id)
);
comment on table public.admin_organizations is 'Associates admins with their referenced organizations.';

GRANT ALL ON TABLE admin_organizations TO postgres;
GRANT ALL ON TABLE admin_organizations TO service_role;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    entities JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    image_url TEXT,
    name TEXT,
    description TEXT
);
comment on table public.users is 'Users for the application.';

GRANT ALL ON TABLE users TO postgres;
GRANT ALL ON TABLE users TO service_role;

-- Users' organizations table
CREATE TABLE IF NOT EXISTS users_organizations (
    user_id uuid REFERENCES users(id) ON DELETE CASCADE,
    organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id, organization_id)
);
comment on table public.users_organizations is 'Associates users with their referenced organizations.';

GRANT ALL ON TABLE users_organizations TO postgres;
GRANT ALL ON TABLE users_organizations TO service_role

-- Add column `is_anonymous`
ALTER TABLE users ADD COLUMN is_anonymous BOOLEAN NOT NULL DEFAULT FALSE;

-- Users' personas table
-- Enum for sync_status
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'sync_status') THEN
        CREATE TYPE sync_status AS ENUM ('pending', 'running', 'completed', 'failed');
    END IF;
END
$$;

CREATE TABLE IF NOT EXISTS user_personas (
    id TEXT PRIMARY KEY,
    identities JSONB NOT NULL,
    activities JSONB NOT NULL,
    portfolio_snapshots JSONB NOT NULL,
    sync_status sync_status NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_synced_at TIMESTAMPTZ,
    retries INT DEFAULT 0,
    error_message TEXT
);

-- Add column `original_joined_at`
ALTER TABLE users
ADD COLUMN IF NOT EXISTS original_joined_at TIMESTAMP WITH TIME ZONE;

-- Add column `imported_source_data`
ALTER TABLE user_personas
ADD COLUMN imported_source_data JSONB[] NOT NULL DEFAULT ARRAY[]::JSONB[];

-- Update existing users to have original_joined_at set to created_at
UPDATE users
SET original_joined_at = created_at
WHERE original_joined_at IS NULL;

comment on table public.user_personas is 'Personas calculated for each user.';

GRANT ALL ON TABLE user_personas TO postgres;
GRANT ALL ON TABLE user_personas TO service_role;