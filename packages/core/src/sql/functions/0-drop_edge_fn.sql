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