-- Storyworth Voice – initial schema

create extension if not exists "pgcrypto";

create table if not exists public.anonymous_user (
  id uuid primary key default gen_random_uuid(),
  anon_key text unique not null,
  created_at timestamptz default now()
);

create table if not exists public.call_log (
  id uuid primary key default gen_random_uuid(),
  anon_user_id uuid references public.anonymous_user(id) on delete set null,
  retell_call_id text unique not null,
  phone_e164 text,
  status text,
  audio_url text,
  transcript text,
  started_at timestamptz,
  ended_at timestamptz,
  created_at timestamptz default now()
);

create index if not exists call_log_anon_user_idx on public.call_log(anon_user_id);
create index if not exists call_log_started_at_idx on public.call_log(started_at desc);

alter table public.anonymous_user enable row level security;
alter table public.call_log enable row level security;

-- Policies optional: service role bypasses RLS. If you want to allow anon reads later, add explicit policies.

