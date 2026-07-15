create extension if not exists "pgcrypto";

create table if not exists public.memory_reports (
  id uuid primary key default gen_random_uuid(),
  memory_id text not null,
  memory_title_snapshot text not null,
  fields text[] not null default '{}',
  description text not null default '',
  reporter_name text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default timezone('utc', now())
);

alter table public.memory_reports enable row level security;

drop policy if exists "Public insert pending reports" on public.memory_reports;
create policy "Public insert pending reports"
on public.memory_reports
for insert
to anon, authenticated
with check (status = 'pending');
