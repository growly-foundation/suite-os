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
-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS conversation_user_id_idx ON conversation(user_id);
CREATE INDEX IF NOT EXISTS conversation_agent_id_idx ON conversation(agent_id);
-- Index for sender_id lookup
CREATE INDEX IF NOT EXISTS messages_sender_id_idx ON messages(sender_id);