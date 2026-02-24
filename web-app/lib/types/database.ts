// ── Enums ──

export type Plan = "FREE" | "PRO";

export type ContentFormat =
  | "VIDEO"
  | "AUDIO"
  | "LONG_READ"
  | "SHORT_READ"
  | "CODE_REPO";

export type SourcePlatform =
  | "YOUTUBE"
  | "TWITTER"
  | "LINKEDIN"
  | "SPOTIFY"
  | "PODCAST"
  | "GITHUB"
  | "NEWSLETTER"
  | "ARTICLE"
  | "OTHER";

export type ContentStatus =
  | "QUEUED"
  | "SCHEDULED"
  | "CONSUMED"
  | "SKIPPED"
  | "ARCHIVED";

export type BlockStatus = "UPCOMING" | "COMPLETED" | "SKIPPED";

export type DayOfWeek =
  | "MONDAY"
  | "TUESDAY"
  | "WEDNESDAY"
  | "THURSDAY"
  | "FRIDAY"
  | "SATURDAY"
  | "SUNDAY";

export type WeekStartDay = "SUNDAY" | "MONDAY";

export type SubscriptionStatus =
  | "ACTIVE"
  | "PAST_DUE"
  | "CANCELED"
  | "TRIALING";

// ── Table Row Types ──

export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url: string | null;
  stripe_customer_id: string | null;
  plan: Plan;
  timezone: string;
  week_start_day: WeekStartDay;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  user_id: string;
  name: string;
  goal_description: string | null;
  weekly_time_budget_minutes: number | null;
  priority: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SavedContent {
  id: string;
  user_id: string;
  url: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  source_platform: SourcePlatform;
  content_format: ContentFormat;
  estimated_duration_minutes: number;
  status: ContentStatus;
  created_at: string;
  updated_at: string;
}

export interface ContentCategory {
  id: string;
  content_id: string;
  category_id: string;
  created_at: string;
}

export interface LearningSlot {
  id: string;
  user_id: string;
  day_of_week: DayOfWeek;
  start_time: string;
  end_time: string;
  label: string | null;
  allowed_formats: ContentFormat[] | null;
  preferred_category_id: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ScheduledBlock {
  id: string;
  user_id: string;
  content_id: string;
  slot_id: string | null;
  scheduled_date: string;
  start_time: string;
  end_time: string;
  status: BlockStatus;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface WeeklyGoalProgress {
  id: string;
  user_id: string;
  category_id: string;
  week_start_date: string;
  scheduled_minutes: number;
  completed_minutes: number;
  updated_at: string;
}

export interface AISummary {
  id: string;
  content_id: string;
  user_id: string;
  summary_text: string;
  key_takeaways: string[];
  suggested_topics: string[] | null;
  user_notes: string | null;
  search_vector: unknown;
  created_at: string;
  updated_at: string;
}

export interface AISummaryWithContent extends AISummary {
  content: {
    id: string;
    title: string;
    url: string;
    status: ContentStatus;
    content_categories: {
      category: {
        id: string;
        name: string;
      } | null;
    }[];
  } | null;
}

export interface Subscription {
  id: string;
  user_id: string;
  stripe_subscription_id: string;
  status: SubscriptionStatus;
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
}
