-- Run in Supabase SQL Editor AFTER 01-setup.sql and 02-multi-department.sql
-- Converts company ops tracker to personal ops (one user owns their areas and items)

-- 1. Departments → personal areas (per user)
alter table departments add column if not exists user_id uuid references auth.users(id) on delete cascade;

alter table departments drop constraint if exists departments_name_key;
create unique index if not exists departments_user_name_unique on departments(user_id, name);

-- Remove old company-wide departments (no owner)
delete from departments where user_id is null;

-- 2. Work items owned by user
alter table work_items add column if not exists user_id uuid references auth.users(id) on delete cascade;
update work_items set user_id = created_by where user_id is null;

-- 3. Seed default areas for a user
create or replace function public.seed_default_areas(uid uuid)
returns void as $$
begin
  if not exists (select 1 from public.departments where user_id = uid) then
    insert into public.departments (name, user_id) values
      ('Work', uid),
      ('Personal', uid),
      ('Home', uid),
      ('Money', uid),
      ('Health', uid),
      ('Projects', uid);
  end if;
end;
$$ language plpgsql security definer;

-- Seed areas when profile is created
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.email,
    'admin'
  );
  perform public.seed_default_areas(new.id);
  return new;
end;
$$ language plpgsql security definer;

-- Seed areas for existing users who have none
do $$
declare
  u record;
begin
  for u in select id from auth.users loop
    perform public.seed_default_areas(u.id);
  end loop;
end $$;

-- 4. Personal RLS — departments (areas)
drop policy if exists "Authenticated users can view departments" on departments;
drop policy if exists "Admins can manage departments" on departments;
drop policy if exists "Users can view own areas" on departments;
drop policy if exists "Users can manage own areas" on departments;

create policy "Users can view own areas"
  on departments for select to authenticated
  using (user_id = auth.uid());

create policy "Users can manage own areas"
  on departments for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- 5. Personal RLS — work items
drop policy if exists "Authenticated users can view work items" on work_items;
drop policy if exists "Admins and managers can create work items" on work_items;
drop policy if exists "Users can update work items" on work_items;
drop policy if exists "Admins can delete work items" on work_items;
drop policy if exists "Users can view own work items" on work_items;
drop policy if exists "Users can create own work items" on work_items;
drop policy if exists "Users can update own work items" on work_items;
drop policy if exists "Users can delete own work items" on work_items;

create policy "Users can view own work items"
  on work_items for select to authenticated
  using (user_id = auth.uid());

create policy "Users can create own work items"
  on work_items for insert to authenticated
  with check (user_id = auth.uid() and created_by = auth.uid());

create policy "Users can update own work items"
  on work_items for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "Users can delete own work items"
  on work_items for delete to authenticated
  using (user_id = auth.uid());

-- 6. Comments & activities — only on own work items
drop policy if exists "Authenticated users can view comments" on comments;
drop policy if exists "Authenticated users can add comments" on comments;
drop policy if exists "Users can view comments on own items" on comments;
drop policy if exists "Users can add comments on own items" on comments;

create policy "Users can view comments on own items"
  on comments for select to authenticated
  using (exists (
    select 1 from public.work_items w
    where w.id = work_item_id and w.user_id = auth.uid()
  ));

create policy "Users can add comments on own items"
  on comments for insert to authenticated
  with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.work_items w
      where w.id = work_item_id and w.user_id = auth.uid()
    )
  );

drop policy if exists "Authenticated users can view activities" on activities;
drop policy if exists "Authenticated users can add activities" on activities;
drop policy if exists "Users can view activities on own items" on activities;
drop policy if exists "Users can add activities on own items" on activities;

create policy "Users can view activities on own items"
  on activities for select to authenticated
  using (exists (
    select 1 from public.work_items w
    where w.id = work_item_id and w.user_id = auth.uid()
  ));

create policy "Users can add activities on own items"
  on activities for insert to authenticated
  with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.work_items w
      where w.id = work_item_id and w.user_id = auth.uid()
    )
  );

-- 7. Profiles — self only (no team admin)
drop policy if exists "Authenticated users can view profiles" on profiles;
drop policy if exists "Admins can manage all profiles" on profiles;
drop policy if exists "Users can update own profile" on profiles;
drop policy if exists "Users can view own profile" on profiles;

create policy "Users can view own profile"
  on profiles for select to authenticated
  using (id = auth.uid());

create policy "Users can update own profile"
  on profiles for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());
