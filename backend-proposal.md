# Backend Proposal: Cached — Intelligent Content Scheduling Engine

## 🎯 Objective
Build the backend for **Cached** — an intelligent content scheduling app that turns scattered saved links into structured, actionable time on your calendar. Implement URL ingestion & metadata extraction, AI-powered content analysis, a greedy scheduling algorithm driven by user-defined learning slots, and a learning vault — all backed by Supabase (PostgreSQL + RLS), the Vercel AI SDK (with Groq free tier as the default provider), Resend for email notifications, and Stripe for subscription billing.

---

## 🏗️ 1. Architecture Design

The architecture follows a modern, serverless-first pattern leveraging Next.js Server Actions and API Routes as the backend layer:

- **Content Ingestion Layer (API Routes):** Accepts URLs from any supported platform (YouTube, X, LinkedIn, Spotify, podcasts, articles, GitHub, newsletters). Extracts metadata (title, duration, format, thumbnail) using platform-specific parsers and open-graph fallbacks.
- **AI Processing Layer (Vercel AI SDK + Groq):** Uses the **Vercel AI SDK** as a provider-agnostic abstraction layer, with **Groq's free tier** (Llama 3 70B, ~30 req/min, no credit card required) as the default. The AI provider is swappable via a single environment variable (`AI_PROVIDER=groq|google|anthropic|openai`), so deployers with paid API keys can switch to Claude or OpenAI with no code changes. AI is invoked in **two phases**:
    - **Phase 1 — On URL save (1 AI call):** Auto-suggests a category and classifies content format from the extracted title + description. Returns structured JSON. Note: metadata extraction itself (title, duration, thumbnail) is handled by platform APIs and Open Graph parsing — no AI needed.
    - **Phase 2 — On content consumed (1 AI call):** Generates a summary, 3–5 key takeaways, and suggested follow-up topics. Only fires when the user marks content as done, spreading AI load over time.
- **Scheduling Engine (Server Actions):** A greedy, single-pass scheduling algorithm that fills user-defined learning slots from a priority queue of saved content, ordered by category deficit then save date.
- **Email & Calendar Reminders (Resend + .ics):** When the weekly schedule is generated, sends a digest email via Resend containing the week's learning plan with `.ics` calendar attachments. No OAuth or calendar API integration needed — `.ics` files are universally supported by Google Calendar, Apple Calendar, and Outlook.
- **Frontend (Next.js 15 + Tailwind + shadcn/ui):** App Router with server components for the dashboard, calendar view, and learning vault. Client components for drag-and-drop rescheduling and real-time interactions.
- **Database (Supabase — PostgreSQL + RLS):** Stores users, saved content, categories, goals, availability windows, scheduled blocks, AI-generated summaries, and subscription state. All data access goes through the **Supabase JS client**, with **Row-Level Security (RLS)** policies enforcing per-user data isolation at the database level.
- **Auth (Supabase Auth):** Google OAuth for frictionless sign-up and login. RLS policies reference `auth.uid()` to ensure users can only access their own data.
- **Payments (Stripe):** Subscription billing for Free vs Pro tiers. Webhooks to sync subscription state back to the database.
- **Deployment (Vercel):** Edge-optimized with serverless functions, a weekly cron job for schedule generation, and environment variable management.

---

## ✨ 2. Feature Design

### Core Features to Build:

1. **URL Ingestion & Metadata Extraction:**
   - Accept any URL via a save form, browser extension message, or share-target API.
   - Platform-specific parsers for YouTube (video duration via YouTube Data API), Spotify (episode duration via Spotify Web API), X/Twitter (thread length estimation), and generic articles (reading time via word count).
   - Open Graph / meta tag fallback for unsupported platforms.
   - Store normalized metadata: `title`, `description`, `thumbnailUrl`, `estimatedDurationMinutes`, `contentFormat` (VIDEO, AUDIO, LONG_READ, SHORT_READ, CODE_REPO).

2. **Category & Goal Management:**
   - Users create categories (e.g., "System Design", "Photography", "Spanish") with an associated goal description.
   - Each saved content item is tagged to one or more categories.
   - AI auto-suggests category based on content metadata (title + description analysis via Vercel AI SDK / Groq).
   - Weekly time budget per category (e.g., "I want to spend 3 hours/week on System Design").

3. **Learning Slots (User-Defined Availability):**
   - Users define **fixed recurring learning slots** in their weekly schedule (e.g., "Tue & Thu 10–11am: Deep Work", "Commute 8–8:30am: Audio only").
   - Each slot can have constraints: allowed content formats and an optional preferred category.
   - **No calendar import or free-slot detection.** The user explicitly chooses when they want to learn — the system fills those slots, not the other way around.
   - Slots are the foundation of the scheduling engine. The total weekly learning capacity equals the sum of all defined slots.

