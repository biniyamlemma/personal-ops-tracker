-- Run in Supabase SQL Editor AFTER 01-setup.sql
-- Enables multiple departments per user

create table if not exists profile_departments (
  profile_id uuid not null references profiles(id) on delete cascade,
  department_id uuid not null references departments(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (profile_id, department_id)
);

alter table profile_departments enable row level security;

drop policy if exists "Authenticated users can view profile departments" on profile_departments;
create policy "Authenticated users can view profile departments"
  on profile_departments for select to authenticated using (true);

drop policy if exists "Admins can manage profile departments" on profile_departments;
create policy "Admins can manage profile departments"
  on profile_departments for all to authenticated
  using (public.get_user_role() = 'admin')
  with check (public.get_user_role() = 'admin');

-- Migrate existing single department_id into junction table
insert into profile_departments (profile_id, department_id)
select id, department_id from profiles
where department_id is not null
on conflict do nothing;

-- Helper: check if user belongs to a department
create or replace function public.user_has_department(dept_id uuid)
returns boolean as $$
  select
    public.get_user_role() = 'admin'
    or exists (
      select 1 from public.profile_departments pd
      where pd.profile_id = auth.uid() and pd.department_id = dept_id
    )
    or exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.department_id = dept_id
    );
$$ language sql security definer stable;

-- Update work item policies to use multi-department
drop policy if exists "Authenticated users can view work items" on work_items;
create policy "Authenticated users can view work items"
  on work_items for select to authenticated using (
    public.get_user_role() = 'admin'
    or public.get_user_role() = 'manager'
    or assigned_to = auth.uid()
    or public.user_has_department(department_id)
  );

drop policy if exists "Users can update work items" on work_items;
create policy "Users can update work items"
  on work_items for update to authenticated using (
    public.get_user_role() = 'admin'
    or (public.get_user_role() = 'manager' and public.user_has_department(department_id))
    or assigned_to = auth.uid()
  );
