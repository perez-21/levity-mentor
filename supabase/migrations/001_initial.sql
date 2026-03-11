-- ============================================================
-- Levity AI Mentor — Initial Schema
-- ============================================================

-- Profiles (extends auth.users)
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  role text not null check (role in ('participant', 'admin')),
  full_name text,
  business_name text,
  business_description text,
  initial_capital numeric not null default 500000,
  created_at timestamptz not null default now()
);

-- Revenue entries
create table if not exists revenue_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  amount numeric not null check (amount > 0),
  description text,
  date date not null,
  created_at timestamptz not null default now()
);

-- Expense entries
create table if not exists expense_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  amount numeric not null check (amount > 0),
  category text,
  description text,
  date date not null,
  created_at timestamptz not null default now()
);

-- Chat messages
create table if not exists chat_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamptz not null default now()
);

-- ============================================================
-- Row Level Security
-- ============================================================

alter table profiles enable row level security;
alter table revenue_entries enable row level security;
alter table expense_entries enable row level security;
alter table chat_messages enable row level security;

-- Profiles: users can only see/edit their own row
create policy "profiles_select_own" on profiles
  for select using (auth.uid() = id);

create policy "profiles_update_own" on profiles
  for update using (auth.uid() = id);

-- Revenue: own rows only
create policy "revenue_select_own" on revenue_entries
  for select using (auth.uid() = user_id);

create policy "revenue_insert_own" on revenue_entries
  for insert with check (auth.uid() = user_id);

create policy "revenue_delete_own" on revenue_entries
  for delete using (auth.uid() = user_id);

-- Expenses: own rows only
create policy "expense_select_own" on expense_entries
  for select using (auth.uid() = user_id);

create policy "expense_insert_own" on expense_entries
  for insert with check (auth.uid() = user_id);

create policy "expense_delete_own" on expense_entries
  for delete using (auth.uid() = user_id);

-- Chat messages: own rows only
create policy "chat_select_own" on chat_messages
  for select using (auth.uid() = user_id);

create policy "chat_insert_own" on chat_messages
  for insert with check (auth.uid() = user_id);

-- ============================================================
-- Trigger: auto-insert profile on new user signup
-- ============================================================
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into profiles (id, role, full_name, business_name, business_description)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'role', 'participant'),
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'business_name', ''),
    coalesce(new.raw_user_meta_data->>'business_description', '')
  );
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();
