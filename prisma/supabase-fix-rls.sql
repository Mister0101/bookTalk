-- BookTalk RLS Fix: Resolve infinite recursion in policies
-- Run this in the Supabase SQL Editor (it's safe to run multiple times)
-- ─────────────────────────────────────────────────────────────────────────────

-- ── 1. SECURITY DEFINER HELPER FUNCTIONS ─────────────────
--    These run as the function owner (bypassing RLS), breaking circular chains.

create or replace function bt_is_club_member(p_club_id uuid, p_user_id uuid)
returns boolean language sql security definer stable set search_path = public as $$
  select exists (
    select 1 from public.club_members
    where club_id = p_club_id and user_id = p_user_id and status = 'active'
  )
$$;

create or replace function bt_club_is_public(p_club_id uuid)
returns boolean language sql security definer stable set search_path = public as $$
  select exists (
    select 1 from public.clubs
    where id = p_club_id and privacy = 'public'
  )
$$;

create or replace function bt_is_conv_member(p_conv_id uuid, p_user_id uuid)
returns boolean language sql security definer stable set search_path = public as $$
  select exists (
    select 1 from public.conversation_members
    where conversation_id = p_conv_id and user_id = p_user_id
  )
$$;

-- ── 2. FIX clubs SELECT ───────────────────────────────────
--    Old policy queried club_members → club_members queried club_members = recursion
drop policy if exists "clubs_select" on clubs;
create policy "clubs_select" on clubs for select using (
  privacy = 'public'
  or created_by = auth.uid()
  or bt_is_club_member(id, auth.uid())
);

-- ── 3. FIX club_members SELECT ───────────────────────────
--    Old policy self-referenced club_members = infinite recursion
drop policy if exists "club_members_select" on club_members;
create policy "club_members_select" on club_members for select using (
  user_id = auth.uid()
  or bt_club_is_public(club_id)
  or bt_is_club_member(club_id, auth.uid())
);

-- ── 4. FIX conversation_members SELECT ───────────────────
--    Old policy self-referenced conversation_members = infinite recursion
drop policy if exists "conv_members_select" on conversation_members;
create policy "conv_members_select" on conversation_members for select using (
  user_id = auth.uid()
  or bt_is_conv_member(conversation_id, auth.uid())
);

-- ── 5. FIX conversations SELECT ──────────────────────────
--    Depended on conv_members which was recursive
drop policy if exists "conversations_select" on conversations;
create policy "conversations_select" on conversations for select using (
  created_by = auth.uid()
  or bt_is_conv_member(id, auth.uid())
);

-- ── 6. FIX messages SELECT ───────────────────────────────
--    Also depended on conv_members which was recursive
drop policy if exists "messages_select" on messages;
create policy "messages_select" on messages for select using (
  user_id = auth.uid()
  or bt_is_conv_member(conversation_id, auth.uid())
);
