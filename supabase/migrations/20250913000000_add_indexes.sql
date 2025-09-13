-- Migration: Add Performance Indexes
-- Created: 2025-09-13
-- Description: Add indexes to optimize common query patterns

-- Users indexes
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);
CREATE INDEX IF NOT EXISTS idx_users_entities_wallet ON users USING GIN ((entities->'walletAddress'));

-- Organizations indexes
CREATE INDEX IF NOT EXISTS idx_organizations_created_at ON organizations(created_at);
CREATE INDEX IF NOT EXISTS idx_organizations_name ON organizations(name);

-- Agents indexes
CREATE INDEX IF NOT EXISTS idx_agents_organization_id ON agents(organization_id);
CREATE INDEX IF NOT EXISTS idx_agents_status ON agents(status);
CREATE INDEX IF NOT EXISTS idx_agents_created_at ON agents(created_at);
CREATE INDEX IF NOT EXISTS idx_agents_model ON agents(model);

-- Resources indexes
CREATE INDEX IF NOT EXISTS idx_resources_organization_id ON resources(organization_id);
CREATE INDEX IF NOT EXISTS idx_resources_type ON resources(type);
CREATE INDEX IF NOT EXISTS idx_resources_status ON resources(status);
CREATE INDEX IF NOT EXISTS idx_resources_created_at ON resources(created_at);

-- User personas indexes
CREATE INDEX IF NOT EXISTS idx_user_personas_sync_status ON user_personas(sync_status);
CREATE INDEX IF NOT EXISTS idx_user_personas_last_synced_at ON user_personas(last_synced_at);
CREATE INDEX IF NOT EXISTS idx_user_personas_created_at ON user_personas(created_at);

-- Workflows indexes
CREATE INDEX IF NOT EXISTS idx_workflows_organization_id ON workflows(organization_id);
CREATE INDEX IF NOT EXISTS idx_workflows_status ON workflows(status);
CREATE INDEX IF NOT EXISTS idx_workflows_created_at ON workflows(created_at);

-- Steps indexes
CREATE INDEX IF NOT EXISTS idx_steps_workflow_id ON steps(workflow_id);
CREATE INDEX IF NOT EXISTS idx_steps_status ON steps(status);
CREATE INDEX IF NOT EXISTS idx_steps_index ON steps(index);

-- Junction table indexes
CREATE INDEX IF NOT EXISTS idx_admin_organizations_admin_id ON admin_organizations(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_organizations_organization_id ON admin_organizations(organization_id);
CREATE INDEX IF NOT EXISTS idx_users_organizations_user_id ON users_organizations(user_id);
CREATE INDEX IF NOT EXISTS idx_users_organizations_organization_id ON users_organizations(organization_id);

-- Composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_agents_org_status ON agents(organization_id, status);
CREATE INDEX IF NOT EXISTS idx_resources_org_status ON resources(organization_id, status);
CREATE INDEX IF NOT EXISTS idx_workflows_org_status ON workflows(organization_id, status);

-- Add GIN indexes for JSONB columns that are frequently queried
CREATE INDEX IF NOT EXISTS idx_steps_conditions ON steps USING GIN (conditions);
CREATE INDEX IF NOT EXISTS idx_steps_action ON steps USING GIN (action);
CREATE INDEX IF NOT EXISTS idx_user_personas_identities ON user_personas USING GIN (identities);
CREATE INDEX IF NOT EXISTS idx_user_personas_activities ON user_personas USING GIN (activities);
CREATE INDEX IF NOT EXISTS idx_user_personas_portfolio ON user_personas USING GIN (portfolio_snapshots);
CREATE INDEX IF NOT EXISTS idx_resources_value ON resources USING GIN (value);

-- Add text search capabilities
CREATE INDEX IF NOT EXISTS idx_agents_name_trgm ON agents USING GIN (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_resources_name_trgm ON resources USING GIN (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_workflows_name_trgm ON workflows USING GIN (name gin_trgm_ops);

-- Enable pg_trgm extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_trgm; 