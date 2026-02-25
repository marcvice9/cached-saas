-- Users table + RLS + updated_at trigger function

-- Reusable trigger function for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL DEFAULT '',
  avatar_url TEXT,
  stripe_customer_id TEXT,
  plan plan_type NOT NULL DEFAULT 'FREE',
  timezone TEXT NOT NULL DEFAULT 'UTC',
  week_start_day week_start_day NOT NULL DEFAULT 'SUNDAY',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (id = auth.uid());
