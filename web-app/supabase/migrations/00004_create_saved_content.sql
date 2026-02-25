-- Saved content table + RLS + indexes

CREATE TABLE saved_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  source_platform source_platform NOT NULL DEFAULT 'OTHER',
  content_format content_format NOT NULL,
  estimated_duration_minutes INTEGER NOT NULL DEFAULT 0,
  status content_status NOT NULL DEFAULT 'QUEUED',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER saved_content_updated_at
  BEFORE UPDATE ON saved_content
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_saved_content_user_status ON saved_content(user_id, status);
CREATE INDEX idx_saved_content_user_created ON saved_content(user_id, created_at);

ALTER TABLE saved_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own content" ON saved_content
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own content" ON saved_content
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own content" ON saved_content
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own content" ON saved_content
  FOR DELETE USING (user_id = auth.uid());
