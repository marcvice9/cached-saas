-- Learning slots table + RLS + indexes

CREATE TABLE learning_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  day_of_week day_of_week NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  label TEXT,
  allowed_formats JSONB,
  preferred_category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT valid_time_range CHECK (start_time < end_time)
);

CREATE TRIGGER learning_slots_updated_at
  BEFORE UPDATE ON learning_slots
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_learning_slot_user_active ON learning_slots(user_id, is_active);
CREATE INDEX idx_learning_slot_user_day ON learning_slots(user_id, day_of_week);

ALTER TABLE learning_slots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own slots" ON learning_slots
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own slots" ON learning_slots
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own slots" ON learning_slots
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own slots" ON learning_slots
  FOR DELETE USING (user_id = auth.uid());