4. **Greedy Scheduling Engine:**
   The scheduling engine is a **single-pass, greedy slot-filling algorithm**. It runs in two situations: on a **weekly cron** (e.g., Sunday 8pm user-local time) and when the user manually clicks **"Reschedule my week"**.

   **Algorithm (pseudocode):**
   ```
   1. Get all user-defined learning slots for the upcoming week
   2. Get all QUEUED content, ordered by:
      - categoryDeficit DESC (weeklyBudget - minutesAlreadyScheduled)
      - savedAt ASC (older content first)
   3. For each slot (in chronological order):
      a. Find the first QUEUED item where:
         - contentFormat is in the slot's allowedFormats (if specified)
         - estimatedDuration ≤ slot duration
         - category ≠ last scheduled category (soft rule — skip if no alternative)
      b. If found → mark as SCHEDULED, assign to this slot
      c. If no match → slot stays empty (that's fine)
   4. Done.
   ```

   **Key design decisions:**
   - **Oversubscription:** If more content is queued than slots available, excess content stays `QUEUED` and naturally rolls to next week. No notification needed — the queue *is* the backlog.
   - **Window contention:** The category with the largest remaining budget deficit gets priority. Ties broken by the least-recently-scheduled category (natural variety).
   - **Skipped blocks:** Skipped content goes back to `QUEUED` status. The now-empty slot stays empty (past is past). The content re-enters the queue for next week's schedule. No real-time rebalancing.
   - **Back-to-back avoidance:** Soft preference only. If the only available content is from the same category as the previous slot, it still gets scheduled rather than leaving the slot empty.
   - **Idempotency:** Each schedule generation first deletes all `UPCOMING` blocks for the target week, then creates new ones in a single transaction. This prevents duplicates on re-runs.
   - **Triggers:** Weekly cron + manual "Reschedule" button. Two triggers total at MVP.

5. **Email Reminders with Calendar Invites (Resend + .ics):**
   When the weekly schedule is generated, send a **digest email** via Resend containing:
   - The full week's learning plan (content title, category, time slot, duration).
   - A **"Start Learning" link** for each item pointing to the content URL.
   - An **`.ics` file attachment** with all scheduled blocks as calendar events. The user opens the email, clicks the `.ics`, and their calendar app (Google, Apple, Outlook) adds the events automatically.

   ```
   BEGIN:VCALENDAR
   BEGIN:VEVENT
   DTSTART:20260224T100000Z
   DTEND:20260224T110000Z
   SUMMARY:📚 System Design: Designing Data-Intensive Apps
   DESCRIPTION:https://youtube.com/watch?v=xyz
   URL:https://youtube.com/watch?v=xyz
   END:VEVENT
   END:VCALENDAR
   ```

   **No OAuth, no calendar API, no token storage.** One-way delivery: system → user's inbox → user's calendar. Resend free tier (3,000 emails/month) is more than enough for MVP.

6. **AI Summaries & Learning Vault:**
   - After a user marks content as "consumed", trigger Vercel AI SDK (Groq) to generate:
     - 3–5 key takeaways.
     - A one-paragraph summary.
     - Suggested follow-up content or topics.
   - This is Phase 2 of the AI pipeline — a single structured call per consumed item, not on save.
   - Users can edit, annotate, and search their accumulated insights.
   - **Learning Vault** is searchable via full-text search (PostgreSQL `tsvector`).

7. **Dashboard & Analytics:**
   - Server-side computed queries powering the dashboard: today's schedule, weekly overview, category progress vs. goals, total time invested, learning streak (consecutive days with at least one completed block).
   - Analytics are computed on-the-fly via SQL aggregations over `ScheduledBlock` (filtered by `status = 'COMPLETED'`). No pre-aggregated analytics table at MVP — PostgreSQL handles this efficiently at the expected data volume.

8. **Authentication & Authorization:**
   - Supabase Auth with Google OAuth provider.
   - **Row-Level Security (RLS)** on all user-scoped tables. Every table with a `userId` column has an RLS policy: `USING (user_id = auth.uid())`.
   - All database access goes through the **Supabase JS client** (not a raw ORM), which automatically passes the user's JWT to the database, activating RLS.
   - Server Actions use `createServerClient` from `@supabase/ssr` to get the authenticated user's client.

9. **Payments & Subscription Management:**
   - Stripe Checkout for upgrading from Free to Pro.
   - Stripe Customer Portal for managing billing, cancellations, and refunds.
   - Stripe Webhooks (`checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`) to sync plan state into the database.
   - Feature gating: Free users limited to 2 active categories and basic scheduling; Pro unlocks unlimited categories, AI summaries, email reminders with .ics, and analytics.

