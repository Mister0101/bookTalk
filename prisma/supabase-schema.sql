-- ============================================================
-- BookCircle Database Schema
-- Paste into: Supabase Dashboard → SQL Editor → New query
-- ============================================================

-- ── 0. CLEANUP (safe reset) ───────────────────────────────
drop table if exists club_members         cascade;
drop table if exists clubs                cascade;
drop table if exists match_queue          cascade;
drop table if exists messages             cascade;
drop table if exists conversation_members cascade;
drop table if exists conversations        cascade;
drop table if exists user_books           cascade;
drop table if exists books                cascade;
drop table if exists profiles             cascade;
drop type  if exists member_status        cascade;
drop type  if exists member_role          cascade;
drop type  if exists meeting_type         cascade;
drop type  if exists club_privacy         cascade;
drop type  if exists conversation_type    cascade;
drop type  if exists reading_status       cascade;

-- ── 1. EXTENSIONS ─────────────────────────────────────────
create extension if not exists "pgcrypto";

-- ── 2. ENUMS ──────────────────────────────────────────────
create type reading_status    as enum ('reading', 'planned', 'finished');
create type conversation_type as enum ('dm', 'group', 'matched');
create type club_privacy      as enum ('public', 'request_to_join', 'invite_only');
create type meeting_type      as enum ('in_person', 'online', 'hybrid');
create type member_role       as enum ('host', 'co_host', 'member');
create type member_status     as enum ('active', 'pending', 'banned');

