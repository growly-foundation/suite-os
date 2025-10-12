-- Migration: Add chain configuration to organizations
-- Created: 2025-10-10
-- Description: Add supported_chain_ids column to organizations table

-- Add supported_chain_ids column to organizations table
-- This stores an array of chain IDs (integers) that the organization supports
-- Maximum of 2 chains allowed per organization for now
ALTER TABLE organizations 
ADD COLUMN IF NOT EXISTS supported_chain_ids INTEGER[] DEFAULT NULL;

-- Add a comment describing the column
COMMENT ON COLUMN organizations.supported_chain_ids IS 'Array of supported chain IDs for the organization';

