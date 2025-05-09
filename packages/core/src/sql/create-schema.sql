-- Create public schema if not exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = 'public') THEN
        CREATE SCHEMA public;
    END IF;
END
$$;

GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;

-- Allow access to future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO anon, authenticated;