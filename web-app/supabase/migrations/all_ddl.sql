-- Full schema DDL (migrations 00001-00011) for Supabase
-- Safe to copy/paste into the SQL editor or run via psql.
-- Order matters; everything is already sequenced below.

-- 00001_create_enums.sql
CREATE TYPE plan_type AS ENUM ('FREE', 'PRO');
CREATE TYPE week_start_day AS ENUM ('SUNDAY', 'MONDAY');
CREATE TYPE content_format AS ENUM ('VIDEO', 'AUDIO', 'LONG_READ', 'SHORT_READ', 'CODE_REPO');
CREATE TYPE source_platform AS ENUM ('YOUTUBE', 'TWITTER', 'LINKEDIN', 'SPOTIFY', 'PODCAST', 'GITHUB', 'NEWSLETTER', 'ARTICLE', 'OTHER');
CREATE TYPE content_status AS ENUM ('QUEUED', 'SCHEDULED', 'CONSUMED', 'SKIPPED', 'ARCHIVED');
CREATE TYPE block_status AS ENUM ('UPCOMING', 'COMPLETED', 'SKIPPED');
CREATE TYPE day_of_week AS ENUM ('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY');
CREATE TYPE subscription_status AS ENUM ('ACTIVE', 'PAST_DUE', 'CANCELED', 'TRIALING');

-- 00002_create_users.sql
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

-- 00003_create_categories.sql
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

-- 00004_create_saved_content.sql
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

-- 00005_create_content_categories.sql
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

-- 00006_create_learning_slots.sql
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

-- 00007_create_scheduled_blocks.sql
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

-- 00008_create_weekly_goal_progress.sql
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

-- 00009_create_ai_summaries.sql
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

-- 00010_create_subscriptions.sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  stripe_subscription_id TEXT NOT NULL UNIQUE,
  status subscription_status NOT NULL DEFAULT 'ACTIVE',
  current_period_start TIMESTAMPTZ NOT NULL,
  current_period_end TIMESTAMPTZ NOT NULL,
  cancel_at_period_end BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_subscription_user ON subscriptions(user_id);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscription" ON subscriptions
  FOR SELECT USING (user_id = auth.uid());

-- 00011_auth_trigger.sql
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
