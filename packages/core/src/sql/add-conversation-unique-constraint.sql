-- Add unique constraint for conversation optimization
-- This enables the upsert optimization in createConversationIfNotExists

-- Check if the constraint already exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'conversation_agent_user_unique' 
        AND table_name = 'conversation'
    ) THEN
        -- Add unique constraint on agent_id and user_id combination
        ALTER TABLE conversation 
        ADD CONSTRAINT conversation_agent_user_unique 
        UNIQUE (agent_id, user_id);
    END IF;
END
$$;

-- Add comment explaining the constraint
COMMENT ON CONSTRAINT conversation_agent_user_unique ON conversation IS 
'Ensures one conversation per agent-user pair and enables upsert optimization';
