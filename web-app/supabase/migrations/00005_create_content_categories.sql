-- Content-categories join table + RLS via subquery + indexes

CREATE TABLE content_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID NOT NULL REFERENCES saved_content(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (content_id, category_id)
);

CREATE INDEX idx_content_category_content ON content_categories(content_id);
CREATE INDEX idx_content_category_category ON content_categories(category_id);

ALTER TABLE content_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own content categories" ON content_categories
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM saved_content WHERE saved_content.id = content_categories.content_id AND saved_content.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own content categories" ON content_categories
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM saved_content WHERE saved_content.id = content_categories.content_id AND saved_content.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own content categories" ON content_categories
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM saved_content WHERE saved_content.id = content_categories.content_id AND saved_content.user_id = auth.uid()
    )
  );
