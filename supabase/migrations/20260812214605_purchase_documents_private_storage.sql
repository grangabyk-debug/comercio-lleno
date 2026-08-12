alter table public.purchases
  add constraint purchases_id_company_unique unique (id, company_id);

create table public.purchase_documents (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  purchase_id uuid not null,
  storage_path text not null unique,
  file_name text not null,
  mime_type text,
  size_bytes bigint not null default 0 check (size_bytes >= 0),
  uploaded_by uuid default auth.uid(),
  created_at timestamptz not null default now(),
  constraint purchase_documents_purchase_company_fk
    foreign key (purchase_id, company_id)
    references public.purchases(id, company_id)
    on delete cascade
);

alter table public.purchase_documents enable row level security;
create policy tenant_all on public.purchase_documents
  for all to authenticated
  using (company_id = public.current_user_company_id())
  with check (company_id = public.current_user_company_id());

revoke all on public.purchase_documents from anon;
grant select, insert, delete on public.purchase_documents to authenticated;
create index purchase_documents_purchase_idx on public.purchase_documents(purchase_id, created_at);
create index purchase_documents_company_idx on public.purchase_documents(company_id);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'purchase-documents',
  'purchase-documents',
  false,
  15728640,
  array['image/jpeg','image/png','image/webp','image/heic','image/heif','application/pdf']::text[]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy commerce_purchase_docs_select on storage.objects
  for select to authenticated
  using (
    bucket_id = 'purchase-documents'
    and (storage.foldername(name))[1] = public.current_user_company_id()::text
  );

create policy commerce_purchase_docs_insert on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'purchase-documents'
    and (storage.foldername(name))[1] = public.current_user_company_id()::text
    and owner_id = (select auth.uid()::text)
  );

create policy commerce_purchase_docs_delete on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'purchase-documents'
    and (storage.foldername(name))[1] = public.current_user_company_id()::text
    and owner_id = (select auth.uid()::text)
  );
