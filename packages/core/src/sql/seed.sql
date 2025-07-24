-- Seed for organizations
INSERT INTO organizations (id, name, description, created_at) VALUES
  ('b3b1a8e2-1c2d-4e5f-8a7b-1a2b3c4d5e6f', 'Growly', 'A sample organization', NOW()),
  ('c4d2b1e3-2f3a-4b5c-9d8e-2b3c4d5e6f7a', 'Base', 'Another organization', NOW());

-- Seed for admins
INSERT INTO admins (id, name, email, created_at) VALUES
  ('a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d', 'Ngan Nguyen', 'helloimngan@gmail.com', NOW()),
  ('b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e', 'Minh Pham', 'helloimminh@gmail.com', NOW());

-- Seed for users
INSERT INTO users (id, entities, created_at) VALUES
  ('d4e5f6a7-b8c9-4d0e-1f2a-3b4c5d6e7f8a', '{ "walletAddress": "0x6c34C667632dC1aAF04F362516e6F44D006A58fa"}'::jsonb, NOW()),
  ('e5f6a7b8-c9d0-4e1f-2a3b-4c5d6e7f8a9b', '{ "walletAddress": "0x55fce96d44c96ef27f296aeb37ad0eb360505015"}'::jsonb, NOW());

-- Seed for admin_organizations
INSERT INTO admin_organizations (admin_id, organization_id, role) VALUES
  ('a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d', 'b3b1a8e2-1c2d-4e5f-8a7b-1a2b3c4d5e6f', 'admin'),
  ('b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e', 'c4d2b1e3-2f3a-4b5c-9d8e-2b3c4d5e6f7a', 'admin');

-- Seed for agents
INSERT INTO agents (id, name, description, model, organization_id, status, created_at) VALUES
  ('f6a7b8c9-d0e1-4f2a-3b4c-5d6e7f8a9b0c', 'Agent Smith', 'Handles support', 'gpt-4', 'b3b1a8e2-1c2d-4e5f-8a7b-1a2b3c4d5e6f', 'active', NOW()),
  ('a7b8c9d0-e1f2-4a3b-4c5d-6e7f8a9b0c1d', 'Agent Jones', 'Handles sales', 'gpt-3.5', 'c4d2b1e3-2f3a-4b5c-9d8e-2b3c4d5e6f7a', 'inactive', NOW());
