-- Admin table
CREATE TABLE IF NOT EXISTS admins (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP NOT NULL DEFAULT now()
);
comment on table public.admins is 'Admins for the application.';

GRANT ALL ON TABLE admins TO postgres;
GRANT ALL ON TABLE admins TO service_role;

-- Organization table
CREATE TABLE IF NOT EXISTS organizations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT now()
);
comment on table public.organizations is 'Organizations for each admin.';

GRANT ALL ON TABLE organizations TO postgres;
GRANT ALL ON TABLE organizations TO service_role;

-- New junction table to associate admins with organizations

CREATE TABLE IF NOT EXISTS admin_organizations (
    admin_id uuid REFERENCES admins(id) ON DELETE CASCADE,
    organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
    PRIMARY KEY (admin_id, organization_id)
);
comment on table public.admin_organizations is 'Associates admins with their referenced organizations.';

GRANT ALL ON TABLE admin_organizations TO postgres;
GRANT ALL ON TABLE admin_organizations TO service_role;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    entities JSONB NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT now()
);
comment on table public.users is 'Users for the application.';

GRANT ALL ON TABLE users TO postgres;
GRANT ALL ON TABLE users TO service_role;