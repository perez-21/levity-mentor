# Levity AI Mentor

A lightweight web platform that scales mentorship for the Levity entrepreneurship program. Participants receive ₦500,000 in seed capital and have 8 weeks to build a profitable business. This tool gives them a 24/7 AI mentor, financial tracking, and gives program admins full oversight — without adding human mentor capacity.

## Features

- **AI Mentor Chat** — Conversational mentor powered by Claude (Anthropic). Knows each participant's business profile and live financial data. Persists full conversation history.
- **Revenue & Expense Tracking** — Participants log income and spending. Dashboard shows totals, profit/loss, capital remaining, and time-series charts.
- **Admin Dashboard** — Admins see cohort-wide stats, a participant list with financial summaries, and can drill into any participant's finances and chat history.
- **Role-based access** — Participants only see their own data. Admins can see everything. Enforced via Next.js middleware and server-side queries.
- **Invitation-only registration** — Cryptographic invite tokens; magic-link sign-in (no passwords) via Clerk.

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, TypeScript) |
| Auth | Clerk (magic links, invitation-gated sign-up) |
| Database | Supabase (Postgres) |
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

### 2. Set up Clerk

1. Create an application at [clerk.com](https://clerk.com)
2. Configure magic-link auth and restrict public sign-ups (see [docs/signup-guide.md](docs/signup-guide.md))
3. Add a webhook pointing to `/api/webhooks/clerk` for `user.created`

### 3. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Run migrations in the SQL editor: `001_initial.sql`, then `002_clerk_invitations.sql`

### 4. Configure environment variables

Copy `.env.local.example` to `.env.local` and fill in your values:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SECRET_KEY=your-service-role-key
ANTHROPIC_API_KEY=your-anthropic-api-key
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

Supabase keys are under **Project Settings → API**. `SUPABASE_SECRET_KEY` is the service role key (server-side only).

### 5. Create the first admin and invite participants

See [docs/signup-guide.md](docs/signup-guide.md) for step-by-step instructions.

### 6. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). You'll be redirected to `/login`.

## Project Structure

```
app/
  (auth)/login/           # Login page
  (auth)/accept-invite/   # Token-gated invite + magic-link activation
  (auth)/login/verify/    # Magic-link sign-in callback
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
    admin/invite/         # Create invitation token + link
    invitations/          # Validate and complete invitations
    webhooks/clerk/       # Create profile on user.created
    auth/                 # Email check + role redirect

components/
  chat/ChatInterface.tsx
  finances/               # Forms, tables, charts, profile editor
  admin/                  # Chat log viewer

lib/
  auth.ts                 # Clerk user + profile helpers
  invitations.ts          # Token generation and validation
  supabase/server.ts      # Server DB client (scoped by Clerk user)
  supabase/admin.ts       # Service role client (server only)
  claude.ts               # Anthropic client + system prompt builder

middleware.ts             # Clerk auth + route protection by role
supabase/migrations/      # Database schema + RLS policies
```

## Deployment

Push to GitHub and deploy on [Vercel](https://vercel.com). Add all environment variables from `.env.local.example` in **Vercel → Project Settings → Environment Variables**.

Set `NEXT_PUBLIC_SITE_URL` to your production domain so invitation links resolve correctly.
