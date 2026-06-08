-- Cagnotte : contributions déclaratives (tranches de 10€), une ligne par joueur.
create table contributions (
  user_id uuid primary key references profiles(id) on delete cascade,
  amount int not null default 0 check (amount >= 0 and amount % 10 = 0),
  updated_at timestamptz not null default now()
);

alter table contributions enable row level security;

create policy "contributions readable by authenticated"
  on contributions for select to authenticated using (true);
create policy "users insert own contribution"
  on contributions for insert to authenticated
  with check (user_id = (select auth.uid()));
create policy "users update own contribution"
  on contributions for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));
