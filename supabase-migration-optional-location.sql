-- 讓地點改成非必填：在 Supabase 專案的 SQL Editor 貼上並執行一次即可
alter table public.memories alter column place_name drop not null;
alter table public.memories alter column latitude drop not null;
alter table public.memories alter column longitude drop not null;
