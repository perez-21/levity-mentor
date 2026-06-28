-- ============================================================
-- Clerk auth + invitation tokens
-- Run after 001_initial.sql (or on a fresh project, update 001 separately)
-- ============================================================

-- Invitations: token-gated registration
create table if not exists invitations (
  id uuid primary key default gen_random_uuid(),
  token text not null unique,
  email text not null,
  full_name text,
  business_name text,
  business_description text,
  expires_at timestamptz not null,
  is_used boolean not null default false,
  used_by text,
  created_at timestamptz not null default now()
);

create index if not exists invitations_token_idx on invitations (token);
create index if not exists invitations_email_idx on invitations (email);

-- ============================================================
-- IMPORTANT: This project originally used Supabase Auth + RLS policies
-- tied to auth.uid(). Moving authentication to Clerk means:
-- - those policies no longer apply, and
-- - they must be dropped before altering id/user_id column types.
-- ============================================================

-- Drop old RLS policies that depend on UUID columns
drop policy if exists "profiles_select_own" on profiles;
drop policy if exists "profiles_update_own" on profiles;
drop policy if exists "revenue_select_own" on revenue_entries;
drop policy if exists "revenue_insert_own" on revenue_entries;
drop policy if exists "revenue_delete_own" on revenue_entries;
drop policy if exists "expense_select_own" on expense_entries;
drop policy if exists "expense_insert_own" on expense_entries;
drop policy if exists "expense_delete_own" on expense_entries;
drop policy if exists "chat_select_own" on chat_messages;
drop policy if exists "chat_insert_own" on chat_messages;

-- With Clerk auth, access control is enforced in Next.js (middleware + server routes),
-- and DB writes are performed server-side via service role.
alter table profiles disable row level security;
alter table revenue_entries disable row level security;
alter table expense_entries disable row level security;
alter table chat_messages disable row level security;

-- Child tables reference profiles(id). Drop those FKs before changing either side’s type,
-- or Postgres errors: incompatible types uuid vs text.
alter table revenue_entries drop constraint if exists revenue_entries_user_id_fkey;
alter table expense_entries drop constraint if exists expense_entries_user_id_fkey;
alter table chat_messages drop constraint if exists chat_messages_user_id_fkey;

-- Profiles: Clerk user IDs (text) instead of Supabase auth.users UUIDs
alter table profiles drop constraint if exists profiles_id_fkey;

alter table profiles alter column id type text using id::text;
alter table profiles add column if not exists email text;

alter table revenue_entries alter column user_id type text using user_id::text;
alter table expense_entries alter column user_id type text using user_id::text;
alter table chat_messages alter column user_id type text using user_id::text;

-- Restore referential integrity (both sides are text now)
alter table revenue_entries
  add constraint revenue_entries_user_id_fkey
  foreign key (user_id) references profiles(id) on delete cascade;

alter table expense_entries
  add constraint expense_entries_user_id_fkey
  foreign key (user_id) references profiles(id) on delete cascade;

alter table chat_messages
  add constraint chat_messages_user_id_fkey
  foreign key (user_id) references profiles(id) on delete cascade;

-- Remove Supabase Auth trigger (profiles are created via Clerk webhook)
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists handle_new_user();
