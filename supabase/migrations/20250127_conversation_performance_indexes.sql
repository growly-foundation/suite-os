-- Performance indexes for conversation queries
-- These indexes will significantly improve query performance for conversation-related operations

-- Index for filtering conversations by agent_id
CREATE INDEX IF NOT EXISTS idx_conversation_agent_id ON conversation(agent_id);

-- Index for ordering conversations by creation date
CREATE INDEX IF NOT EXISTS idx_conversation_created_at ON conversation(created_at DESC);

-- Composite index for agent_id + created_at (most common query pattern)
CREATE INDEX IF NOT EXISTS idx_conversation_agent_created ON conversation(agent_id, created_at DESC);

-- Index for messages by conversation_id (for JOIN operations)
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);

-- Index for ordering messages by creation date within conversations
CREATE INDEX IF NOT EXISTS idx_messages_conversation_created ON messages(conversation_id, created_at DESC);

-- Composite index for the most common query: agent_id + created_at + message existence
-- This will be used for the main pagination query
CREATE INDEX IF NOT EXISTS idx_conversation_agent_created_with_messages 
ON conversation(agent_id, created_at DESC) 
WHERE id IN (SELECT DISTINCT conversation_id FROM messages);

-- Index for user_id lookups in conversations
CREATE INDEX IF NOT EXISTS idx_conversation_user_id ON conversation(user_id);

-- Index for messages by role (if needed for filtering)
CREATE INDEX IF NOT EXISTS idx_messages_role ON messages(role);

-- Partial index for active conversations (if you have a status field)
-- CREATE INDEX IF NOT EXISTS idx_conversation_active ON conversation(agent_id, created_at DESC) WHERE status = 'active';

-- Statistics update to help query planner
ANALYZE conversation;
ANALYZE messages;
