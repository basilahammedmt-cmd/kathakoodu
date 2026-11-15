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

-- 3. Teacher's own characters (image kept inline as a small PNG data URL).
create table if not exists public.characters (
  id       text primary key,
  owner    uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name     text not null check (char_length(name) <= 40),
  motion   text not null default 'stand' check (motion in ('fly','hop','walk','swim','stand')),
  mirror   boolean not null default false,
  img      text not null check (img like 'data:image/png;base64,%' and char_length(img) <= 450000),
  created  bigint not null default (extract(epoch from now()) * 1000)::bigint,
  updated  bigint not null default (extract(epoch from now()) * 1000)::bigint
);
alter table public.characters enable row level security;
drop policy if exists "own characters: all" on public.characters;
create policy "own characters: all" on public.characters for all to authenticated
  using (owner = auth.uid()) with check (owner = auth.uid());

-- 4. Sharing with parents: a link/QR per work.
alter table public.works add column if not exists share text;
alter table public.works add column if not exists shared_at bigint;

-- 5. The child's recorded voice (private, like photos). Files: <teacher id>/<audio id>
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('audio', 'audio', false, 3145728, array['audio/webm','audio/mp4','audio/ogg','audio/mpeg','audio/aac','audio/x-m4a'])
on conflict (id) do update set public = false, file_size_limit = 3145728, allowed_mime_types = array['audio/webm','audio/mp4','audio/ogg','audio/mpeg','audio/aac','audio/x-m4a'];

drop policy if exists "own audio: all" on storage.objects;
create policy "own audio: all" on storage.objects for all to authenticated
  using (bucket_id = 'audio' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'audio' and (storage.foldername(name))[1] = auth.uid()::text);

-- 6. Copies the teacher chose to share. PUBLIC bucket: anyone with the exact link can read a file,
--    but nobody can list the bucket, and only the owner can add, change or delete.
--    Files: <teacher id>/<random 32-character token>/bundle.json, photo.jpg, a/<audio>
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('shared', 'shared', true, 3145728, array['application/json','image/jpeg','audio/webm','audio/mp4','audio/ogg','audio/mpeg','audio/aac','audio/x-m4a'])
on conflict (id) do update set public = true, file_size_limit = 3145728, allowed_mime_types = array['application/json','image/jpeg','audio/webm','audio/mp4','audio/ogg','audio/mpeg','audio/aac','audio/x-m4a'];

drop policy if exists "own shared: all" on storage.objects;
create policy "own shared: all" on storage.objects for all to authenticated
  using (bucket_id = 'shared' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'shared' and (storage.foldername(name))[1] = auth.uid()::text);
