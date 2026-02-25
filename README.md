# Cached
### From saved to scheduled. From intention to action.

Cached is a content execution system for people who save great content but rarely make time to consume it.

## Value Proposition
Most tools help you collect content. Cached helps you finish it.

Cached turns a messy backlog of links into scheduled, realistic learning blocks on your calendar, aligned to your goals and available time.

## Who This Is For
Cached is built for people who are ambitious, curious, and time-constrained:

- Founders, engineers, consultants, and operators
- Professionals learning new skills while working full-time
- Career switchers building focused learning plans
- Lifelong learners who save more than they consume

If you regularly save videos, articles, threads, podcasts, and newsletters "for later" but never get to them, this is for you.

## Problem It Solves
Knowledge workers usually face three recurring problems:

1. Fragmentation: saved content is scattered across many apps and platforms.
2. Backlog overload: saved items pile up with no priority or time commitment.
3. Execution gap: intention exists, but nothing is mapped to real calendar time.

Result: useful content becomes digital guilt instead of progress.

## How Cached Solves It
Cached adds an execution layer between "saved" and "done."

1. Centralize content
- Save links from YouTube, X, LinkedIn, Spotify, podcasts, GitHub, articles, and newsletters.

2. Attach intent
- Organize items by category and goal, like "system design" or "improve Spanish."

3. Model real availability
- Define actual learning windows based on your week, routines, and constraints.

4. Auto-schedule intelligently
- Place the right content into the right time block based on duration, format, and priorities.

5. Keep what matters
- Generate summaries, store notes, and build a searchable learning vault over time.

## Core Experience
- Dashboard: today’s schedule, weekly progress, and time invested.
- Calendar: flexible blocks, skip/reschedule, and adaptive rebalancing.
- Learning Vault: categorized summaries and editable notes.

## Feature Breakdown
### 1) Capture Layer (Save From Anywhere)
- Save any URL into one unified inbox.
- Auto-detect content type: video, article, podcast, thread, repository, newsletter.
- Extract metadata automatically: title, source, estimated duration/reading time, thumbnail.
- Keep all saved content searchable in one place.

### 2) Intent Layer (Goal-Driven Organization)
- Create learning categories (for example: AI, system design, language learning, health).
- Assign each category a clear objective and priority.
- Tag saved content to one or more categories.
- Track progress by category instead of by random links.

### 3) Time Layer (Real-Life Availability Mapping)
- Define recurring learning windows across your week.
- Support different block types: deep work blocks, quick learning slots, commute/audio slots.
- Set constraints for each slot such as preferred format and max duration.
- Build a schedule that reflects your actual life, not idealized plans.

### 4) Scheduling Engine (From Backlog to Calendar)
- Match content length to available block size.
- Match format to context (audio for commute, long-form for focus windows).
- Prioritize categories that are behind weekly goals.
- Generate calendar-ready learning blocks automatically.
- Rebalance upcoming blocks when you skip or reschedule.

### 5) Execution Layer (Do the Work, Not Just Plan It)
- See a clear “what to consume now” view for today.
- Mark items complete, skipped, or postponed.
- Swap content inside a time block without breaking your weekly structure.
- Preserve momentum with streaks and progress visibility.

### 6) Learning Vault (Retention and Reuse)
- Generate AI summaries and key takeaways after consumption.
- Save manual notes and edits alongside generated summaries.
- Keep insights grouped by category for long-term compounding.
- Search past learnings quickly when you need to recall concepts.

### 7) Insights and Feedback Loop
- Track time spent by category and by week.
- Compare planned vs completed learning blocks.
- Identify which goals are progressing and which are slipping.
- Improve future scheduling decisions with usage patterns.

## End-to-End Workflow
1. Save content from any source.
2. Assign it to a goal/category.
3. Cached places it into your real available time.
4. You consume inside scheduled blocks.
5. Cached stores summaries and notes.
6. Progress and insights improve next week’s plan.

## Example Use Cases
- Engineer leveling up in system design while working full-time.
- Founder staying current on AI and product strategy with limited weekly bandwidth.
- Career switcher building a structured curriculum without creating a manual study plan.
- Creator managing research inputs from multiple channels without backlog chaos.

## Business Model
### Free
- Unlimited saves
- 2 active categories
- Basic scheduling

### Pro
- Unlimited categories
- Advanced scheduling logic
- AI summaries and learning vault
- Calendar sync
- Rebalancing and deeper insights

## Tech Stack
| Layer | Technology |
|---|---|
| Frontend | Next.js 15 (App Router, React 19) |
| Styling | Tailwind CSS |
| Backend | Next.js Server Components + Server Actions + Route Handlers |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth (GitHub OAuth) |
| Billing | Stripe |
| AI APIs | Vercel AI SDK + Groq (`llama-3.3-70b-versatile`) |
| Queue | Postgres-backed status queue (`saved_content.status`) + weekly scheduler job |
| Email | Resend |
| Deployment | Vercel |

## Architecture Notes
### Server Components
- Main app pages fetch data directly on the server (`app/app/page.tsx`, `app/app/schedule/page.tsx`, `app/app/vault/page.tsx`) using parallel reads from Supabase.
- This keeps auth-protected data loading on the server and sends hydrated UI props to client components.

### Server Actions
- Domain actions live in `web-app/lib/actions/*` and are used for authenticated reads/writes:
- Categories and slots CRUD (`categories.ts`, `slots.ts`)
- Content and vault operations (`content.ts`, `ai.ts`)
- Scheduling flows (`schedule.ts` with `generateSchedule`, `completeBlock`, `skipBlock`)
- Billing sync (`billing.ts`)

### Route Handlers
- Content ingestion: `POST /api/content/save`
- AI: `POST /api/ai/generate-summary`, `POST /api/ai/suggest-category`
- Billing: `POST /api/stripe/checkout`, `POST /api/stripe/portal`, `POST /api/stripe/webhook`
- Auth callbacks: `/auth/login`, `/auth/callback`, `/auth/logout`

### Scheduled Jobs
- `GET /api/cron/generate-schedules` generates next-week schedules for all users.
- Protected with `Authorization: Bearer ${CRON_SECRET}` and uses a Supabase service-role client.

## Data Model Gist
- `SavedItem` -> `saved_content`: captured URL + metadata (title, source, format, duration) + lifecycle status (`QUEUED`, `SCHEDULED`, `CONSUMED`, etc.).
- `Window` -> `learning_slots`: reusable weekly availability windows (day/time range, allowed formats, preferred category).
- `Schedule` -> `scheduled_blocks`: concrete dated assignments mapping content into a window with execution status (`UPCOMING`, `COMPLETED`, `SKIPPED`).
- `Summary` -> `ai_summaries`: generated summary text, key takeaways, suggested topics, and editable user notes with full-text search support.

## Positioning
Cached is not:
- A basic bookmark manager
- A generic to-do app
- A passive read-it-later list

Cached is:
- A personal learning orchestration system
- A bridge from intention to execution
- A way to make saved content actually compound
- A weekly operating system for continuous, intentional growth

## Vision
The future of learning is not more content. It is better orchestration.

Cached turns digital clutter into deliberate progress.