10. **Security Features:**
    - All secret keys (Stripe, Supabase service role, Groq/AI provider API key, Resend) stored in environment variables, never exposed to the frontend.
    - API rate limiting on content save endpoints (max 100 saves/day per user) and AI summary endpoints (max 50 summaries/day per user) to prevent abuse.
    - Input sanitization on all URL inputs to prevent SSRF attacks during metadata fetching.
    - Content size limits on saved items (max 50,000 characters for extracted text content).
    - CORS configuration restricting API access to the deployed frontend domain.

---

## 🗄️ 3. Database Design

The database schema is managed via **Supabase** (PostgreSQL). All tables use **Row-Level Security (RLS)** for per-user data isolation. Database access is exclusively through the **Supabase JS client** — no separate ORM.

### `User` Table
Stores authenticated users and their subscription state.
- `id` (UUID, Primary Key — matches Supabase Auth UID)
- `email` (String, Unique)
- `name` (String)
- `avatarUrl` (String, Nullable)
- `stripeCustomerId` (String, Nullable)
- `plan` (Enum: `FREE`, `PRO`)
- `timezone` (String, default `"UTC"`)
- `weekStartDay` (Enum: `SUNDAY`, `MONDAY`, default `SUNDAY`) — when the weekly schedule cycle begins
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

**RLS:** `USING (id = auth.uid())`

### `Category` Table
User-defined content categories tied to personal goals.
- `id` (UUID, Primary Key)
- `userId` (FOREIGN KEY to `User`)
- `name` (String) — e.g., "System Design", "Photography"
- `goalDescription` (String, Nullable) — e.g., "Become proficient in distributed systems"
- `weeklyTimeBudgetMinutes` (Integer, Nullable) — e.g., 180
- `priority` (Integer, default 0) — higher = more important
- `isActive` (Boolean, default true)
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

**RLS:** `USING (user_id = auth.uid())`
**Indexes:**
- `idx_category_user_id` on `(userId)`
- `idx_category_user_active` on `(userId, isActive)` — for dashboard queries that filter inactive categories

### `SavedContent` Table
Stores all ingested URLs with extracted metadata.
- `id` (UUID, Primary Key)
- `userId` (FOREIGN KEY to `User`)
- `url` (String)
- `title` (String)
- `description` (String, Nullable)
- `thumbnailUrl` (String, Nullable)
- `sourcePlatform` (Enum: `YOUTUBE`, `TWITTER`, `LINKEDIN`, `SPOTIFY`, `PODCAST`, `GITHUB`, `NEWSLETTER`, `ARTICLE`, `OTHER`)
- `contentFormat` (Enum: `VIDEO`, `AUDIO`, `LONG_READ`, `SHORT_READ`, `CODE_REPO`)
- `estimatedDurationMinutes` (Integer)
- `status` (Enum: `QUEUED`, `SCHEDULED`, `CONSUMED`, `SKIPPED`, `ARCHIVED`)
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

**RLS:** `USING (user_id = auth.uid())`
**Indexes:**
- `idx_saved_content_user_status` on `(userId, status)` — core query for the scheduling engine (`WHERE status = 'QUEUED'`)
- `idx_saved_content_user_created` on `(userId, createdAt)` — for queue ordering

### `ContentCategory` Table (Join Table)
Maps saved content to one or more categories.
- `id` (UUID, Primary Key)
- `contentId` (FOREIGN KEY to `SavedContent`)
- `categoryId` (FOREIGN KEY to `Category`)
- `createdAt` (DateTime)

**RLS:** Via join to `SavedContent.userId`
**Indexes:**
- `idx_content_category_content` on `(contentId)` — lookup categories for a content item
- `idx_content_category_category` on `(categoryId)` — lookup content in a category
- `UNIQUE (contentId, categoryId)` — prevent duplicate tagging

### `LearningSlot` Table
Recurring weekly time slots where the user chooses to learn. These are user-defined and form the foundation of the scheduling engine.
- `id` (UUID, Primary Key)
- `userId` (FOREIGN KEY to `User`)
- `dayOfWeek` (Enum: `MONDAY`, `TUESDAY`, `WEDNESDAY`, `THURSDAY`, `FRIDAY`, `SATURDAY`, `SUNDAY`)
- `startTime` (Time) — e.g., "10:00"
- `endTime` (Time) — e.g., "11:00"
- `label` (String, Nullable) — e.g., "Deep Work Learning", "Commute"
- `allowedFormats` (JSON Array of Strings) — e.g., `["VIDEO", "AUDIO"]`. Stored as JSON for Supabase compatibility.
- `preferredCategoryId` (FOREIGN KEY to `Category`, Nullable)
- `isActive` (Boolean, default true)
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

