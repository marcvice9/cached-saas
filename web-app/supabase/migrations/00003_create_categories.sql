-- Categories table + RLS + indexes

CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  goal_description TEXT,
  weekly_time_budget_minutes INTEGER,
  priority INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_category_user_id ON categories(user_id);
CREATE INDEX idx_category_user_active ON categories(user_id, is_active);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own categories" ON categories
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own categories" ON categories
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own categories" ON categories
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own categories" ON categories
  FOR DELETE USING (user_id = auth.uid());
