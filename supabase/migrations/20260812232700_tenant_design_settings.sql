alter table public.companies
  add column if not exists design_settings jsonb not null
  default '{"colorTheme":"emerald","fontSize":"standard","fontWeight":"balanced","fontFamily":"modern"}'::jsonb;

update public.companies
set design_settings = coalesce(design_settings, '{}'::jsonb) || jsonb_build_object(
  'colorTheme', coalesce(design_settings->>'colorTheme','emerald'),
  'fontSize', coalesce(design_settings->>'fontSize','standard'),
  'fontWeight', coalesce(design_settings->>'fontWeight','balanced'),
  'fontFamily', coalesce(design_settings->>'fontFamily','modern')
);
