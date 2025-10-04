-- SQL script to create my_services table
-- Run this in your Supabase SQL editor

-- Create the my_services table
CREATE TABLE IF NOT EXISTS my_services (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  service_id INTEGER NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, service_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_my_services_user_id ON my_services(user_id);
CREATE INDEX IF NOT EXISTS idx_my_services_service_id ON my_services(service_id);

-- Enable Row Level Security (optional - for extra security)
-- ALTER TABLE my_services ENABLE ROW LEVEL SECURITY;

-- Grant permissions (if needed)
-- You may need to grant permissions to your API user
-- GRANT ALL ON my_services TO your_api_user;
-- GRANT USAGE, SELECT ON SEQUENCE my_services_id_seq TO your_api_user;
