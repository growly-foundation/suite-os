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
