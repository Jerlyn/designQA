create extension if not exists pgcrypto;

create table projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  created_at timestamptz default now()
);

create table urls (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade,
  url text not null,
  created_at timestamptz default now()
);

create table captures (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade,
  label text,
  status text default 'pending' check (status in ('pending', 'running', 'complete', 'error')),
  created_at timestamptz default now()
);

create table capture_results (
  id uuid primary key default gen_random_uuid(),
  capture_id uuid references captures(id) on delete cascade,
  url_id uuid references urls(id) on delete cascade,
  url text not null,
  screenshot_url text,
  axe_violations jsonb,
  axe_score integer,
  error text,
  created_at timestamptz default now()
);

create table regression_analyses (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade,
  baseline_capture_id uuid references captures(id),
  comparison_capture_id uuid references captures(id),
  url text not null,
  gpt_analysis text,
  score_change integer,
  provider text default 'claude',
  created_at timestamptz default now()
);

alter table regression_analyses add column if not exists provider text default 'claude';

-- Authentication and billing
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  plan text default 'free',
  stripe_customer_id text,
  stripe_subscription_id text,
  subscribed_at timestamptz,
  created_at timestamptz default now()
);

alter table projects add column if not exists user_id uuid references auth.users(id) on delete cascade;

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
for each row execute procedure public.handle_new_user();

alter table projects enable row level security;
alter table urls enable row level security;
alter table captures enable row level security;
alter table capture_results enable row level security;
alter table regression_analyses enable row level security;
alter table profiles enable row level security;

drop policy if exists "Users see own profile" on profiles;
create policy "Users see own profile" on profiles for all using (auth.uid() = id);
drop policy if exists "Users see own projects" on projects;
create policy "Users see own projects" on projects for all using (auth.uid() = user_id);
drop policy if exists "Users see own urls" on urls;
create policy "Users see own urls" on urls for all using (exists (select 1 from projects where projects.id = urls.project_id and projects.user_id = auth.uid()));
drop policy if exists "Users see own captures" on captures;
create policy "Users see own captures" on captures for all using (exists (select 1 from projects where projects.id = captures.project_id and projects.user_id = auth.uid()));
drop policy if exists "Users see own capture_results" on capture_results;
create policy "Users see own capture_results" on capture_results for all using (exists (select 1 from captures c join projects p on p.id = c.project_id where c.id = capture_results.capture_id and p.user_id = auth.uid()));
drop policy if exists "Users see own analyses" on regression_analyses;
create policy "Users see own analyses" on regression_analyses for all using (exists (select 1 from projects where projects.id = regression_analyses.project_id and projects.user_id = auth.uid()));
