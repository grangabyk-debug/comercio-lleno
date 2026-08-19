-- PREVIEW ONLY. This file is intentionally outside supabase/migrations and is NOT applied automatically.
-- Review before promoting to a real migration.

create table if not exists public.pm_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  primary_role text not null default 'candidate' check (primary_role in ('candidate','employer','owner')),
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.pm_companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  tax_id text,
  website text,
  verification_status text not null default 'pending' check (verification_status in ('pending','verified','rejected','suspended')),
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now()
);

create table if not exists public.pm_company_members (
  company_id uuid not null references public.pm_companies(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('owner','admin','recruiter','hiring_manager','viewer')),
  status text not null default 'active' check (status in ('invited','active','disabled')),
  created_at timestamptz not null default now(),
  primary key(company_id,user_id)
);

create table if not exists public.pm_candidate_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  city text,
  headline text,
  preferences jsonb not null default '{}'::jsonb,
  consent_searchable boolean not null default false,
  updated_at timestamptz not null default now()
);

create table if not exists public.pm_jobs (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.pm_companies(id) on delete cascade,
  title text not null,
  location_text text,
  work_mode text,
  schedule text,
  description text not null,
  status text not null default 'draft' check (status in ('draft','review','published','paused','closed')),
  created_by uuid not null references auth.users(id),
  published_at timestamptz,
  closes_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.pm_external_jobs (
  id uuid primary key default gen_random_uuid(),
  source_name text not null,
  canonical_url text not null unique,
  hiring_organization text not null,
  title text not null,
  location_text text,
  summary text,
  checked_at timestamptz not null,
  expires_at timestamptz,
  status text not null default 'active' check (status in ('active','expired','removed'))
);

create table if not exists public.pm_job_questions (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.pm_jobs(id) on delete cascade,
  label text not null,
  answer_type text not null check (answer_type in ('boolean','number','text','single_choice','file')),
  requirement_level text not null default 'preferred' check (requirement_level in ('required','preferred','informational')),
  job_relevance_reason text not null,
  sort_order int not null default 0
);

create table if not exists public.pm_applications (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.pm_jobs(id) on delete cascade,
  candidate_user_id uuid not null references auth.users(id) on delete cascade,
  resume_path text,
  cover_letter text,
  status text not null default 'submitted' check (status in ('draft','submitted','viewed','shortlist','interview','rejected','hired','withdrawn')),
  consent_share boolean not null default true,
  submitted_at timestamptz,
  created_at timestamptz not null default now(),
  unique(job_id,candidate_user_id)
);

create table if not exists public.pm_application_answers (
  application_id uuid not null references public.pm_applications(id) on delete cascade,
  question_id uuid not null references public.pm_job_questions(id) on delete cascade,
  answer jsonb not null,
  primary key(application_id,question_id)
);

create table if not exists public.pm_saved_jobs (
  candidate_user_id uuid not null references auth.users(id) on delete cascade,
  job_id uuid references public.pm_jobs(id) on delete cascade,
  external_job_id uuid references public.pm_external_jobs(id) on delete cascade,
  created_at timestamptz not null default now(),
  check ((job_id is not null)::int + (external_job_id is not null)::int = 1)
);

create table if not exists public.pm_candidate_matches (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.pm_applications(id) on delete cascade,
  score numeric(5,2),
  reasons jsonb not null default '[]'::jsonb,
  missing_evidence jsonb not null default '[]'::jsonb,
  model_version text,
  created_at timestamptz not null default now()
);

create table if not exists public.pm_handoffs (
  id uuid primary key default gen_random_uuid(),
  candidate_user_id uuid not null references auth.users(id) on delete cascade,
  external_job_id uuid not null references public.pm_external_jobs(id) on delete cascade,
  consent_text text not null,
  consented_at timestamptz not null,
  employer_channel_status text not null default 'unverified' check (employer_channel_status in ('unverified','authorized','invalid','sent')),
  reviewed_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

alter table public.pm_profiles enable row level security;
alter table public.pm_companies enable row level security;
alter table public.pm_company_members enable row level security;
alter table public.pm_candidate_profiles enable row level security;
alter table public.pm_jobs enable row level security;
alter table public.pm_applications enable row level security;
alter table public.pm_application_answers enable row level security;
alter table public.pm_saved_jobs enable row level security;
alter table public.pm_candidate_matches enable row level security;
alter table public.pm_handoffs enable row level security;

create or replace function public.pm_is_company_member(target_company uuid, allowed_roles text[] default array['owner','admin','recruiter','hiring_manager','viewer']) returns boolean
language sql stable security definer set search_path=public as $$
  select exists(select 1 from public.pm_company_members m where m.company_id=target_company and m.user_id=auth.uid() and m.status='active' and m.role=any(allowed_roles));
$$;

create policy pm_profile_self on public.pm_profiles for all using (user_id=auth.uid()) with check (user_id=auth.uid());
create policy pm_candidate_self on public.pm_candidate_profiles for all using (user_id=auth.uid()) with check (user_id=auth.uid());
create policy pm_company_member_read on public.pm_companies for select using (public.pm_is_company_member(id));
create policy pm_company_member_jobs on public.pm_jobs for select using (public.pm_is_company_member(company_id));
create policy pm_job_public_read on public.pm_jobs for select using (status='published');
create policy pm_job_manage on public.pm_jobs for all using (public.pm_is_company_member(company_id,array['owner','admin','recruiter'])) with check (public.pm_is_company_member(company_id,array['owner','admin','recruiter']));
create policy pm_application_candidate_read on public.pm_applications for select using (candidate_user_id=auth.uid());
create policy pm_application_candidate_insert on public.pm_applications for insert with check (candidate_user_id=auth.uid());
create policy pm_application_company_read on public.pm_applications for select using (exists(select 1 from public.pm_jobs j where j.id=job_id and public.pm_is_company_member(j.company_id)));
create policy pm_saved_self on public.pm_saved_jobs for all using (candidate_user_id=auth.uid()) with check (candidate_user_id=auth.uid());
create policy pm_match_candidate_read on public.pm_candidate_matches for select using (exists(select 1 from public.pm_applications a where a.id=application_id and a.candidate_user_id=auth.uid()));
create policy pm_match_company_read on public.pm_candidate_matches for select using (exists(select 1 from public.pm_applications a join public.pm_jobs j on j.id=a.job_id where a.id=application_id and public.pm_is_company_member(j.company_id)));
create policy pm_handoff_candidate_read on public.pm_handoffs for select using (candidate_user_id=auth.uid());

-- Intentionally no client INSERT/UPDATE policies on AI matches, owner handoffs review or audit outputs.
-- Those operations must be performed server-side after authorization checks.
