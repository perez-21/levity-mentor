# Levity AI Mentor

A lightweight web platform that scales mentorship for the Levity entrepreneurship program. Participants receive ₦500,000 in seed capital and have 8 weeks to build a profitable business. This tool gives them a 24/7 AI mentor, financial tracking, and gives program admins full oversight — without adding human mentor capacity.

## Features

- **AI Mentor Chat** — Conversational mentor powered by Claude (Anthropic). Knows each participant's business profile and live financial data. Persists full conversation history.
- **Revenue & Expense Tracking** — Participants log income and spending. Dashboard shows totals, profit/loss, capital remaining, and time-series charts.
- **Admin Dashboard** — Admins see cohort-wide stats, a participant list with financial summaries, and can drill into any participant's finances and chat history.
- **Role-based access** — Participants only see their own data. Admins can see everything. Enforced via Supabase RLS and Next.js middleware.

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, TypeScript) |
| Database + Auth | Supabase (Postgres + email invite auth) |
| AI | Anthropic SDK (`claude-sonnet-4-6`) |
| UI | shadcn/ui + Tailwind CSS |
| Charts | Recharts |
| Deployment | Vercel |

## Getting Started

### 1. Clone and install

```bash
git clone <repo-url>
cd levity2
npm install
```

### 2. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Run the migration in the Supabase SQL editor — copy and paste the contents of `supabase/migrations/001_initial.sql`
3. In **Authentication → URL Configuration**, set your site URL and add `<your-domain>/accept-invite` to the redirect allow-list
4. In **Authentication → Email Templates → Invite**, update the confirmation URL to point to `<your-domain>/accept-invite`

### 3. Configure environment variables

Copy `.env.local.example` to `.env.local` and fill in your values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SECRET_KEY=your-service-role-key
ANTHROPIC_API_KEY=your-anthropic-api-key
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

All keys are found in your Supabase project under **Project Settings → API**. `SUPABASE_SECRET_KEY` is the service role key — it bypasses Row Level Security and is only used server-side.

### 4. Create the first admin and invite participants

See [docs/signup-guide.md](docs/signup-guide.md) for step-by-step instructions.

### 5. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). You'll be redirected to `/login`.

## Project Structure

```
app/
  (auth)/login/           # Login page
  (auth)/accept-invite/   # Invite acceptance + password setup
  (participant)/
    dashboard/            # Financial summary + charts
    chat/                 # AI mentor chat
    finances/             # Add revenue/expenses, edit business profile
  admin/
    page.tsx              # Cohort overview + participant list
    participants/[id]/    # Participant detail view
    invite/               # Invite a new participant
  api/
    chat/                 # Streaming Claude endpoint
    finances/revenue/     # Add revenue entry
    finances/expense/     # Add expense entry
    admin/invite/         # Send email invite via Supabase admin API

components/
  chat/ChatInterface.tsx
  finances/               # Forms, tables, charts, profile editor
  admin/                  # Chat log viewer

lib/
  supabase/client.ts      # Browser Supabase client
  supabase/server.ts      # Server Supabase client (SSR)
  supabase/admin.ts       # Service role client (admin ops only)
  claude.ts               # Anthropic client + system prompt builder

middleware.ts             # Route protection by role
supabase/migrations/      # Database schema + RLS policies
```

## Deployment

Push to GitHub and deploy on [Vercel](https://vercel.com). Add all five environment variables in **Vercel → Project Settings → Environment Variables**.

Make sure `NEXT_PUBLIC_SITE_URL` is set to your production domain so invite email links resolve correctly.
