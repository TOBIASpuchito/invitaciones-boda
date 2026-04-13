create extension if not exists pgcrypto;

create table if not exists public.invitations (
  id uuid primary key default gen_random_uuid(),
  token text not null unique,
  display_name text not null,
  named_guests text[] not null default '{}',
  search_name text not null,
  relationship text not null default '',
  allowed_guests integer not null default 1 check (allowed_guests > 0),
  notes text,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'declined')),
  confirmed_count integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.rsvps (
  id uuid primary key default gen_random_uuid(),
  invitation_id uuid not null references public.invitations(id) on delete cascade,
  attendance text not null check (attendance in ('yes', 'no')),
  confirmed_count integer not null default 0 check (confirmed_count >= 0),
  guest_names text[] not null default '{}',
  phone text,
  message text,
  submitted_at timestamptz not null default now()
);

create index if not exists invitations_search_name_idx on public.invitations(search_name);
create index if not exists rsvps_invitation_id_idx on public.rsvps(invitation_id, submitted_at desc);

alter table public.invitations enable row level security;
alter table public.rsvps enable row level security;

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists invitations_touch_updated_at on public.invitations;

create trigger invitations_touch_updated_at
before update on public.invitations
for each row
execute function public.touch_updated_at();
