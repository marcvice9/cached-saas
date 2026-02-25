# One-Shot Backend Implementation Log

## Overview
Full backend implementation for Cached SaaS completed in a single session. ~50 TypeScript/SQL files created across 8 phases, building on the existing Next.js 15 landing page.

## What Was Built

| Phase | Files | Description |
|-------|-------|-------------|
| **0: Foundation** | 8 files | Dependencies, TS types, Zod validators, constants, rate limiter |
| **1: Database** | 11 SQL | All 9 tables + enums, RLS policies, indexes, triggers (`supabase/migrations/`) |
| **2: Auth** | 6 files | Supabase browser/server clients, middleware, Google OAuth routes |
| **3: Ingestion** | 8 files | URL sanitizer (SSRF protection), OG parser, YouTube/Spotify/Twitter/article parsers, ingestion router, save API + server actions |
| **4: AI** | 7 files | Provider factory (Groq default), prompts, category suggest, summary generate, API routes, server actions |
| **5: Scheduling** | 5 files | Category/slot CRUD, week utilities, core greedy scheduling engine, cron route |
| **6: Email** | 5 files | Resend client, ICS generator, weekly digest HTML template, send orchestrator |
| **7: Payments** | 7 files | Stripe client/config, checkout/portal/webhook routes, billing actions, plan gate |
| **8: Config** | 2 modified | `next.config.ts` (image patterns, serverExternalPackages), `package.json` (deps) |

## Dependencies Added
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

## API Routes
- `POST /api/content/save` — save URL with metadata extraction
- `POST /api/ai/suggest-category` — AI category suggestion
- `POST /api/ai/generate-summary` — AI summary (PRO only)
- `GET /api/cron/generate-schedules` — weekly cron job
- `POST /api/stripe/checkout` — create checkout session
- `POST /api/stripe/portal` — create billing portal
- `POST /api/stripe/webhook` — handle Stripe events
- `GET /auth/login` — initiate Google OAuth
- `GET /auth/callback` — OAuth code exchange
- `GET /auth/logout` — sign out

## Server Actions (`lib/actions/`)
- `content.ts` — list, get, updateStatus, delete
- `categories.ts` — list, create (with free tier limit), update, delete
- `slots.ts` — list, create (with overlap validation), update, delete
- `schedule.ts` — generateSchedule, getWeekly, getToday, completeBlock, skipBlock
- `ai.ts` — getSummaryForContent, searchVault, updateSummaryNotes, listVaultSummaries
- `billing.ts` — getPlanInfo, checkFeatureAccess
- `email.ts` — sendScheduleDigest

## Database Schema (11 migrations)
1. Enums (plan, format, platform, status, etc.)
2. `users` + RLS + `updated_at` trigger function
3. `categories` + RLS + indexes
4. `saved_content` + RLS + indexes
5. `content_categories` (join table) + RLS via subquery
6. `learning_slots` + RLS + time range constraint
7. `scheduled_blocks` + unique(slot_id, scheduled_date) + RLS
8. `weekly_goal_progress` + unique(user, category, week) + RLS
9. `ai_summaries` + tsvector + GIN index + auto-trigger
10. `subscriptions` + RLS
11. Auth trigger: auto-insert `users` row on signup

## Key Architecture Decisions
- **Server/Client split**: Server Actions for mutations, API Routes for external integrations (Stripe webhooks, cron)
- **RLS everywhere**: All tables use Row-Level Security with `auth.uid()` policies
- **AI provider-agnostic**: Groq (free tier) default, swappable via `AI_PROVIDER` env var
- **Rate limiting**: In-memory, per-user, daily reset (content saves: 100/day, AI summaries: 50/day)
- **Scheduling engine**: Greedy single-pass slot-filling, idempotent (deletes UPCOMING blocks before re-generating)
- **Email**: One-way delivery via Resend + .ics attachments (no calendar API OAuth needed)
- **Stripe webhook**: Uses `Record<string, unknown>` casting for subscription period fields due to Stripe SDK 2026 API version type changes

## Build Verification
`npm run build` passes with zero errors. All routes compile and render correctly.

## Gotcha: Stripe SDK Types
The Stripe npm package (2026 API version `2026-01-28.clover`) removed `current_period_start`/`current_period_end` from the `Subscription` TypeScript type, though these fields still exist at runtime. The webhook handler uses `Record<string, unknown>` casting with safe accessors to handle this.
