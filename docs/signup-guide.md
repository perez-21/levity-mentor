# Sign-up Guide

This guide covers how to create the first admin account and how to invite participants into the platform.

---

## Admin Sign-up

Admins are not created through the app — they are set up directly in the Supabase dashboard. This is intentional: admin access is sensitive and should only be granted manually.

### Step 1 — Invite yourself via Supabase Auth

1. Open your Supabase project dashboard
2. Go to **Authentication → Users**
3. Click **Invite user**
4. Enter your email address and click **Send invite**

### Step 2 — Set your password

You will receive an invite email. Click the link inside it — it takes you to the `/accept-invite` page on the platform (the same page participants use). Enter a password and click **Activate account**.

> If the link doesn't work, check that `<your-domain>/accept-invite` is listed under **Authentication → URL Configuration → Redirect URLs** in Supabase.

After activating, you'll be redirected to `/dashboard`. That's expected — your role is still `participant` at this point.

### Step 3 — Upgrade your role to admin

1. In the Supabase dashboard, go to **Table Editor → profiles**
2. Find your row (you can cross-reference your email in **Authentication → Users**)
3. Click the row to edit it
4. Change the `role` field from `participant` to `admin`
5. Save

### Step 4 — Log in as admin

Go to `/login`, enter your email and the password you set in Step 2. You'll be redirected to `/admin` automatically.

---

## Participant Sign-up

Participants cannot self-register. They must be invited by an admin. This keeps the cohort controlled and ties each account to the program.

### How an admin invites a participant

1. Log in as admin and go to **Invite Participant** in the top navigation (or visit `/admin/invite`)
2. Fill in:
   - **Email address** (required) — the participant's email
   - **Full name** (optional) — pre-fills their profile
   - **Business name** (optional) — pre-fills their profile
3. Click **Send invite**

The participant receives an email from Supabase with a link to set up their account.

> The invite link expires after 24 hours by default. If a participant misses it, send a new invite from the same form.

### What the participant does

1. Click the link in the invite email
2. They arrive at `/accept-invite` on the platform
3. They set a password (minimum 8 characters)
4. Optionally, they describe their business idea — this is shared with the AI mentor to make advice more relevant
5. Click **Activate account** — they're taken straight to their dashboard

### After sign-up

Once a participant is active they can:

- **Dashboard** — see their financial summary and charts
- **AI Mentor** (`/chat`) — ask questions; the AI knows their business description and financial data
- **Finances** (`/finances`) — log revenue and expenses, and update their business profile at any time

---

## Troubleshooting

**Invite email didn't arrive**
Check the spam folder. If using a custom domain for email, verify DNS records in Supabase → **Project Settings → Auth → SMTP**.

**Invite link says "invalid or expired"**
The link has a 24-hour expiry. Re-send the invite from `/admin/invite`.

**Participant lands on the wrong page after accepting invite**
Make sure `<your-domain>/accept-invite` is in the Supabase **Redirect URLs** allow-list under **Authentication → URL Configuration**.

**Admin sees participant dashboard instead of admin dashboard**
The `role` field in the `profiles` table is still set to `participant`. Follow Step 2 above to change it.
