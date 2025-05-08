CREATE OR REPLACE FUNCTION get_organizations_with_agents_and_workflows()
RETURNS TABLE (
    organization_id uuid,
    organization_name TEXT,
    agents JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        o.id,
        o.name,
        jsonb_agg(
            jsonb_build_object(
                'id', a.id,
                'name', a.name,
                'description', a.description,
                'model', a.model,
                'resources', a.resources,
                'status', a.status,
                'created_at', a.created_at,
                'workflows', COALESCE(wf_data.workflows, '[]'::jsonb)
            )
        ) AS agents
    FROM organizations o
    LEFT JOIN agents a ON a.organization_id = o.id
    LEFT JOIN (
        SELECT
            aw.agent_id,
            jsonb_agg(
                jsonb_build_object(
                    'id', w.id,
                    'name', w.name,
                    'description', w.description,
                    'status', w.status,
                    'created_at', w.created_at
                )
            ) AS workflows
        FROM agent_workflows aw
        JOIN workflows w ON w.id = aw.workflow_id
        GROUP BY aw.agent_id
    ) wf_data ON wf_data.agent_id = a.id
    GROUP BY o.id;
END;
$$ LANGUAGE plpgsql STABLE;
