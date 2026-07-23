create extension if not exists "pgcrypto";

create table if not exists public.memories (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text not null,
  place_name text,
  latitude double precision,
  longitude double precision,
  period_text text not null,
  sharer_name text not null,
  category text not null default '生活故事',
  tags text[] not null default '{}',
  image_url text,
  source_label text not null default '民眾投稿',
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default timezone('utc', now())
);

alter table public.memories enable row level security;

drop policy if exists "Public read approved memories" on public.memories;
create policy "Public read approved memories"
on public.memories
for select
to anon, authenticated
using (status = 'approved');

drop policy if exists "Public insert pending memories" on public.memories;
create policy "Public insert pending memories"
on public.memories
for insert
to anon, authenticated
with check (status = 'pending');

insert into storage.buckets (id, name, public)
values ('memory-images', 'memory-images', true)
on conflict (id) do nothing;

drop policy if exists "Public read memory images" on storage.objects;
create policy "Public read memory images"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'memory-images');

drop policy if exists "Public upload memory images" on storage.objects;
create policy "Public upload memory images"
on storage.objects
for insert
to anon, authenticated
with check (bucket_id = 'memory-images');
