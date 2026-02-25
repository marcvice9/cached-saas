# Cached SaaS — Dashboard Pages

## Overview
Frontend dashboard for logged-in users under `/app/*`. All routes are protected by Supabase auth middleware (unauthenticated users redirect to `/auth/login`).

## Structure

```
web-app/
├── app/app/
│   ├── layout.tsx              # Dashboard shell (sidebar + content area)
│   ├── page.tsx                # Content queue (save URLs, manage queue)
│   ├── categories/
│   │   └── page.tsx            # Category management
│   ├── slots/
│   │   └── page.tsx            # Learning slot configuration
│   ├── schedule/
│   │   └── page.tsx            # Weekly schedule view
│   ├── vault/
│   │   └── page.tsx            # AI learning vault (Pro feature)
│   └── billing/
│       └── page.tsx            # Subscription & plan management
│
├── components/app/
│   ├── Sidebar.tsx             # Fixed dark sidebar with nav links
│   ├── SaveUrlForm.tsx         # URL input + category selector
│   ├── ContentList.tsx         # Filterable content list with actions
│   ├── CategoryManager.tsx     # CRUD form + category cards
│   ├── SlotManager.tsx         # Learning slot CRUD grouped by day
│   ├── ScheduleView.tsx        # Week navigation + block grid
│   ├── VaultExplorer.tsx       # Search + expandable summary cards
│   └── BillingPanel.tsx        # Plan comparison + Stripe integration
```

## Pages

### `/app` — Content Queue
- **Server component:** Fetches content via `listContent()` and categories via `listCategories()`
- **SaveUrlForm:** Client component that POSTs to `/api/content/save`, shows category pills for tagging
- **ContentList:** Client component with status tabs (All/Queued/Scheduled/Consumed/Archived), thumbnail display, status badge, and actions (Mark Done, Archive, Re-queue, Delete)
- Calls server actions: `updateContentStatus()`, `deleteContent()`

### `/app/categories` — Category Management
- **Server component:** Fetches categories (including inactive) and plan info
- **CategoryManager:** Inline create/edit form with fields: name, goal description, weekly time budget, priority
- Enforces plan limits (`FEATURE_GATES[plan].maxCategories`) — shows upgrade prompt for Free users at limit
- Active/Inactive toggle per category
- Calls server actions: `createCategory()`, `updateCategory()`, `deleteCategory()`

### `/app/slots` — Learning Slots
- **Server component:** Fetches slots and categories
- **SlotManager:** Create/edit form with day-of-week selector, time pickers, label, format filter pills, preferred category dropdown
- Slots displayed grouped by day of week, sorted by start time
- Active/Inactive toggle per slot
- Calls server actions: `createSlot()`, `updateSlot()`, `deleteSlot()`

### `/app/schedule` — Weekly Schedule
- **Server component:** Resolves current week start from user's `week_start_day` preference or `?week=` query param, fetches blocks via `getWeeklySchedule()`
- **ScheduleView:** Week navigation (prev/next), "Generate Schedule" button, blocks grouped by date across all 7 days
- Each block shows time range, status badge, content title/link, format, and duration
- UPCOMING blocks have "Done" and "Skip" actions
- Week summary card with total/completed/remaining counts
- Calls server actions: `generateSchedule()`, `completeBlock()`, `skipBlock()`

### `/app/vault` — Learning Vault (Pro)
- **Server component:** Checks `aiSummaries` feature access, fetches summaries only if Pro
- **VaultExplorer:** Full-text search bar that calls `searchVault()`, expandable summary cards showing summary text, key takeaways, suggested topics
- Inline note editing with `updateSummaryNotes()`
- Free users see an upgrade prompt linking to `/app/billing`

### `/app/billing` — Billing & Subscription
- **Server component:** Fetches plan info via `getPlanInfo()`
- **BillingPanel:** Current plan banner with renewal/cancellation date, side-by-side Free vs Pro feature comparison
- "Upgrade to Pro" button → POST `/api/stripe/checkout` → Stripe Checkout redirect
- "Manage Subscription" button (Pro users) → POST `/api/stripe/portal` → Stripe Customer Portal redirect

## Layout (`app/app/layout.tsx`)
- Server component that fetches user name/email from Supabase
- Renders `<Sidebar>` (fixed left, 240px wide, `bg-brand-dark`) + scrollable `<main>` content area
- Sidebar shows: brand logo, nav links with active state highlighting, user name, "Back to site" link, logout link

## Architecture Patterns
- **Server/Client split:** Page files are async server components that fetch data; interactive parts are `"use client"` components receiving data as props
- **Optimistic updates:** All mutations use `useTransition` + `router.refresh()` for seamless updates
- **Form state:** Local React state with inline validation; Zod schemas used server-side in actions
- **Plan gating:** Category limits checked in `createCategory()` action; vault access checked in page server component
- **Styling:** Tailwind CSS with brand tokens (`brand-dark`, `brand-orange`, `brand-teal`, `brand-bg`), consistent rounded-xl cards with shadow-sm

## Wiring Summary

| UI Action | Client Call | Backend |
|---|---|---|
| Save URL | `fetch("/api/content/save")` | API route → `extractMetadata()` → Supabase insert |
| Update content status | `updateContentStatus()` | Server action → Supabase update |
| Delete content | `deleteContent()` | Server action → Supabase delete |
| CRUD categories | `createCategory()` / `updateCategory()` / `deleteCategory()` | Server actions with plan-limit checks |
| CRUD slots | `createSlot()` / `updateSlot()` / `deleteSlot()` | Server actions with overlap validation |
| Generate schedule | `generateSchedule()` | Server action → `generateScheduleForUser()` engine |
| Complete/Skip block | `completeBlock()` / `skipBlock()` | Server actions → update block + content status + goal progress |
| Search vault | `searchVault()` | Server action → PostgreSQL full-text search |
| Update notes | `updateSummaryNotes()` | Server action → Supabase update |
| Upgrade to Pro | `fetch("/api/stripe/checkout")` | API route → Stripe Checkout session |
| Manage subscription | `fetch("/api/stripe/portal")` | API route → Stripe Customer Portal |

## Commands
```bash
cd web-app
npm run dev    # Start dev server
npm run build  # Production build
npm run start  # Start production server
```
