create table if not exists public.whatsapp_ai_training_examples (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  source_message_id uuid,
  customer_text text not null check (char_length(customer_text) between 1 and 1500),
  ai_response text not null check (char_length(ai_response) between 1 and 4000),
  rating smallint not null check (rating in (-1, 1)),
  corrected_response text check (corrected_response is null or char_length(corrected_response) between 1 and 4000),
  active boolean not null default true,
  created_by uuid not null default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (company_id, source_message_id)
);

alter table public.whatsapp_ai_training_examples enable row level security;

grant select, insert, update, delete on public.whatsapp_ai_training_examples to authenticated;
grant all on public.whatsapp_ai_training_examples to service_role;

drop policy if exists whatsapp_ai_training_examples_owner on public.whatsapp_ai_training_examples;
create policy whatsapp_ai_training_examples_owner
on public.whatsapp_ai_training_examples
for all
to authenticated
using (
  company_id = current_user_company_id()
  and current_user_role() = 'owner'
)
with check (
  company_id = current_user_company_id()
  and current_user_role() = 'owner'
  and created_by = auth.uid()
);

create index if not exists whatsapp_ai_training_examples_company_created_idx
on public.whatsapp_ai_training_examples (company_id, created_at desc);
