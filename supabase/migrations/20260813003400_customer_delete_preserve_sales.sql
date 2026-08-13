alter table public.sales drop constraint if exists sales_customer_id_fkey;
alter table public.sales add constraint sales_customer_id_fkey foreign key (customer_id) references public.customers(id) on delete set null;
