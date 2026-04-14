create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null check (char_length(display_name) between 2 and 40),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.comment_user_moderation (
  user_id uuid primary key references auth.users (id) on delete cascade,
  is_trusted boolean not null default false,
  is_banned boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  post_slug text not null,
  parent_id uuid references public.comments (id) on delete set null,
  author_id uuid not null references auth.users (id) on delete cascade,
  body text not null check (char_length(body) between 2 and 2000),
  normalized_body text not null,
  status text not null default 'visible' check (status in ('visible', 'hidden', 'deleted')),
  moderation_reason text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  edited_at timestamptz,
  hidden_at timestamptz,
  deleted_at timestamptz,
  edit_window_expires_at timestamptz not null default timezone('utc', now()) + interval '15 minutes',
  author_ip_hash text,
  user_agent text,
  constraint comments_parent_depth check (id is distinct from parent_id)
);

create table if not exists public.comment_reports (
  id uuid primary key default gen_random_uuid(),
  comment_id uuid not null references public.comments (id) on delete cascade,
  reporter_id uuid not null references auth.users (id) on delete cascade,
  reason text not null check (reason in ('spam', 'abuse', 'off-topic', 'unsafe', 'other')),
  details text,
  status text not null default 'open' check (status in ('open', 'reviewed', 'dismissed')),
  created_at timestamptz not null default timezone('utc', now()),
  unique (comment_id, reporter_id)
);

create table if not exists public.comment_rate_limits (
  id uuid primary key default gen_random_uuid(),
  scope text not null,
  scope_key text not null,
  window_starts_at timestamptz not null,
  attempts integer not null default 1 check (attempts >= 1),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (scope, scope_key, window_starts_at)
);

create index if not exists comments_post_slug_created_at_idx
  on public.comments (post_slug, created_at);

create index if not exists comments_author_recent_idx
  on public.comments (author_id, created_at desc);

create index if not exists comments_parent_id_idx
  on public.comments (parent_id);

create index if not exists comments_normalized_body_idx
  on public.comments (normalized_body);

create index if not exists comments_author_ip_hash_idx
  on public.comments (author_ip_hash);

create index if not exists comment_reports_comment_id_idx
  on public.comment_reports (comment_id, status);

create index if not exists comment_rate_limits_lookup_idx
  on public.comment_rate_limits (scope, scope_key, window_starts_at);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create or replace function public.handle_new_comment_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  default_name text;
begin
  default_name := coalesce(
    nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''),
    nullif(trim(split_part(new.email, '@', 1)), ''),
    'Reader'
  );

  insert into public.profiles (id, display_name)
  values (new.id, left(default_name, 40))
  on conflict (id) do nothing;

  insert into public.comment_user_moderation (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created_for_comments on auth.users;
create trigger on_auth_user_created_for_comments
  after insert on auth.users
  for each row execute procedure public.handle_new_comment_user();

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.set_updated_at();

drop trigger if exists set_comment_user_moderation_updated_at on public.comment_user_moderation;
create trigger set_comment_user_moderation_updated_at
  before update on public.comment_user_moderation
  for each row execute procedure public.set_updated_at();

drop trigger if exists set_comments_updated_at on public.comments;
create trigger set_comments_updated_at
  before update on public.comments
  for each row execute procedure public.set_updated_at();

drop trigger if exists set_comment_rate_limits_updated_at on public.comment_rate_limits;
create trigger set_comment_rate_limits_updated_at
  before update on public.comment_rate_limits
  for each row execute procedure public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.comment_user_moderation enable row level security;
alter table public.comments enable row level security;
alter table public.comment_reports enable row level security;
alter table public.comment_rate_limits enable row level security;

comment on table public.comments is 'Comments are only read and written by the app server using the service role key.';
comment on table public.comment_reports is 'Reports are reviewed manually in the Supabase dashboard.';
