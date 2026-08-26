alter table public.pm_flex_posts add column if not exists listing_type text not null default 'request';
alter table public.pm_flex_posts add column if not exists availability_text text;

update public.pm_flex_posts
set listing_type='request'
where listing_type is null or listing_type not in ('request','offer');

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname='pm_flex_posts_listing_type_check'
      and conrelid='public.pm_flex_posts'::regclass
  ) then
    alter table public.pm_flex_posts
      add constraint pm_flex_posts_listing_type_check
      check (listing_type in ('request','offer'));
  end if;
end $$;

create index if not exists pm_flex_posts_status_listing_type_idx
  on public.pm_flex_posts(status,listing_type,created_at desc);

create or replace view public.pm_flex_posts_public
with (security_barrier=true)
as
select
  id,
  title,
  category,
  description,
  location_text,
  compensation_text,
  duration_text,
  scheduled_for,
  verification_level,
  status,
  created_at,
  company_id,
  image_path,
  image_source,
  image_status,
  public_identity,
  publisher_kind,
  publisher_display_name,
  case
    when publisher_kind='company'::text then publisher_avatar_url
    when publisher_avatar_url ~* '^https?://'::text then publisher_avatar_url
    else null::text
  end as publisher_avatar_url,
  allow_phone_contact,
  listing_type,
  availability_text
from public.pm_flex_posts
where status='published'::text;