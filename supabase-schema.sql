-- ============================================================
-- Havillah LuxeModel AI — Supabase Schema
-- Run this in the Supabase SQL Editor
-- ============================================================

-- 1. USERS (extends Supabase auth.users)
create table if not exists public.users (
  id           uuid primary key references auth.users(id) on delete cascade,
  email        text,
  full_name    text,
  role         text not null default 'user',
  credits      integer not null default 10,
  total_generations integer not null default 0,
  created_at   timestamptz not null default now()
);

-- 2. PROJECTS
create table if not exists public.projects (
  id                    uuid primary key default gen_random_uuid(),
  user_id               uuid not null references public.users(id) on delete cascade,
  name                  text not null,
  clothing_image_urls   jsonb default '[]',
  gender                text default 'female',
  outfit_pieces         text,
  garment_type          text,
  garment_length        text,
  garment_fit           text,
  custom_instructions   text,
  age_range             text default '30-35',
  skin_tone             text default 'rich_cocoa',
  body_type             text default 'slim',
  hairstyle             text default 'afro',
  facial_hair           text default 'clean_shaven',
  makeup_level          text default 'natural',
  pose                  text default 'standing_power',
  background            text default 'studio_minimal',
  status                text not null default 'draft',
  generation_count      integer not null default 0,
  listing_title         text,
  listing_description   text,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

-- 3. GENERATED IMAGES
create table if not exists public.generated_images (
  id           uuid primary key default gen_random_uuid(),
  project_id   uuid not null references public.projects(id) on delete cascade,
  user_id      uuid not null references public.users(id) on delete cascade,
  image_url    text not null,
  prompt_used  text,
  pose         text,
  background   text,
  age_range    text,
  skin_tone    text,
  is_favorite  boolean not null default false,
  created_at   timestamptz not null default now()
);

-- 4. SAVED FLYERS
create table if not exists public.saved_flyers (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references public.users(id) on delete cascade,
  brand_name       text,
  campaign_type    text,
  brand_tone       text,
  platform         text,
  headline         text,
  subheadline      text,
  offer_text       text,
  cta_text         text,
  tagline          text,
  hashtags         jsonb default '[]',
  color_palette    jsonb default '{}',
  gradient_css     text,
  model_image_url  text,
  config_json      jsonb default '{}',
  created_at       timestamptz not null default now()
);

-- 5. TEMPLATES
create table if not exists public.templates (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  category     text,
  format       text,
  dimensions   jsonb default '{}',
  layout_data  jsonb default '{}',
  preview_url  text,
  is_premium   boolean not null default false
);

-- ============================================================
-- UPDATED_AT TRIGGER
-- ============================================================
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger projects_updated_at
  before update on public.projects
  for each row execute function public.handle_updated_at();

-- ============================================================
-- AUTO-CREATE USER PROFILE ON SIGNUP
-- ============================================================
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.users (id, email, full_name, role, credits, total_generations)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    'user',
    10,
    0
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

-- Enable RLS
alter table public.users enable row level security;
alter table public.projects enable row level security;
alter table public.generated_images enable row level security;
alter table public.saved_flyers enable row level security;
alter table public.templates enable row level security;

-- Users: can only read/update own profile
create policy "users_select_own" on public.users
  for select using (auth.uid() = id);
create policy "users_update_own" on public.users
  for update using (auth.uid() = id);
create policy "users_insert_own" on public.users
  for insert with check (auth.uid() = id);

-- Projects: full CRUD on own rows
create policy "projects_all_own" on public.projects
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Generated images: full CRUD on own rows
create policy "images_all_own" on public.generated_images
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Saved flyers: full CRUD on own rows
create policy "flyers_all_own" on public.saved_flyers
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Templates: everyone can read
create policy "templates_select_all" on public.templates
  for select using (true);

-- ============================================================
-- STORAGE BUCKET
-- ============================================================

-- Create the clothing-images bucket (run if it doesn't exist)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'clothing-images',
  'clothing-images',
  true,
  10485760,  -- 10 MB limit per file
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do nothing;

-- Storage policy: authenticated users can upload to their own folder
create policy "storage_upload_own" on storage.objects
  for insert with check (
    bucket_id = 'clothing-images' and auth.role() = 'authenticated'
  );

create policy "storage_select_public" on storage.objects
  for select using (bucket_id = 'clothing-images');

create policy "storage_delete_own" on storage.objects
  for delete using (
    bucket_id = 'clothing-images' and auth.role() = 'authenticated'
  );
