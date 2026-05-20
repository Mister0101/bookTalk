-- ============================================================
-- BookTalk Database Schema — v2 Additions
-- Run AFTER supabase-schema.sql (builds on existing tables)
-- Paste into: Supabase Dashboard → SQL Editor → New query
-- ============================================================

-- ── CLEANUP (safe to re-run) ──────────────────────────────
drop table if exists user_achievements    cascade;
drop table if exists achievements         cascade;
drop table if exists reactions            cascade;
drop table if exists poll_votes           cascade;
drop table if exists poll_options         cascade;
drop table if exists polls                cascade;
drop table if exists rsvps                cascade;
drop table if exists club_meetings        cascade;
drop table if exists join_requests        cascade;
drop table if exists notifications        cascade;
drop table if exists reading_progress     cascade;
drop table if exists saved_clubs          cascade;

drop type if exists rsvp_status           cascade;
drop type if exists join_request_status   cascade;
drop type if exists notification_type     cascade;
drop type if exists poll_status           cascade;
drop type if exists meeting_status        cascade;

-- ── ENUMS ─────────────────────────────────────────────────
create type rsvp_status          as enum ('going', 'maybe', 'not_going');
create type join_request_status  as enum ('pending', 'approved', 'rejected');
create type notification_type    as enum ('join_request', 'new_message', 'meeting_reminder', 'poll_created', 'club_invite', 'new_member', 'achievement');
create type poll_status          as enum ('active', 'closed');
create type meeting_status       as enum ('upcoming', 'live', 'past', 'cancelled');


-- ── 1. JOIN REQUESTS ──────────────────────────────────────
-- Handles clubs with privacy = 'request_to_join'
create table join_requests (
  id          uuid primary key default gen_random_uuid(),
  club_id     uuid not null references clubs(id)    on delete cascade,
  user_id     uuid not null references profiles(id) on delete cascade,
  message     text,
  status      join_request_status not null default 'pending',
  reviewed_by uuid references profiles(id) on delete set null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique(club_id, user_id)
);

create trigger join_requests_updated_at
  before update on join_requests
  for each row execute procedure update_updated_at();

alter table join_requests enable row level security;

-- Requesters can see their own; club hosts/co-hosts can see all for their club
create policy "join_requests_select" on join_requests for select using (
  auth.uid() = user_id
  or exists (
    select 1 from club_members cm
    where cm.club_id = join_requests.club_id
      and cm.user_id = auth.uid()
      and cm.role in ('host', 'co_host')
      and cm.status = 'active'
  )
);
create policy "join_requests_insert" on join_requests for insert with check (auth.uid() = user_id);
create policy "join_requests_update" on join_requests for update using (
  -- Host/co-host can approve/reject
  exists (
    select 1 from club_members cm
    where cm.club_id = join_requests.club_id
      and cm.user_id = auth.uid()
      and cm.role in ('host', 'co_host')
      and cm.status = 'active'
  )
);
create policy "join_requests_delete" on join_requests for delete using (auth.uid() = user_id);


