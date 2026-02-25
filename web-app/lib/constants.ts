// Rate limits (per user per day)
export const RATE_LIMITS = {
  CONTENT_SAVE: 100,
  AI_SUMMARY_FREE: 50,
  AI_SUMMARY_PRO: Infinity,
  AI_CATEGORY_SUGGEST: 100,
} as const;

// Content limits
export const CONTENT_LIMITS = {
  MAX_TEXT_LENGTH: 50_000,
  MAX_URL_LENGTH: 2048,
  MAX_TITLE_LENGTH: 500,
  MAX_DESCRIPTION_LENGTH: 5000,
} as const;

// Feature gates per plan
export const FEATURE_GATES = {
  FREE: {
    maxCategories: 2,
    aiSummaries: true,
    emailDigest: false,
    analytics: false,
  },
  PRO: {
    maxCategories: Infinity,
    aiSummaries: true,
    emailDigest: true,
    analytics: true,
  },
} as const;

// Reading speed for article estimation
export const WORDS_PER_MINUTE = 238;

// Scheduling
export const SCHEDULE = {
  DEFAULT_CRON_DAY: 0, // Sunday
  DEFAULT_CRON_HOUR: 20, // 8pm
} as const;
