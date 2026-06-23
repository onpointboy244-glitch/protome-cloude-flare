-- ============================================
-- protome — Supabase Schema
-- Run this in Supabase SQL Editor
-- ============================================

-- Drop existing tables if re-running
drop trigger if exists profiles_updated_at on profiles;
drop function if exists update_updated_at;
drop table if exists waitlist;
drop table if exists profiles;

-- 1. Profiles table
create table profiles (
  username text primary key,
  owner_id uuid not null,
  name text not null,
  role text default 'Independent creator',
  email text default '',
  location text default '',
  bio text default '',
  tags text[] default array['Creator'],
  photo_url text default '',
  links jsonb default '[]'::jsonb,
  accent text default '#c45a3c',
  bg_color text default '#ffffff',
  bg_gradient text default null,
  font text default 'serif',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. Waitlist table
create table waitlist (
  id bigint generated always as identity primary key,
  email text unique not null,
  created_at timestamptz default now()
);

-- 3. Index for fast username lookup
create index if not exists idx_profiles_owner on profiles (owner_id);

-- 4. Enable Row Level Security
alter table profiles enable row level security;
alter table waitlist enable row level security;

-- 5. RLS Policies for profiles
create policy "Profiles are publicly readable"
  on profiles for select
  using (true);

create policy "Authenticated users can insert their own profile"
  on profiles for insert
  with check (auth.uid() = owner_id);

create policy "Users can update their own profile"
  on profiles for update
  using (auth.uid() = owner_id);

create policy "Users can delete their own profile"
  on profiles for delete
  using (auth.uid() = owner_id);

-- 6. RLS Policies for waitlist
create policy "Anyone can join waitlist"
  on waitlist for insert
  with check (true);

create policy "Only admins can view waitlist"
  on waitlist for select
  using (auth.role() = 'service_role');

-- 7. Storage bucket for photos
insert into storage.buckets (id, name, public)
values ('photos', 'photos', true)
on conflict (id) do nothing;

-- Allow public read on photos
create policy "Photos are publicly viewable"
  on storage.objects for select
  using (bucket_id = 'photos');

-- Authenticated users can upload their own photos
create policy "Users can upload photos"
  on storage.objects for insert
  with check (
    bucket_id = 'photos' and
    auth.role() = 'authenticated'
  );

-- Authenticated users can replace their own photos
create policy "Users can update photos"
  on storage.objects for update
  using (
    bucket_id = 'photos' and
    auth.role() = 'authenticated'
  )
  with check (
    bucket_id = 'photos' and
    auth.role() = 'authenticated'
  );

-- Users can delete their own photos
create policy "Users can delete their own photos"
  on storage.objects for delete
  using (
    bucket_id = 'photos' and
    auth.uid() = owner
  );

-- 8. Pricing plans table (server-controlled, not client-side)
create table plans (
  id text primary key,
  name text not null,
  price numeric not null,
  description text not null,
  features text[] not null default '{}',
  cta text not null,
  href text default null,
  featured boolean default false,
  available boolean default false,
  sort_order int default 0
);

alter table plans enable row level security;

create policy "Plans are publicly readable"
  on plans for select
  using (true);

-- Seed pricing data
insert into plans (id, name, price, description, features, cta, href, featured, available, sort_order) values
  ('free',    'Free',    0,  'Everything you need to get started.',            '{"1 profile","Custom colors, fonts & gradients","Photo upload","Unlimited links","Shareable link","Basic analytics"}',                                                                                                                                                   'Get started',             '#create', false, true,  1),
  ('starter', 'Starter', 5,  'Remove the badge and unlock more design options.', '{"1 profile","Everything in Free","No protome branding","More themes & fonts","Link scheduling","Standard analytics"}',                                                                                                                                                 'Upgrade to Starter',      null,      true,  false, 2),
  ('pro',     'Pro',     12, 'For professionals who want their story to stand out.', '{"Unlimited profiles","Everything in Starter","Custom domain","Password-protected profiles","Detailed analytics","Priority support"}',                                                                                                                               'Upgrade to Pro',          null,      false, false, 3)
on conflict (id) do nothing;

-- 9. Helper: auto-update updated_at on profile change
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_updated_at
  before update on profiles
  for each row
  execute function update_updated_at();