-- ── 2. CLUB MEETINGS ──────────────────────────────────────
-- Scheduled meetups (online/in-person) for a club
create table club_meetings (
  id           uuid primary key default gen_random_uuid(),
  club_id      uuid not null references clubs(id)    on delete cascade,
  created_by   uuid not null references profiles(id) on delete cascade,
  title        text not null,
  description  text,
  location     text,                              -- venue name / address
  meeting_url  text,                              -- Zoom/Meet link for online
  starts_at    timestamptz not null,
  ends_at      timestamptz,
  status       meeting_status not null default 'upcoming',
  book_id      uuid references books(id) on delete set null,  -- book being discussed
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create trigger club_meetings_updated_at
  before update on club_meetings
  for each row execute procedure update_updated_at();

alter table club_meetings enable row level security;

create policy "club_meetings_select" on club_meetings for select using (
  exists (
    select 1 from clubs c
    where c.id = club_meetings.club_id and c.privacy = 'public'
  )
  or exists (
    select 1 from club_members cm
    where cm.club_id = club_meetings.club_id
      and cm.user_id = auth.uid()
      and cm.status = 'active'
  )
);
create policy "club_meetings_insert" on club_meetings for insert with check (
  exists (
    select 1 from club_members cm
    where cm.club_id = club_meetings.club_id
      and cm.user_id = auth.uid()
      and cm.role in ('host', 'co_host')
      and cm.status = 'active'
  )
);
create policy "club_meetings_update" on club_meetings for update using (
  auth.uid() = created_by
  or exists (
    select 1 from club_members cm
    where cm.club_id = club_meetings.club_id
      and cm.user_id = auth.uid()
      and cm.role in ('host', 'co_host')
  )
);
create policy "club_meetings_delete" on club_meetings for delete using (
  auth.uid() = created_by
);


-- ── 3. RSVPs ──────────────────────────────────────────────
create table rsvps (
  id         uuid primary key default gen_random_uuid(),
  meeting_id uuid not null references club_meetings(id) on delete cascade,
  user_id    uuid not null references profiles(id)      on delete cascade,
  status     rsvp_status not null default 'going',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(meeting_id, user_id)
);

create trigger rsvps_updated_at
  before update on rsvps
  for each row execute procedure update_updated_at();

alter table rsvps enable row level security;

create policy "rsvps_select" on rsvps for select using (
  -- Everyone who can see the meeting can see RSVPs
  exists (
    select 1 from club_meetings cm
    join clubs c on c.id = cm.club_id
    where cm.id = rsvps.meeting_id
      and (c.privacy = 'public' or exists (
        select 1 from club_members clm
        where clm.club_id = c.id and clm.user_id = auth.uid() and clm.status = 'active'
      ))
  )
);
create policy "rsvps_insert" on rsvps for insert with check (auth.uid() = user_id);
create policy "rsvps_update" on rsvps for update using (auth.uid() = user_id);
create policy "rsvps_delete" on rsvps for delete using (auth.uid() = user_id);


-- ── 4. POLLS ──────────────────────────────────────────────
create table polls (
  id           uuid primary key default gen_random_uuid(),
  club_id      uuid not null references clubs(id)    on delete cascade,
  created_by   uuid not null references profiles(id) on delete cascade,
  question     text not null,
  description  text,
  status       poll_status not null default 'active',
  closes_at    timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create trigger polls_updated_at
  before update on polls
  for each row execute procedure update_updated_at();

alter table polls enable row level security;

create policy "polls_select" on polls for select using (
  exists (
    select 1 from clubs c
    where c.id = polls.club_id and c.privacy = 'public'
  )
  or exists (
    select 1 from club_members cm
    where cm.club_id = polls.club_id
      and cm.user_id = auth.uid()
      and cm.status = 'active'
  )
);
create policy "polls_insert" on polls for insert with check (
  exists (
    select 1 from club_members cm
    where cm.club_id = polls.club_id
      and cm.user_id = auth.uid()
      and cm.status = 'active'
  )
);
create policy "polls_update" on polls for update using (
  auth.uid() = created_by
  or exists (
    select 1 from club_members cm
    where cm.club_id = polls.club_id
      and cm.user_id = auth.uid()
      and cm.role in ('host', 'co_host')
  )
);


-- ── 5. POLL OPTIONS ───────────────────────────────────────
create table poll_options (
  id         uuid primary key default gen_random_uuid(),
  poll_id    uuid not null references polls(id)  on delete cascade,
  book_id    uuid references books(id)           on delete set null,
  label      text not null,
  created_at timestamptz not null default now()
);

alter table poll_options enable row level security;
create policy "poll_options_select" on poll_options for select using (true);
create policy "poll_options_insert" on poll_options for insert with check (
  exists (
    select 1 from polls p
    join club_members cm on cm.club_id = p.club_id
    where p.id = poll_options.poll_id
      and cm.user_id = auth.uid()
      and cm.status = 'active'
  )
);


-- ── 6. POLL VOTES ─────────────────────────────────────────
create table poll_votes (
  id        uuid primary key default gen_random_uuid(),
  poll_id   uuid not null references polls(id)        on delete cascade,
  option_id uuid not null references poll_options(id) on delete cascade,
  user_id   uuid not null references profiles(id)     on delete cascade,
  voted_at  timestamptz not null default now(),
  unique(poll_id, user_id)   -- one vote per person per poll
);

alter table poll_votes enable row level security;
create policy "poll_votes_select" on poll_votes for select using (
  exists (
    select 1 from polls p
    join clubs c on c.id = p.club_id
    where p.id = poll_votes.poll_id
      and (c.privacy = 'public' or exists (
        select 1 from club_members cm
        where cm.club_id = c.id and cm.user_id = auth.uid() and cm.status = 'active'
      ))
  )
);
create policy "poll_votes_insert" on poll_votes for insert with check (auth.uid() = user_id);
create policy "poll_votes_delete" on poll_votes for delete using (auth.uid() = user_id);


-- ── 7. MESSAGE REACTIONS ──────────────────────────────────
create table reactions (
  id         uuid primary key default gen_random_uuid(),
  message_id uuid not null references messages(id)  on delete cascade,
  user_id    uuid not null references profiles(id)  on delete cascade,
  emoji      text not null,
  created_at timestamptz not null default now(),
  unique(message_id, user_id, emoji)
);

alter table reactions enable row level security;

create policy "reactions_select" on reactions for select using (
  exists (
    select 1 from messages m
    join conversation_members cm on cm.conversation_id = m.conversation_id
    where m.id = reactions.message_id and cm.user_id = auth.uid()
  )
);
create policy "reactions_insert" on reactions for insert with check (auth.uid() = user_id);
create policy "reactions_delete" on reactions for delete using (auth.uid() = user_id);


-- ── 8. NOTIFICATIONS ──────────────────────────────────────
create table notifications (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references profiles(id) on delete cascade,
  type        notification_type not null,
  title       text not null,
  body        text,
  is_read     boolean not null default false,
  action_url  text,                                 -- deep-link (e.g. /clubs/123)
  actor_id    uuid references profiles(id) on delete set null,  -- who triggered it
  entity_id   uuid,                                 -- related club/meeting/poll id
  created_at  timestamptz not null default now()
);

create index notifications_user_unread on notifications(user_id) where is_read = false;

alter table notifications enable row level security;
create policy "notifications_select" on notifications for select using (auth.uid() = user_id);
create policy "notifications_update" on notifications for update using (auth.uid() = user_id);
create policy "notifications_delete" on notifications for delete using (auth.uid() = user_id);

-- Helper function: create notification (called from triggers/functions below)
create or replace function create_notification(
  p_user_id    uuid,
  p_type       notification_type,
  p_title      text,
  p_body       text default null,
  p_action_url text default null,
  p_actor_id   uuid default null,
  p_entity_id  uuid default null
) returns void language plpgsql security definer as $$
begin
  insert into notifications(user_id, type, title, body, action_url, actor_id, entity_id)
  values (p_user_id, p_type, p_title, p_body, p_action_url, p_actor_id, p_entity_id);
end; $$;


-- ── 9. READING PROGRESS ───────────────────────────────────
-- Tracks page-level progress for books in a user's reading list
create table reading_progress (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references profiles(id) on delete cascade,
  book_id      uuid not null references books(id)    on delete cascade,
  pages_read   int  not null default 0 check (pages_read >= 0),
  total_pages  int  check (total_pages is null or total_pages > 0),
  updated_at   timestamptz not null default now(),
  unique(user_id, book_id)
);

create trigger reading_progress_updated_at
  before update on reading_progress
  for each row execute procedure update_updated_at();

alter table reading_progress enable row level security;
create policy "reading_progress_select" on reading_progress for select using (auth.uid() = user_id);
create policy "reading_progress_all"    on reading_progress for all    using (auth.uid() = user_id);


-- ── 10. SAVED CLUBS ───────────────────────────────────────
create table saved_clubs (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references profiles(id) on delete cascade,
  club_id    uuid not null references clubs(id)    on delete cascade,
  saved_at   timestamptz not null default now(),
  unique(user_id, club_id)
);

alter table saved_clubs enable row level security;
create policy "saved_clubs_select" on saved_clubs for select using (auth.uid() = user_id);
create policy "saved_clubs_all"    on saved_clubs for all    using (auth.uid() = user_id);


-- ── 11. ACHIEVEMENTS ──────────────────────────────────────
create table achievements (
  id          uuid primary key default gen_random_uuid(),
  key         text not null unique,              -- e.g. 'first_book', 'streak_7'
  name        text not null,
  description text,
  icon        text,                              -- emoji or image URL
  xp_reward   int  not null default 0
);

-- Seed default achievements
insert into achievements (key, name, description, icon, xp_reward) values
  ('first_book',    'First Chapter',      'Added your first book',                '📖', 50),
  ('streak_7',      'Week Warrior',       'Read 7 days in a row',                 '🔥', 100),
  ('streak_30',     'Monthly Reader',     'Read 30 days in a row',                '🏆', 300),
  ('joined_club',   'Club Member',        'Joined your first book club',          '🤝', 75),
  ('hosted_club',   'Club Host',          'Created a book club',                  '👑', 100),
  ('finished_book', 'Bookworm',           'Finished your first book',             '✅', 100),
  ('ten_books',     'Bibliophile',        'Finished 10 books',                    '📚', 250),
  ('first_message', 'Conversation Spark', 'Sent your first message in a club',    '💬', 25),
  ('poll_creator',  'Poll Master',        'Created your first book poll',         '🗳️', 50),
  ('meeting_host',  'Meetup Organizer',   'Hosted your first club meeting',       '🗓️', 75)
on conflict (key) do nothing;


-- ── 12. USER ACHIEVEMENTS ─────────────────────────────────
create table user_achievements (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references profiles(id)     on delete cascade,
  achievement_id uuid not null references achievements(id) on delete cascade,
  earned_at      timestamptz not null default now(),
  unique(user_id, achievement_id)
);

alter table user_achievements enable row level security;
create policy "user_achievements_select" on user_achievements for select using (true);
create policy "user_achievements_insert" on user_achievements for insert with check (auth.uid() = user_id);


-- ── 13. PROFILE XP COLUMN ────────────────────────────────
-- Add XP + streak tracking to profiles (if not already there)
alter table profiles
  add column if not exists xp               int  not null default 0,
  add column if not exists reading_streak   int  not null default 0,
  add column if not exists yearly_goal      int  not null default 24,
  add column if not exists last_active_date date;

-- Function to add XP when an achievement is earned
create or replace function award_xp_on_achievement()
returns trigger language plpgsql security definer as $$
declare v_xp int;
begin
  select xp_reward into v_xp from achievements where id = new.achievement_id;
  update profiles set xp = xp + v_xp where id = new.user_id;
  return new;
end; $$;

create trigger award_xp_on_achievement
  after insert on user_achievements
  for each row execute procedure award_xp_on_achievement();


-- ── 14. NOTIFY ON JOIN REQUEST ───────────────────────────
-- Auto-notify club host when someone requests to join
create or replace function notify_join_request()
returns trigger language plpgsql security definer as $$
declare
  v_host_id uuid;
  v_club_name text;
  v_requester_name text;
begin
  select created_by, name into v_host_id, v_club_name from clubs where id = new.club_id;
  select name into v_requester_name from profiles where id = new.user_id;

  perform create_notification(
    v_host_id, 'join_request',
    v_requester_name || ' wants to join ' || v_club_name,
    null,
    '/clubs/' || new.club_id::text,
    new.user_id,
    new.club_id
  );
  return new;
end; $$;

create trigger notify_on_join_request
  after insert on join_requests
  for each row execute procedure notify_join_request();


-- ── 15. REALTIME ─────────────────────────────────────────
alter publication supabase_realtime add table notifications;
alter publication supabase_realtime add table reactions;
alter publication supabase_realtime add table poll_votes;
alter publication supabase_realtime add table rsvps;
alter publication supabase_realtime add table club_meetings;


-- ── 16. HELPFUL VIEWS ────────────────────────────────────

-- Unread notification count per user (useful for sidebar badge)
create or replace view unread_notification_count as
  select user_id, count(*)::int as unread_count
  from notifications
  where is_read = false
  group by user_id;

-- Club member count per club
create or replace view club_member_counts as
  select club_id, count(*)::int as member_count
  from club_members
  where status = 'active'
  group by club_id;

-- RSVP summary per meeting
create or replace view meeting_rsvp_summary as
  select
    meeting_id,
    count(*) filter (where status = 'going')     ::int as going_count,
    count(*) filter (where status = 'maybe')     ::int as maybe_count,
    count(*) filter (where status = 'not_going') ::int as not_going_count
  from rsvps
  group by meeting_id;

-- Poll vote counts per option
create or replace view poll_option_vote_counts as
  select
    pv.poll_id,
    pv.option_id,
    po.label,
    po.book_id,
    count(pv.id)::int as vote_count
  from poll_votes pv
  join poll_options po on po.id = pv.option_id
  group by pv.poll_id, pv.option_id, po.label, po.book_id;
