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