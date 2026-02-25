-- Scheduled blocks table + unique constraint + RLS + indexes

CREATE TABLE scheduled_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content_id UUID NOT NULL REFERENCES saved_content(id) ON DELETE CASCADE,
  slot_id UUID REFERENCES learning_slots(id) ON DELETE SET NULL,
  scheduled_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status block_status NOT NULL DEFAULT 'UPCOMING',
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (slot_id, scheduled_date)
);

CREATE TRIGGER scheduled_blocks_updated_at
  BEFORE UPDATE ON scheduled_blocks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_scheduled_block_user_date ON scheduled_blocks(user_id, scheduled_date);
CREATE INDEX idx_scheduled_block_user_status ON scheduled_blocks(user_id, status);
CREATE INDEX idx_scheduled_block_content ON scheduled_blocks(content_id);

ALTER TABLE scheduled_blocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own blocks" ON scheduled_blocks
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own blocks" ON scheduled_blocks
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own blocks" ON scheduled_blocks
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own blocks" ON scheduled_blocks
  FOR DELETE USING (user_id = auth.uid());
