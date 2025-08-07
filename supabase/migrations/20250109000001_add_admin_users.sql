-- Create admin_users table for managing admin access
CREATE TABLE admin_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE
);

-- Create index on email for faster lookups
CREATE INDEX idx_admin_users_email ON admin_users(email);
CREATE INDEX idx_admin_users_active ON admin_users(is_active) WHERE is_active = true;

-- Enable RLS (Row Level Security)
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Admin users can only be managed by service role
-- No regular user access needed for this table
CREATE POLICY "Admin users managed by service role only" ON admin_users
  FOR ALL TO service_role;

-- Insert default admin user (replace with your email)
-- INSERT INTO admin_users (email) VALUES ('your-email@gmail.com');