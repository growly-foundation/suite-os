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

-- Create a table for storing conversation messages with embeddings
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  agent_id uuid REFERENCES agents(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  sender conversation_role NOT NULL,
  embedding VECTOR(1536), -- OpenAI's text-embedding-3-small creates 1536-dimensional vectors
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for faster queries
-- Vector similarity search index
CREATE INDEX IF NOT EXISTS messages_embedding_idx ON messages USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
-- Compound index for thread and agent lookup (our most common query pattern)
CREATE INDEX IF NOT EXISTS messages_user_agent_idx ON messages(user_id, agent_id);
-- Index for timestamp-based sorting
CREATE INDEX IF NOT EXISTS messages_created_at_idx ON messages(created_at);
-- Index for role-based filtering
CREATE INDEX IF NOT EXISTS messages_role_idx ON messages(sender);

