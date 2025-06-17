-- Create a trigger function create a persona for a user when a new user is created
CREATE OR REPLACE FUNCTION create_user_persona()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO user_personas (
        wallet_address,
        identities,
        activities,
        portfolio_snapshots
    )
    VALUES (
        NEW.entities->>'walletAddress',
        '{}'::jsonb,
        '{}'::jsonb,
        '{}'::jsonb
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to call the function when a new user is created
CREATE TRIGGER user_persona_trigger
AFTER INSERT ON users
FOR EACH ROW EXECUTE FUNCTION create_user_persona();
