# Cached Backend Implementation Plan

## Context
The Cached SaaS project currently has only a Next.js 15 landing page (Navbar, Hero, PainVsSolution). No backend code exists. This plan implements the entire backend described in `backend-proposal.md`: database schema, auth, URL ingestion, AI processing, scheduling engine, email delivery, and Stripe payments.

All backend code goes inside the existing `landing_page/` Next.js project using App Router patterns.

---

## Phase 0: Foundation (Dependencies, Types, Config)

**Install dependencies:**
```
@supabase/supabase-js @supabase/ssr    # Auth + DB
ai @ai-sdk/groq                         # Vercel AI SDK + Groq
stripe                                   # Payments
resend                                   # Email
zod                                      # Validation
ics                                      # .ics calendar generation
open-graph-scraper                       # OG metadata
cheerio                                  # HTML parsing for articles
```

**New files:**
- `.env.local.example` — all env vars documented
- `lib/types/database.ts` — TS types for all 9 tables + enums
- `lib/types/api.ts` — request/response types
- `lib/validators/content.ts`, `category.ts`, `slot.ts` — Zod schemas
- `lib/constants.ts` — rate limits, size limits, feature gates
- `lib/rate-limit.ts` — in-memory rate limiter

---

## Phase 1: Database (Supabase Migrations)

11 SQL migration files in `supabase/migrations/`:

| Migration | Table/Purpose |
|-----------|---------------|
| 00001 | Create all enum types (plan, format, platform, status, etc.) |
| 00002 | `users` + RLS + `updated_at` trigger function |
| 00003 | `categories` + RLS + indexes |
| 00004 | `saved_content` + RLS + indexes |
| 00005 | `content_categories` (join table) + RLS via subquery |
| 00006 | `learning_slots` + RLS + indexes |
| 00007 | `scheduled_blocks` + unique(slot_id, scheduled_date) + RLS |
| 00008 | `weekly_goal_progress` + unique(user, category, week) + RLS |
| 00009 | `ai_summaries` + tsvector + GIN index + auto-trigger |
| 00010 | `subscriptions` + RLS |
| 00011 | Auth trigger: auto-insert `users` row on signup |

**Verify:** `npx supabase db reset` applies cleanly.

---

## Phase 2: Auth (Supabase + Google OAuth)

**New files:**
- `lib/supabase/client.ts` — browser client
- `lib/supabase/server.ts` — server client (reads cookies, passes JWT for RLS)
- `lib/supabase/middleware.ts` — session refresh helper
- `middleware.ts` — Next.js middleware (refresh session, protect `/app/*` routes)
- `app/auth/callback/route.ts` — OAuth code exchange
- `app/auth/login/route.ts` — initiate Google OAuth
- `app/auth/logout/route.ts` — sign out

---

## Phase 3: URL Ingestion + Content Save

**New files:**
- `lib/ingestion/url-sanitizer.ts` — SSRF protection (block private IPs, localhost)
- `lib/ingestion/og-parser.ts` — generic Open Graph extractor
- `lib/ingestion/youtube.ts` — YouTube Data API parser (duration, thumbnail)
- `lib/ingestion/spotify.ts` — Spotify Web API parser
- `lib/ingestion/twitter.ts` — OG-based with reading time estimation
- `lib/ingestion/article.ts` — word count via cheerio, WPM calculation
- `lib/ingestion/index.ts` — router: URL → platform parser → normalized metadata
- `app/api/content/save/route.ts` — POST endpoint with rate limiting
- `lib/actions/content.ts` — Server Actions: save, update status, delete, list

---

## Phase 4: AI Processing

**New files:**
- `lib/ai/provider.ts` — factory: reads `AI_PROVIDER` env, returns SDK provider
- `lib/ai/prompts.ts` — prompt templates for category suggestion + summary
- `lib/ai/category-suggest.ts` — `suggestCategory()` using `generateObject`
- `lib/ai/summary-generate.ts` — `generateSummary()` using `generateObject`
- `app/api/ai/suggest-category/route.ts` — POST, rate-limited
- `app/api/ai/generate-summary/route.ts` — POST, rate-limited (50/day)
- `lib/actions/ai.ts` — Server Actions: suggest, generate+save, search vault, edit notes

---

## Phase 5: Categories, Slots, Scheduling Engine

**New files:**
- `lib/actions/categories.ts` — CRUD + free tier limit (2 categories)
- `lib/actions/slots.ts` — CRUD + overlap validation
- `lib/scheduling/week-utils.ts` — week date math, slot→datetime conversion
- `lib/scheduling/engine.ts` — **core algorithm:**
  1. Fetch active slots → expand to concrete dates for target week
  2. Delete existing UPCOMING blocks (idempotency)
  3. Fetch QUEUED content, sort by category deficit DESC then savedAt ASC
  4. For each slot: find matching content (format allowed, fits duration, soft variety)
  5. Create scheduled_blocks, update content status, update weekly_goal_progress
- `lib/actions/schedule.ts` — Server Actions: generate, getWeekly, getToday, complete, skip
- `app/api/cron/generate-schedules/route.ts` — Vercel Cron (service role, iterates users)

---

## Phase 6: Email (Resend + .ics)

**New files:**
- `lib/email/resend-client.ts` — Resend instance
- `lib/email/ics-generator.ts` — builds VCALENDAR with VEVENTs from scheduled blocks
- `lib/email/templates/weekly-digest.ts` — inline-styled HTML email template
- `lib/email/send-weekly-digest.ts` — orchestrates: fetch schedule → ICS → HTML → send
- `lib/actions/email.ts` — `sendScheduleDigest()` Server Action

---

## Phase 7: Payments (Stripe)

**New files:**
- `lib/stripe/client.ts` — Stripe SDK instance
- `lib/stripe/config.ts` — price IDs, feature gates per plan
- `app/api/stripe/checkout/route.ts` — create Checkout Session
- `app/api/stripe/portal/route.ts` — create Portal Session
- `app/api/stripe/webhook/route.ts` — handle `checkout.session.completed`, `subscription.updated`, `subscription.deleted`
- `lib/actions/billing.ts` — Server Actions: checkout, portal, getPlan, checkFeatureAccess
- `lib/guards/plan-gate.ts` — `requirePro()` guard for PRO-only features

---

## Files Modified (Existing)

- `package.json` — add all new dependencies
- `next.config.ts` — add `serverExternalPackages` if needed, image remote patterns for thumbnails

---

## File Count

- **11 SQL migrations**
- **~40 TypeScript files**
- **~2 modified existing files**

---

## Verification

After each phase:
1. **Phase 0-1:** `npm run build` passes, `npx supabase db reset` applies all migrations
2. **Phase 2:** OAuth flow works end-to-end, `users` row created on signup
3. **Phase 3:** `POST /api/content/save` with YouTube URL creates correct metadata row
4. **Phase 4:** Category suggestion returns plausible result; summary generates on consume
5. **Phase 5:** `generateSchedule()` fills slots correctly, idempotent on re-run
6. **Phase 6:** Digest email received with working .ics attachment
7. **Phase 7:** Stripe Checkout → webhook → plan=PRO; cancel → plan=FREE
8. **Final:** `npm run build` passes with zero errors
