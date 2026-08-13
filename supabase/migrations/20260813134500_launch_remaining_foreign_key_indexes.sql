create index if not exists cash_register_history_closed_by_idx on public.cash_register_history(closed_by) where closed_by is not null;
create index if not exists cash_register_history_opened_by_idx on public.cash_register_history(opened_by) where opened_by is not null;
create index if not exists cash_registers_closed_by_idx on public.cash_registers(closed_by) where closed_by is not null;
create index if not exists cash_registers_opened_by_idx on public.cash_registers(opened_by) where opened_by is not null;
create index if not exists finance_expenses_branch_idx on public.finance_expenses(branch_id) where branch_id is not null;
create index if not exists finance_expenses_created_by_idx on public.finance_expenses(created_by) where created_by is not null;
create index if not exists price_history_company_idx on public.price_history(company_id);
create index if not exists purchase_documents_purchase_company_fk_idx on public.purchase_documents(purchase_id, company_id);