-- ── 3. PROFILES ───────────────────────────────────────────
create table profiles (
  id                   uuid primary key references auth.users(id) on delete cascade,
  name                 text not null,
  email                text,
  phone                text,
  avatar_url           text,
  bio                  text,
  city                 text,
  country              text,
  favorite_genres      text[]   not null default '{}',
  reading_pace         text,
  discussion_style     text,
  meeting_preference   text,
  allow_group_matching boolean  not null default true,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

create trigger profiles_updated_at
  before update on profiles
  for each row execute procedure update_updated_at();

alter table profiles enable row level security;
create policy "profiles_select" on profiles for select using (true);
create policy "profiles_insert" on profiles for insert with check (auth.uid() = id);
create policy "profiles_update" on profiles for update using (auth.uid() = id);

-- ── 4. BOOKS ──────────────────────────────────────────────
create table books (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  author      text not null,
  cover_url   text,
  genres      text[] not null default '{}',
  description text,
  isbn        text unique,
  created_at  timestamptz not null default now()
);

alter table books enable row level security;
create policy "books_select" on books for select using (true);
create policy "books_insert" on books for insert with check (auth.role() = 'authenticated');

-- ── 5. USER BOOKS (reading lists) ─────────────────────────
create table user_books (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references profiles(id) on delete cascade,
  book_id    uuid not null references books(id)    on delete cascade,
  status     reading_status not null,
  created_at timestamptz not null default now(),
  unique(user_id, book_id)
);

alter table user_books enable row level security;
create policy "user_books_select" on user_books for select using (auth.uid() = user_id);
create policy "user_books_all"    on user_books for all    using (auth.uid() = user_id);

-- ── 6. CONVERSATIONS ──────────────────────────────────────
-- NOTE: RLS policy referencing conversation_members is added AFTER that table exists (see step 8)
create table conversations (
  id         uuid primary key default gen_random_uuid(),
  type       conversation_type not null,
  name       text,
  book_id    uuid references books(id) on delete set null,
  created_by uuid not null references profiles(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table conversations enable row level security;
create policy "conversations_insert" on conversations
  for insert with check (auth.uid() = created_by);

-- ── 7. CONVERSATION MEMBERS ───────────────────────────────
create table conversation_members (
  id              uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references conversations(id) on delete cascade,
  user_id         uuid not null references profiles(id)      on delete cascade,
  joined_at       timestamptz not null default now(),
  unique(conversation_id, user_id)
);

alter table conversation_members enable row level security;

create policy "conv_members_select" on conversation_members for select using (
  exists (
    select 1 from conversation_members cm
    where cm.conversation_id = conversation_members.conversation_id
      and cm.user_id = auth.uid()
  )
);

create policy "conv_members_insert" on conversation_members for insert with check (
  auth.uid() = user_id
  or exists (
    select 1 from conversations c
    where c.id = conversation_id and c.created_by = auth.uid()
  )
);

-- ── 8. ADD conversations SELECT POLICY (now that conversation_members exists) ──
create policy "conversations_select" on conversations for select using (
  exists (
    select 1 from conversation_members
    where conversation_id = conversations.id
      and user_id = auth.uid()
  )
);

-- ── 9. MESSAGES ───────────────────────────────────────────
create table messages (
  id               uuid primary key default gen_random_uuid(),
  conversation_id  uuid not null references conversations(id)  on delete cascade,
  user_id          uuid not null references profiles(id)       on delete cascade,
  content          text not null,
  contains_spoiler boolean not null default false,
  created_at       timestamptz not null default now()
);

alter table messages enable row level security;

create policy "messages_select" on messages for select using (
  exists (
    select 1 from conversation_members
    where conversation_id = messages.conversation_id
      and user_id = auth.uid()
  )
);

create policy "messages_insert" on messages for insert with check (
  auth.uid() = user_id
  and exists (
    select 1 from conversation_members
    where conversation_id = messages.conversation_id
      and user_id = auth.uid()
  )
);

-- ── 10. MATCH QUEUE ───────────────────────────────────────
create table match_queue (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references profiles(id)      on delete cascade,
  book_id         uuid not null references books(id)         on delete cascade,
  queued_at       timestamptz not null default now(),
  matched         boolean not null default false,
  conversation_id uuid references conversations(id) on delete set null
);

alter table match_queue enable row level security;
create policy "match_queue_select" on match_queue for select using (auth.uid() = user_id);
create policy "match_queue_insert" on match_queue for insert with check (auth.uid() = user_id);
create policy "match_queue_update" on match_queue for update using (auth.uid() = user_id);
create policy "match_queue_delete" on match_queue for delete using (auth.uid() = user_id);

-- ── 11. CLUBS ─────────────────────────────────────────────
-- NOTE: clubs SELECT policy references club_members, added after that table (step 12)
create table clubs (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  description  text,
  book_id      uuid references books(id) on delete set null,
  genre        text,
  created_by   uuid not null references profiles(id) on delete cascade,
  privacy      club_privacy  not null default 'public',
  meeting_type meeting_type  not null default 'online',
  city         text,
  country      text,
  rules        text,
  member_limit int,
  created_at   timestamptz not null default now()
);

alter table clubs enable row level security;
create policy "clubs_insert" on clubs for insert with check (auth.uid() = created_by);
create policy "clubs_update" on clubs for update using (auth.uid() = created_by);

-- ── 12. CLUB MEMBERS ──────────────────────────────────────
create table club_members (
  id        uuid primary key default gen_random_uuid(),
  club_id   uuid not null references clubs(id)    on delete cascade,
  user_id   uuid not null references profiles(id) on delete cascade,
  role      member_role   not null default 'member',
  status    member_status not null default 'active',
  joined_at timestamptz   not null default now(),
  unique(club_id, user_id)
);

alter table club_members enable row level security;

create policy "club_members_select" on club_members for select using (
  exists (
    select 1 from clubs c
    where c.id = club_members.club_id and c.privacy = 'public'
  )
  or exists (
    select 1 from club_members cm
    where cm.club_id = club_members.club_id
      and cm.user_id = auth.uid()
      and cm.status = 'active'
  )
);

create policy "club_members_insert" on club_members for insert with check (auth.uid() = user_id);
create policy "club_members_delete" on club_members for delete using (auth.uid() = user_id);
create policy "club_members_update" on club_members for update using (
  exists (
    select 1 from club_members cm
    where cm.club_id = club_members.club_id
      and cm.user_id = auth.uid()
      and cm.role in ('host', 'co_host')
  )
);

-- ── 13. ADD clubs SELECT POLICY (now that club_members exists) ──
create policy "clubs_select" on clubs for select using (
  privacy = 'public'
  or exists (
    select 1 from club_members
    where club_id = clubs.id and user_id = auth.uid() and status = 'active'
  )
);

-- ── 14. REALTIME ──────────────────────────────────────────
alter publication supabase_realtime add table messages;
alter publication supabase_realtime add table conversations;
alter publication supabase_realtime add table conversation_members;
alter publication supabase_realtime add table match_queue;
