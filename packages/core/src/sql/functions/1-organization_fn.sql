-- Function to get organizations mapped to admin

CREATE OR REPLACE FUNCTION get_admin_organizations(p_admin_id uuid)
RETURNS TABLE (
    admin_id uuid,
    organization_id uuid
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        ao.admin_id,
        ao.organization_id
    FROM admin_organizations ao
    WHERE ao.admin_id = p_admin_id;
END;
$$ LANGUAGE plpgsql STABLE;

