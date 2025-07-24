-- Migration: Initial Schema
-- Created: $(date)
-- Description: Complete database schema including tables, functions, and seed data

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- Create schema
CREATE SCHEMA IF NOT EXISTS public;

-- Set up RLS (commented out - requires special permissions)
-- ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- =============================================================================
-- DATABASE SCHEMA
-- =============================================================================


-- Schema setup
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

-- ⚠️ DANGEROUS CODE DISABLED - This was causing data loss
-- 0-drop_all_tables.sql
-- DO $$
-- DECLARE
--     tbl RECORD;
-- BEGIN
--     FOR tbl IN
--         SELECT tablename
--         FROM pg_tables
--         WHERE schemaname = 'public'
--     LOOP
--         EXECUTE format('DROP TABLE IF EXISTS public.%I CASCADE', tbl.tablename);
--     END LOOP;
-- END $$;

-- Tables

-- 1-create_auth_tables.sql
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
GRANT ALL ON TABLE users_organizations TO service_role;

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
-- 2-create_workflow_tables.sql
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

-- Step sessions table will be created in agent tables file to avoid circular dependencies

-- Add column `is_beast_mode`
ALTER TABLE steps ADD COLUMN is_beast_mode BOOLEAN NOT NULL DEFAULT FALSE;

-- Add column `is_repeat`
ALTER TABLE steps ADD COLUMN is_repeat BOOLEAN NOT NULL DEFAULT FALSE;

GRANT ALL ON TABLE steps TO postgres;
GRANT ALL ON TABLE steps TO service_role;


-- 3-create_agent_tables.sql
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
-- 4-create_message_tables.sql
-- Enum for conversation role
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'conversation_role') THEN
        CREATE TYPE conversation_role AS ENUM ('user', 'assistant', 'system', 'admin');
    END IF;
END
$$;

-- Enable the pgvector extension to work with embedding vectors
CREATE EXTENSION IF NOT EXISTS vector;

