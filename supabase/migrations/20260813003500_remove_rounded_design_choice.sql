update public.companies
set design_settings = jsonb_set(design_settings, '{fontFamily}', '"modern"'::jsonb, true)
where design_settings->>'fontFamily' = 'rounded';
