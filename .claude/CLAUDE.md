# Cached SaaS

## Project Overview
**Cached** — "Turn Saved Content Into Scheduled Learning". An intelligent content scheduling app that turns scattered saved links (YouTube, X, LinkedIn, Spotify, podcasts, articles, GitHub, newsletters) into structured, actionable time on your calendar. Includes a landing page and a full-stack web app.

## Tech Stack
| Layer | Technology |
|---|---|
| Framework | Next.js 15.1.0 (App Router) |
| React | 19 |
| Styling | Tailwind CSS 3.4 + inline styles (no CSS modules) |
| Animation | Framer Motion 12.x |
| Fonts | Geist Sans + Switzer (custom) |
| Language | TypeScript 5 |
| Database | Supabase (PostgreSQL + RLS) |
| Auth | Supabase Auth (GitHub OAuth) |
| AI | Vercel AI SDK + Groq (free tier, swappable via `AI_PROVIDER` env var) |
| Payments | Stripe (subscription billing) |
| Email | Resend + .ics calendar attachments |
| Validation | Zod |
| Deployment | Vercel |

## Project Structure
```
web-app/
├── app/
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Landing page (/)
│   ├── v2/page.tsx             # Landing page v2
│   ├── globals.css
│   ├── auth/
│   │   ├── login/route.ts      # GitHub OAuth initiation
│   │   ├── callback/route.ts   # OAuth code exchange
│   │   └── logout/route.ts     # Sign out
│   ├── app/                    # Authenticated app (Sidebar layout)
│   │   ├── layout.tsx          # Dashboard layout + Sidebar
│   │   ├── page.tsx            # Dashboard (ContentList + SaveUrlForm)
│   │   ├── schedule/page.tsx   # Weekly schedule view
│   │   ├── categories/page.tsx # Category management
│   │   ├── slots/page.tsx      # Learning slot management
│   │   ├── vault/page.tsx      # AI summaries / Learning Vault
│   │   └── billing/page.tsx    # Stripe billing panel
│   └── api/
│       ├── content/save/route.ts
│       ├── ai/suggest-category/route.ts
│       ├── ai/generate-summary/route.ts
│       ├── cron/generate-schedules/route.ts
│       ├── stripe/checkout/route.ts
│       ├── stripe/portal/route.ts
│       └── stripe/webhook/route.ts
├── components/
│   ├── layout/
│   │   └── Navbar.tsx
│   ├── sections/               # Landing page sections
│   │   ├── Hero.tsx / HeroV2.tsx
│   │   ├── hero/               # Hero sub-components
│   │   ├── hero-v2/
│   │   └── PainVsSolution.tsx
│   └── app/                    # App UI components
│       ├── Sidebar.tsx
│       ├── SaveUrlForm.tsx
│       ├── ContentList.tsx
│       ├── CategoryManager.tsx
│       ├── SlotManager.tsx
│       ├── ScheduleView.tsx
│       ├── VaultExplorer.tsx
│       └── BillingPanel.tsx
├── lib/
│   ├── supabase/               # server.ts, client.ts, middleware.ts
│   ├── actions/                # Server Actions
│   │   ├── content.ts          # list, get, updateStatus, delete
│   │   ├── categories.ts       # CRUD (free tier: 2 category limit)
│   │   ├── slots.ts            # CRUD (overlap validation)
│   │   ├── schedule.ts         # generateSchedule, getWeekly, getToday, complete/skip
│   │   ├── ai.ts               # getSummary, searchVault, updateNotes, listVault
│   │   ├── billing.ts          # getPlanInfo, checkFeatureAccess
│   │   └── email.ts            # sendScheduleDigest
│   ├── ingestion/              # URL metadata extraction
│   │   ├── index.ts            # Router
│   │   ├── url-sanitizer.ts    # SSRF protection
│   │   ├── og-parser.ts        # Open Graph fallback
│   │   ├── youtube.ts / spotify.ts / twitter.ts / article.ts
│   ├── ai/                     # AI processing layer
│   │   ├── provider.ts         # Provider factory (Groq default)
│   │   ├── prompts.ts
│   │   ├── category-suggest.ts # Phase 1: on save
│   │   └── summary-generate.ts # Phase 2: on consume
│   ├── scheduling/
│   │   ├── engine.ts           # Greedy single-pass slot-filling algorithm
│   │   └── week-utils.ts
│   ├── email/
│   │   ├── resend-client.ts
│   │   ├── ics-generator.ts
│   │   ├── send-weekly-digest.ts
│   │   └── templates/weekly-digest.ts
│   ├── stripe/                 # client.ts, config.ts
│   ├── guards/plan-gate.ts     # Feature gating (Free vs Pro)
│   ├── validators/             # Zod schemas (content, category, slot)
│   ├── types/                  # database.ts, api.ts
│   ├── constants.ts
│   └── rate-limit.ts           # In-memory per-user daily rate limiter
├── supabase/migrations/        # 11 SQL migrations (enums, 9 tables, auth trigger)
├── tailwind.config.ts
├── next.config.ts
├── postcss.config.mjs
└── tsconfig.json
```