-- Create a table for storing conversation.
CREATE TABLE IF NOT EXISTS conversation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  agent_id uuid REFERENCES agents(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
comment on table public.conversation is 'Conversations for the application.';

GRANT ALL ON TABLE conversation TO postgres;
GRANT ALL ON TABLE conversation TO service_role;

-- Create a table for storing conversation messages with embeddings
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversation(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  sender conversation_role NOT NULL,
  sender_id uuid NULL, -- Nullable if the message is sent by a system or anonymous entity.
  embedding VECTOR(1536), -- OpenAI's text-embedding-3-small creates 1536-dimensional vectors
  created_at TIMESTAMPTZ DEFAULT NOW()
);
comment on table public.messages is 'Messages for the application.';

GRANT ALL ON TABLE messages TO postgres;
GRANT ALL ON TABLE messages TO service_role;

-- Create indexes for faster queries
-- Vector similarity search index
CREATE INDEX IF NOT EXISTS messages_embedding_idx ON messages USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
-- Compound index for thread and agent lookup (our most common query pattern)
CREATE INDEX IF NOT EXISTS messages_conversation_idx ON messages(conversation_id);
-- Index for timestamp-based sorting
CREATE INDEX IF NOT EXISTS messages_created_at_idx ON messages(created_at);
-- Index for role-based filtering
CREATE INDEX IF NOT EXISTS messages_role_idx ON messages(sender);


-- Functions

-- 0-drop_edge_fn.sql
-- Drop all edge functions

-- Organization functions
DROP FUNCTION IF EXISTS get_admin_organizations;
DROP FUNCTION IF EXISTS get_organizations_with_agents_and_workflows;

-- Agent functions
DROP FUNCTION IF EXISTS get_agents_with_workflows;

-- Message functions
DROP FUNCTION IF EXISTS summarize_conversation;
DROP FUNCTION IF EXISTS get_recent_messages;
DROP FUNCTION IF EXISTS match_messages;
-- 1-organization_fn.sql
-- Function to get organizations mapped to admin

CREATE OR REPLACE FUNCTION get_admin_organizations(p_admin_id uuid)
RETURNS TABLE (
    admin_id uuid,
    organization_id uuid
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        ao.admin_id,
        ao.organization_id
    FROM admin_organizations ao
    WHERE ao.admin_id = p_admin_id;
END;
$$ LANGUAGE plpgsql STABLE;


-- 2-message_fn.sql
-- Create a function to search for similar messages by embedding similarity
CREATE OR REPLACE FUNCTION match_messages (
  query_embedding VECTOR(1536),
  match_threshold FLOAT,
  match_count INT,
  in_user_id TEXT,
  in_agent_id TEXT
)
RETURNS TABLE (
  id UUID,
  content TEXT,
  user_id TEXT,
  agent_id TEXT,
  sender TEXT,
  created_at TIMESTAMPTZ,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    m.id,
    m.content,
    m.user_id,
    m.agent_id,
    m.sender,
    m.created_at,
    1 - (m.embedding <=> query_embedding) AS similarity
  FROM messages m
  WHERE m.user_id = in_user_id
    AND m.agent_id = in_agent_id
    AND 1 - (m.embedding <=> query_embedding) > match_threshold
  ORDER BY similarity DESC
  LIMIT match_count;
END;
$$;

-- Function to retrieve the most recent N messages from a conversation
CREATE OR REPLACE FUNCTION get_recent_messages(
  p_user_id TEXT,
  p_agent_id TEXT,
  p_limit INT DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  content TEXT,
  user_id TEXT,
  agent_id TEXT,
  sender TEXT,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    m.id,
    m.content,
    m.user_id,
    m.agent_id,
    m.sender,
    m.created_at
  FROM messages m
  WHERE m.user_id = puser_id_
    AND m.agent_id = p_agent_id
  ORDER BY m.created_at DESC
  LIMIT p_limit;
END;
$$;

-- Function to summarize a conversation with stats
CREATE OR REPLACE FUNCTION summarize_conversation(
  p_user_id TEXT,
  p_agent_id TEXT
)
RETURNS TABLE (
  total_messages BIGINT,
  user_messages BIGINT,
  assistant_messages BIGINT,
  first_message_at TIMESTAMPTZ,
  last_message_at TIMESTAMPTZ
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*) as total_messages,
    COUNT(*) FILTER (WHERE sender = 'user') as user_messages,
    COUNT(*) FILTER (WHERE sender = 'assistant') as assistant_messages,
    MIN(created_at) as first_message_at,
    MAX(created_at) as last_message_at
  FROM messages
  WHERE user_id = puser_id_
    AND agent_id = p_agent_id;
END;
$$; 
-- 3-agent_fn.sql
-- Function to get agents with their workflows

CREATE OR REPLACE FUNCTION get_agents_with_workflows()
RETURNS TABLE (
    agent_id uuid,
    organization_id uuid,
    name TEXT,
    description TEXT,
    model TEXT,
    resources TEXT[],
    status status,
    created_at TIMESTAMP,
    workflows uuid[]
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        a.id,
        a.organization_id,
        a.name,
        a.description,
        a.model,
        a.resources,
        a.status,
        a.created_at,
        ARRAY_AGG(aw.workflow_id) AS workflows
    FROM agents a
    LEFT JOIN agent_workflows aw ON aw.agent_id = a.id
    GROUP BY a.id;
END;
$$ LANGUAGE plpgsql STABLE;

-- 4-user_fn.sql
-- Create a trigger function create a persona for a user when a new user is created
CREATE OR REPLACE FUNCTION create_user_persona()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO user_personas (
        id,
        identities,
        activities,
        portfolio_snapshots
    )
    VALUES (
        NEW.entities->>'walletAddress',
        '{}'::jsonb,
        '{}'::jsonb,
        '{}'::jsonb
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to call the function when a new user is created
CREATE TRIGGER user_persona_trigger
AFTER INSERT ON users
FOR EACH ROW EXECUTE FUNCTION create_user_persona();

-- Storage Policies
-- Create storage buckets if they don't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-images', 'Profile Images', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('organization-logos', 'Organization Logos', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public access to profile images
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' 
        AND schemaname = 'storage' 
        AND policyname = 'Public Access to Profile Images'
    ) THEN
        CREATE POLICY "Public Access to Profile Images"
        ON storage.objects FOR SELECT
        USING (bucket_id = 'profile-images');
    END IF;
END $$;

-- Allow authenticated users to upload profile images
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' 
        AND schemaname = 'storage' 
        AND policyname = 'Authenticated users can upload profile images'
    ) THEN
        CREATE POLICY "Authenticated users can upload profile images"
        ON storage.objects FOR INSERT
        TO authenticated
        WITH CHECK (bucket_id = 'profile-images');
    END IF;
END $$;

-- Allow users to update and delete their own profile images
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' 
        AND schemaname = 'storage' 
        AND policyname = 'Users can update their own profile images'
    ) THEN
        CREATE POLICY "Users can update their own profile images"
        ON storage.objects FOR UPDATE
        TO authenticated
        USING (bucket_id = 'profile-images');
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' 
        AND schemaname = 'storage' 
        AND policyname = 'Users can delete their own profile images'
    ) THEN
        CREATE POLICY "Users can delete their own profile images"
        ON storage.objects FOR DELETE
        TO authenticated
        USING (bucket_id = 'profile-images');
    END IF;
END $$;

-- Allow public access to organization logos
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' 
        AND schemaname = 'storage' 
        AND policyname = 'Public Access to Organization Logos'
    ) THEN
        CREATE POLICY "Public Access to Organization Logos"
        ON storage.objects FOR SELECT
        USING (bucket_id = 'organization-logos');
    END IF;
END $$;

-- Allow authenticated users to upload organization logos
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' 
        AND schemaname = 'storage' 
        AND policyname = 'Authenticated users can upload organization logos'
    ) THEN
        CREATE POLICY "Authenticated users can upload organization logos"
        ON storage.objects FOR INSERT
        TO authenticated
        WITH CHECK (bucket_id = 'organization-logos');
    END IF;
END $$;

-- Allow authenticated users to update/delete organization logos
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' 
        AND schemaname = 'storage' 
        AND policyname = 'Authenticated users can update organization logos'
    ) THEN
        CREATE POLICY "Authenticated users can update organization logos"
        ON storage.objects FOR UPDATE
        TO authenticated
        USING (bucket_id = 'organization-logos');
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' 
        AND schemaname = 'storage' 
        AND policyname = 'Users can delete organization logos'
    ) THEN
        CREATE POLICY "Users can delete organization logos"
        ON storage.objects FOR DELETE
        TO authenticated
        USING (bucket_id = 'organization-logos');
    END IF;
