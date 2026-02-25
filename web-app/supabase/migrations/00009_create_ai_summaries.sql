-- AI summaries table + tsvector + GIN index + auto-trigger

CREATE TABLE ai_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID NOT NULL REFERENCES saved_content(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  summary_text TEXT NOT NULL,
  key_takeaways JSONB NOT NULL DEFAULT '[]',
  suggested_topics JSONB,
  user_notes TEXT,
  search_vector TSVECTOR,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER ai_summaries_updated_at
  BEFORE UPDATE ON ai_summaries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-update search_vector on insert/update
CREATE OR REPLACE FUNCTION update_ai_summary_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.summary_text, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.user_notes, '')), 'B');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ai_summaries_search_vector
  BEFORE INSERT OR UPDATE ON ai_summaries
  FOR EACH ROW EXECUTE FUNCTION update_ai_summary_search_vector();

CREATE INDEX idx_ai_summary_user ON ai_summaries(user_id);
CREATE INDEX idx_ai_summary_content ON ai_summaries(content_id);
CREATE INDEX idx_ai_summary_search ON ai_summaries USING GIN(search_vector);

ALTER TABLE ai_summaries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own summaries" ON ai_summaries
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own summaries" ON ai_summaries
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own summaries" ON ai_summaries
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own summaries" ON ai_summaries
  FOR DELETE USING (user_id = auth.uid());
