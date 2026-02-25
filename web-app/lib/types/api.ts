import type {
  ContentFormat,
  SourcePlatform,
  SavedContent,
  Category,
  LearningSlot,
  ScheduledBlock,
  AISummary,
  WeeklyGoalProgress,
} from "./database";

// ── Content ──

export interface SaveContentRequest {
  url: string;
  categoryIds?: string[];
}

export interface SaveContentResponse {
  content: SavedContent;
  suggestedCategory?: { name: string; confidence: number };
}

export interface ContentMetadata {
  title: string;
  description: string | null;
  thumbnailUrl: string | null;
  sourcePlatform: SourcePlatform;
  contentFormat: ContentFormat;
  estimatedDurationMinutes: number;
}

// ── AI ──

export interface CategorySuggestion {
  categoryName: string;
  confidence: number;
  reasoning: string;
}

export interface ContentSummary {
  summaryText: string;
  keyTakeaways: string[];
  suggestedTopics: string[];
}

// ── Schedule ──

export interface WeeklySchedule {
  weekStartDate: string;
  blocks: (ScheduledBlock & {
    content: SavedContent;
    slot: LearningSlot | null;
    categories: Category[];
  })[];
  goalProgress: (WeeklyGoalProgress & { category: Category })[];
}

export interface TodaySchedule {
  date: string;
  blocks: (ScheduledBlock & {
    content: SavedContent;
    categories: Category[];
  })[];
}

// ── Billing ──

export interface CheckoutRequest {
  priceId: string;
  successUrl: string;
  cancelUrl: string;
}

export interface PlanInfo {
  plan: "FREE" | "PRO";
  cancelAtPeriodEnd: boolean;
  currentPeriodEnd: string | null;
}

// ── Generic API response ──

export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
}
