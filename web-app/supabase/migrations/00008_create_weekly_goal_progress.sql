-- Weekly goal progress table + unique constraint + RLS + indexes

CREATE TABLE weekly_goal_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  week_start_date DATE NOT NULL,
  scheduled_minutes INTEGER NOT NULL DEFAULT 0,
  completed_minutes INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, category_id, week_start_date)
);

CREATE TRIGGER weekly_goal_progress_updated_at
  BEFORE UPDATE ON weekly_goal_progress
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_weekly_goal_user_week ON weekly_goal_progress(user_id, week_start_date);

ALTER TABLE weekly_goal_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own progress" ON weekly_goal_progress
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own progress" ON weekly_goal_progress
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own progress" ON weekly_goal_progress
  FOR UPDATE USING (user_id = auth.uid());
