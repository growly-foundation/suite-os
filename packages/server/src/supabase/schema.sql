-- Enable the pgvector extension to work with embedding vectors
CREATE EXTENSION IF NOT EXISTS vector;

-- Create a table for storing conversation messages with embeddings
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id TEXT NOT NULL,
  agent_id TEXT NOT NULL,
  content TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  embedding VECTOR(1536), -- OpenAI's text-embedding-3-small creates 1536-dimensional vectors
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for faster queries
-- Vector similarity search index
CREATE INDEX IF NOT EXISTS messages_embedding_idx ON messages USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
-- Compound index for thread and agent lookup (our most common query pattern)
CREATE INDEX IF NOT EXISTS messages_thread_agent_idx ON messages(thread_id, agent_id);
-- Index for timestamp-based sorting
CREATE INDEX IF NOT EXISTS messages_created_at_idx ON messages(created_at);
-- Index for role-based filtering
CREATE INDEX IF NOT EXISTS messages_role_idx ON messages(role);

-- Create a function to search for similar messages by embedding similarity
CREATE OR REPLACE FUNCTION match_messages (
  query_embedding VECTOR(1536),
  match_threshold FLOAT,
  match_count INT,
  in_thread_id TEXT,
  in_agent_id TEXT
)
RETURNS TABLE (
  id UUID,
  content TEXT,
  thread_id TEXT,
  agent_id TEXT,
  role TEXT,
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
    m.thread_id,
    m.agent_id,
    m.role,
    m.created_at,
    1 - (m.embedding <=> query_embedding) AS similarity
  FROM messages m
  WHERE m.thread_id = in_thread_id
    AND m.agent_id = in_agent_id
    AND 1 - (m.embedding <=> query_embedding) > match_threshold
  ORDER BY similarity DESC
  LIMIT match_count;
END;
$$;

-- Function to retrieve the most recent N messages from a conversation
CREATE OR REPLACE FUNCTION get_recent_messages(
  p_thread_id TEXT,
  p_agent_id TEXT,
  p_limit INT DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  content TEXT,
  thread_id TEXT,
  agent_id TEXT,
  role TEXT,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    m.id,
    m.content,
    m.thread_id,
    m.agent_id,
    m.role,
    m.created_at
  FROM messages m
  WHERE m.thread_id = p_thread_id
    AND m.agent_id = p_agent_id
  ORDER BY m.created_at DESC
  LIMIT p_limit;
END;
$$;

-- Function to summarize a conversation with stats
CREATE OR REPLACE FUNCTION summarize_conversation(
  p_thread_id TEXT,
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
    COUNT(*) FILTER (WHERE role = 'user') as user_messages,
    COUNT(*) FILTER (WHERE role = 'assistant') as assistant_messages,
    MIN(created_at) as first_message_at,
    MAX(created_at) as last_message_at
  FROM messages
  WHERE thread_id = p_thread_id
    AND agent_id = p_agent_id;
END;
$$; 