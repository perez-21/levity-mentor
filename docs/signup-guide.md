# Sign-up Guide

Authentication is handled by [Clerk](https://clerk.com) using **magic links** (no passwords). Registration is **invitation-only**: each participant needs a unique token link created by an admin.

---

## Clerk dashboard setup

Before using the app, configure your Clerk application:

1. **Disable passwords** — User & Authentication → Email → turn off password sign-in; enable **Email verification link** (magic link).
2. **Restrict sign-ups** — User & Authentication → Restrictions → disable public sign-up (invitation-only). Users register only via `/accept-invite?token=…`.
3. **Webhook** — Developers → Webhooks → add endpoint `https://<your-domain>/api/webhooks/clerk`, subscribe to `user.created`, copy the signing secret into `CLERK_WEBHOOK_SECRET`.
4. **Allowed redirect URLs** — Add:
   - `http://localhost:3000/login/verify`
   - `http://localhost:3000/accept-invite/verify`
   - Your production URLs for the same paths

---

## Admin setup

Admins are not created through the invite flow. Set up the first admin manually:

### Step 1 — Create your Clerk user

1. In the Clerk dashboard, go to **Users → Create user**
2. Add your email and create the user
3. Sign in once via `/login` using the magic link sent to your email

### Step 2 — Add a profile with admin role

1. Copy your Clerk user ID (format `user_…`) from the Clerk dashboard
2. In Supabase **Table Editor → profiles**, insert or update a row:
   - `id` = your Clerk user ID
   - `email` = your email
   - `role` = `admin`
   - `full_name` = your name (optional)

### Step 3 — Sign in as admin

Go to `/login`, enter your email, click the magic link in your inbox. You will be redirected to `/admin`.

---

## Participant sign-up

Participants cannot self-register. An admin must create an invitation.

### How an admin invites a participant

1. Log in as admin and go to **Invite Participant** (`/admin/invite`)
2. Fill in email (required), full name, and business name (optional)
3. Click **Create invitation**
4. Copy the invitation link shown and send it to the participant (email, WhatsApp, etc.)

Invitations expire after **7 days** and are **single-use**.

### What the participant does

1. Open the invitation link (`/accept-invite?token=…`)
2. Confirm their email and optionally describe their business
3. Click **Email me an activation link**
4. Click the magic link in their inbox
5. After verification, they land on their dashboard

### Returning users

Participants sign in at `/login` with their email only. A magic link is sent if their email exists in `profiles`.

---

## Database: invitations table

| Column | Description |
|--------|-------------|
| `token` | Cryptographically secure one-time token (in the invite URL) |
| `email` | Invitee email (must match Clerk sign-up) |
| `expires_at` | Expiration timestamp |
| `is_used` | Whether the invitation has been consumed |
| `used_by` | Clerk user ID after redemption |

Run `supabase/migrations/002_clerk_invitations.sql` in the Supabase SQL editor if you have not already.

---

## Troubleshooting

**Magic link never arrives**  
Check spam. Verify Clerk email settings and that your domain is allowed.

**“Invalid invitation”**  
The token expired or was already used. Create a new invitation from `/admin/invite`.

**“No account found for this email” on login**  
The user has not completed invite activation, or no `profiles` row exists for that email.

**Admin sees participant dashboard**  
Set `role` to `admin` on their `profiles` row in Supabase.

**Webhook errors**  
Ensure `CLERK_WEBHOOK_SECRET` matches the Clerk webhook signing secret and the endpoint is publicly reachable.
