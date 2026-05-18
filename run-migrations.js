/**
 * Havillah LuxeModel AI — Supabase Migration Runner
 * Usage: node run-migrations.js YOUR_SUPABASE_PERSONAL_ACCESS_TOKEN
 * Get token at: https://supabase.com/dashboard/account/tokens
 */

import https from 'https'

const PROJECT_REF = 'duocobnsrtosajttekvq'
const TOKEN = process.argv[2]

if (!TOKEN) {
  console.error('\nUsage: node run-migrations.js YOUR_SUPABASE_PERSONAL_ACCESS_TOKEN\n')
  console.error('Get your token at: https://supabase.com/dashboard/account/tokens\n')
  process.exit(1)
}

const MIGRATIONS = [
  {
    name: '01_projects_table',
    sql: `
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
);`
  },
  {
    name: '02_generated_images_table',
    sql: `
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
);`
  },
  {
    name: '03_saved_flyers_table',
    sql: `
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
);`
  },
  {
    name: '04_templates_table',
    sql: `
create table if not exists public.templates (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  category     text,
  format       text,
  dimensions   jsonb default '{}',
  layout_data  jsonb default '{}',
  preview_url  text,
  is_premium   boolean not null default false
);`
  },
  {
    name: '05_updated_at_trigger',
    sql: `
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

do $$ begin
  if not exists (select 1 from pg_trigger where tgname = 'projects_updated_at') then
    create trigger projects_updated_at before update on public.projects
    for each row execute function public.handle_updated_at();
  end if;
end $$;`
  },
  {
    name: '06_auto_user_trigger',
    sql: `
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.users (id, email, full_name, role, credits, total_generations)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', ''), 'user', 10, 0)
  on conflict (id) do nothing;
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();`
  },
  {
    name: '07_rls_policies',
    sql: `
alter table public.projects enable row level security;
alter table public.generated_images enable row level security;
alter table public.saved_flyers enable row level security;
alter table public.templates enable row level security;

do $$ begin
  if not exists (select 1 from pg_policies where tablename='projects' and policyname='projects_all_own') then
    create policy "projects_all_own" on public.projects for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where tablename='generated_images' and policyname='images_all_own') then
    create policy "images_all_own" on public.generated_images for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where tablename='saved_flyers' and policyname='flyers_all_own') then
    create policy "flyers_all_own" on public.saved_flyers for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where tablename='templates' and policyname='templates_select_all') then
    create policy "templates_select_all" on public.templates for select using (true);
  end if;
end $$;`
  },
  {
    name: '08_storage_bucket',
    sql: `
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('clothing-images','clothing-images',true,10485760,array['image/jpeg','image/png','image/webp','image/gif'])
on conflict (id) do nothing;

do $$ begin
  if not exists (select 1 from pg_policies where tablename='objects' and policyname='storage_upload_own') then
    create policy "storage_upload_own" on storage.objects for insert with check (bucket_id='clothing-images' and auth.role()='authenticated');
  end if;
  if not exists (select 1 from pg_policies where tablename='objects' and policyname='storage_select_public') then
    create policy "storage_select_public" on storage.objects for select using (bucket_id='clothing-images');
  end if;
  if not exists (select 1 from pg_policies where tablename='objects' and policyname='storage_delete_own') then
    create policy "storage_delete_own" on storage.objects for delete using (bucket_id='clothing-images' and auth.role()='authenticated');
  end if;
end $$;`
  },
]

function runQuery(sql) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ query: sql })
    const req = https.request({
      hostname: 'api.supabase.com',
      path: `/v1/projects/${PROJECT_REF}/database/query`,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      }
    }, (res) => {
      let data = ''
      res.on('data', chunk => data += chunk)
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) resolve(data)
        else reject(new Error(`HTTP ${res.statusCode}: ${data}`))
      })
    })
    req.on('error', reject)
    req.write(body)
    req.end()
  })
}

async function main() {
  console.log(`\nRunning ${MIGRATIONS.length} migrations on project ${PROJECT_REF}...\n`)
  let passed = 0, failed = 0
  for (const m of MIGRATIONS) {
    try {
      await runQuery(m.sql)
      console.log(`  ✓ ${m.name}`)
      passed++
    } catch (err) {
      console.log(`  ✗ ${m.name}: ${err.message.slice(0,120)}`)
      failed++
    }
  }
  console.log(`\nDone: ${passed} passed, ${failed} failed\n`)
  if (failed === 0) {
    console.log('All tables, policies, and storage bucket are ready!')
    console.log('Your app is fully operational at https://havillah-luxemodel-ai.vercel.app\n')
  } else {
    console.log('Some migrations failed. Check the errors above.')
    console.log('You can also run supabase-schema.sql manually in the Supabase SQL Editor.\n')
  }
}

main()