**RLS:** `USING (user_id = auth.uid())`
**Indexes:**
- `idx_learning_slot_user_active` on `(userId, isActive)` — fetch all active slots for schedule generation
- `idx_learning_slot_user_day` on `(userId, dayOfWeek)` — filter slots by day

### `ScheduledBlock` Table
Concrete calendar entries created by the scheduling engine for a specific week.
- `id` (UUID, Primary Key)
- `userId` (FOREIGN KEY to `User`)
- `contentId` (FOREIGN KEY to `SavedContent`)
- `slotId` (FOREIGN KEY to `LearningSlot`, Nullable)
- `scheduledDate` (Date)
- `startTime` (Time)
- `endTime` (Time)
- `status` (Enum: `UPCOMING`, `COMPLETED`, `SKIPPED`)
- `completedAt` (DateTime, Nullable)
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

**RLS:** `USING (user_id = auth.uid())`
**Indexes:**
- `idx_scheduled_block_user_date` on `(userId, scheduledDate)` — today's schedule, weekly view
- `idx_scheduled_block_user_status` on `(userId, status)` — filter upcoming vs completed
- `idx_scheduled_block_content` on `(contentId)` — check if content is already scheduled
- `UNIQUE (slotId, scheduledDate)` — prevent double-booking a slot on the same date

### `WeeklyGoalProgress` Table
Tracks actual time spent per category per week, enabling the scheduling engine's deficit calculation and the dashboard's goal progress display.
- `id` (UUID, Primary Key)
- `userId` (FOREIGN KEY to `User`)
- `categoryId` (FOREIGN KEY to `Category`)
- `weekStartDate` (Date) — the Monday/Sunday that starts this tracking week
- `scheduledMinutes` (Integer, default 0) — total minutes scheduled this week for this category
- `completedMinutes` (Integer, default 0) — total minutes completed (blocks marked COMPLETED)
- `updatedAt` (DateTime)

**RLS:** `USING (user_id = auth.uid())`
**Indexes:**
- `UNIQUE (userId, categoryId, weekStartDate)` — one row per user per category per week
- `idx_weekly_goal_user_week` on `(userId, weekStartDate)` — fetch all category progress for a given week

### `AISummary` Table
AI-generated insights stored in the Learning Vault.
- `id` (UUID, Primary Key)
- `contentId` (FOREIGN KEY to `SavedContent`)
- `userId` (FOREIGN KEY to `User`)
- `summaryText` (Text) — one-paragraph summary
- `keyTakeaways` (JSON Array of Strings) — 3–5 bullet points
- `suggestedTopics` (JSON Array of Strings, Nullable)
- `userNotes` (Text, Nullable) — user-editable annotations
- `searchVector` (tsvector) — PostgreSQL full-text search index
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

**RLS:** `USING (user_id = auth.uid())`
**Indexes:**
- `idx_ai_summary_user` on `(userId)` — list all summaries for the Learning Vault
- `idx_ai_summary_content` on `(contentId)` — fetch summary for a specific content item
- `idx_ai_summary_search` GIN index on `(searchVector)` — full-text search in the Learning Vault

### `Subscription` Table
Tracks Stripe subscription state for billing management.
- `id` (UUID, Primary Key)
- `userId` (FOREIGN KEY to `User`)
- `stripeSubscriptionId` (String, Unique)
- `status` (Enum: `ACTIVE`, `PAST_DUE`, `CANCELED`, `TRIALING`)
- `currentPeriodStart` (DateTime)
- `currentPeriodEnd` (DateTime)
- `cancelAtPeriodEnd` (Boolean, default false)
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

**RLS:** `USING (user_id = auth.uid())`
**Indexes:**
- `idx_subscription_user` on `(userId)` — fetch user's subscription
- `idx_subscription_stripe_id` UNIQUE on `(stripeSubscriptionId)` — webhook lookups

---

## 🎓 Learning Outcomes

1. How to build a URL metadata extraction pipeline using platform APIs and Open Graph parsing.
2. How to use the Vercel AI SDK as a provider-agnostic abstraction layer, defaulting to Groq's free tier (Llama 3) for content classification and summarization — and how to swap providers via environment variables.
3. How to design a greedy scheduling algorithm that fills user-defined learning slots based on category deficit and content priority.
4. Database modeling with Supabase (PostgreSQL) — including RLS policies, JSON columns, indexes, full-text search (tsvector + GIN), and unique constraints.
5. How to implement Stripe subscription billing with webhooks for real-time state synchronization.
6. How to set up Supabase Auth with Google OAuth and enforce Row-Level Security (RLS) policies using the Supabase JS client.
7. How to generate `.ics` calendar files and deliver weekly schedule digests via Resend email.
8. How to design idempotent, transactional backend operations that prevent duplicate scheduling or double-billing.
9. How to build secure API routes with rate limiting, input sanitization, and proper environment variable management.