## Database (9 tables, all with RLS)
- `users` — profile + plan + timezone
- `categories` — user goals with weekly time budgets
- `saved_content` — ingested URLs with metadata (status: QUEUED → SCHEDULED → CONSUMED)
- `content_categories` — many-to-many join table
- `learning_slots` — recurring weekly availability windows
- `scheduled_blocks` — concrete calendar entries per week
- `weekly_goal_progress` — time tracking per category per week
- `ai_summaries` — Learning Vault (tsvector full-text search)
- `subscriptions` — Stripe subscription state

## Key Architecture Decisions
- **Server/Client split:** Server Actions for mutations, API Routes for external integrations (Stripe webhooks, cron)
- **RLS everywhere:** All tables enforce `auth.uid()` policies via Supabase JS client
- **AI provider-agnostic:** Groq free tier default, swappable via `AI_PROVIDER` env var (groq|google|anthropic|openai)
- **Two-phase AI:** Phase 1 on save (category suggest), Phase 2 on consume (summary)
- **Scheduling:** Greedy single-pass, idempotent (deletes UPCOMING blocks before regenerating)
- **Email:** One-way Resend + .ics (no calendar API OAuth needed)
- **Rate limiting:** In-memory, per-user, daily reset (saves: 100/day, summaries: FREE 50/day, PRO unlimited)
- **Styling:** Mix of Tailwind + inline styles; brand colors used directly in code

## Brand Colors (Dark + Electric Teal palette)
| Role | Token / Usage | Value |
|---|---|---|
| Page bg | `brand-bg` | `#09090B` |
| Surface/cards | `brand-surface` | `#18181B` |
| Card border | — | `rgba(255,255,255,0.06)` |
| Primary text | — | `#FAFAFA` |
| Secondary text | — | `#A1A1AA` |
| Muted text | — | `#71717A` |
| Accent (single) | `brand-teal` | `#06D6A0` |
| Accent muted | — | `rgba(6,214,160,0.15)` |
| CTA primary | — | bg `#06D6A0`, text `#09090B` |
| CTA secondary | `brand-gray` | bg `#27272A`, text `#FAFAFA` |
| Dark base | `brand-dark` | `#09090B` |

## Commands
```bash
cd web-app
npm run dev    # Start dev server
npm run build  # Production build
npm run start  # Start production server
```

## GitHub OAuth Setup
- **Provider:** GitHub (via Supabase Auth)
- **Login flow:** `/auth/login` → GitHub OAuth → Supabase callback → `/auth/callback` → `/app`
- **Auth routes:** `app/auth/login/route.ts`, `app/auth/callback/route.ts`, `app/auth/logout/route.ts`
- **Auth bypass:** `DISABLE_AUTH=true` in `.env.local` enables demo mode (service role client + fake user). Set to `false` for real OAuth.
- **Demo user ID:** `DEMO_USER_ID` env var (default `00000000-0000-0000-0000-000000000000`)
- **PKCE flow:** Login route stores `code_verifier` cookie → callback reads it for `exchangeCodeForSession`. Auth routes use `createServerClient` directly (not the `createClient()` helper which returns no-op cookies in demo mode).

### Supabase Dashboard Config
- **Authentication > Providers > GitHub:** enabled, Client ID/Secret configured in dashboard (must match GitHub OAuth App)
- **Authentication > URL Configuration > Redirect URLs:** must include `http://localhost:3000/auth/callback`
- **GitHub OAuth App callback URL:** `https://owiojrfgxdomgbnhiaqv.supabase.co/auth/v1/callback` (provided by Supabase)
- **GitHub OAuth App homepage URL:** `http://localhost:3000` (for local dev)

### Landing Page CTAs
- Navbar "Get Started" and Hero "Import Your Watch Later" → `/auth/login`
- Both v1 (`Hero`) and v2 (`HeroV2`) share `Navbar` and `HeroCopy` components, so CTA changes apply to both versions
- "See How It Works" → `/app` (middleware redirects to login if unauthenticated)

## Conventions
- Server component shells with `"use client"` animated sub-components
- Inline styles for pixel-precise layout; Tailwind for utility classes
- Framer Motion for entry/continuous animations
- No test framework or linter configured