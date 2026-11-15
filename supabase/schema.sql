-- കഥക്കൂട് — Supabase setup.
-- Supabase dashboard → SQL Editor → New query → paste all of this → Run. Safe to run again.

-- 1. Works: each teacher sees and changes only their own rows.
create table if not exists public.works (
  id          text primary key,
  owner       uuid not null default auth.uid() references auth.users(id) on delete cascade,
  title       text not null check (char_length(title) <= 120),
  child       text not null check (char_length(child) <= 40),
  kind        text not null default 'story' check (kind in ('story','poem','drawing')),
  consent     boolean not null default false check (consent),
  text        text not null default '' check (char_length(text) <= 20000),
  scenes      jsonb not null default '[]'::jsonb,
  has_photo   boolean not null default false,
  created     bigint not null default (extract(epoch from now()) * 1000)::bigint,
  updated     bigint not null default (extract(epoch from now()) * 1000)::bigint
);
create index if not exists works_owner_created on public.works (owner, created desc);

alter table public.works enable row level security;

drop policy if exists "own works: read"   on public.works;
drop policy if exists "own works: insert" on public.works;
drop policy if exists "own works: update" on public.works;
drop policy if exists "own works: delete" on public.works;
create policy "own works: read"   on public.works for select to authenticated using (owner = auth.uid());
create policy "own works: insert" on public.works for insert to authenticated with check (owner = auth.uid());
create policy "own works: update" on public.works for update to authenticated using (owner = auth.uid()) with check (owner = auth.uid());
create policy "own works: delete" on public.works for delete to authenticated using (owner = auth.uid());

-- 2. Photos: a PRIVATE bucket. Files live at <teacher id>/<work id>.jpg.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('photos', 'photos', false, 2097152, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set public = false, file_size_limit = 2097152, allowed_mime_types = array['image/jpeg','image/png','image/webp'];

drop policy if exists "own photos: read"   on storage.objects;
drop policy if exists "own photos: insert" on storage.objects;
drop policy if exists "own photos: update" on storage.objects;
drop policy if exists "own photos: delete" on storage.objects;
create policy "own photos: read"   on storage.objects for select to authenticated
  using (bucket_id = 'photos' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "own photos: insert" on storage.objects for insert to authenticated
  with check (bucket_id = 'photos' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "own photos: update" on storage.objects for update to authenticated
  using (bucket_id = 'photos' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "own photos: delete" on storage.objects for delete to authenticated
  using (bucket_id = 'photos' and (storage.foldername(name))[1] = auth.uid()::text);