END $$;

-- Seed Data
-- Seed for organizations
INSERT INTO organizations (id, name, description, created_at) VALUES
  ('b3b1a8e2-1c2d-4e5f-8a7b-1a2b3c4d5e6f', 'Growly', 'A sample organization', NOW()),
  ('c4d2b1e3-2f3a-4b5c-9d8e-2b3c4d5e6f7a', 'Base', 'Another organization', NOW());

-- Seed for admins
INSERT INTO admins (id, name, email, created_at) VALUES
  ('a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d', 'Ngan Nguyen', 'helloimngan@gmail.com', NOW()),
  ('b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e', 'Minh Pham', 'helloimminh@gmail.com', NOW());

-- Seed for users
INSERT INTO users (id, entities, created_at) VALUES
  ('d4e5f6a7-b8c9-4d0e-1f2a-3b4c5d6e7f8a', '{ "walletAddress": "0x6c34C667632dC1aAF04F362516e6F44D006A58fa"}'::jsonb, NOW()),
  ('e5f6a7b8-c9d0-4e1f-2a3b-4c5d6e7f8a9b', '{ "walletAddress": "0x55fce96d44c96ef27f296aeb37ad0eb360505015"}'::jsonb, NOW());

-- Seed for admin_organizations
INSERT INTO admin_organizations (admin_id, organization_id, role) VALUES
  ('a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d', 'b3b1a8e2-1c2d-4e5f-8a7b-1a2b3c4d5e6f', 'admin'),
  ('b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e', 'c4d2b1e3-2f3a-4b5c-9d8e-2b3c4d5e6f7a', 'admin');

-- Seed for agents
INSERT INTO agents (id, name, description, model, organization_id, status, created_at) VALUES
  ('f6a7b8c9-d0e1-4f2a-3b4c-5d6e7f8a9b0c', 'Agent Smith', 'Handles support', 'gpt-4', 'b3b1a8e2-1c2d-4e5f-8a7b-1a2b3c4d5e6f', 'active', NOW()),
  ('a7b8c9d0-e1f2-4a3b-4c5d-6e7f8a9b0c1d', 'Agent Jones', 'Handles sales', 'gpt-3.5', 'c4d2b1e3-2f3a-4b5c-9d8e-2b3c4d5e6f7a', 'inactive', NOW());
