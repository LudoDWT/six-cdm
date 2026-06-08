-- Politiques RLS : lecture ouverte aux authentifiés, écriture des paris verrouillée au coup d'envoi
alter table profiles enable row level security;
alter table matches enable row level security;
alter table predictions enable row level security;
alter table bonus_questions enable row level security;
alter table bonus_predictions enable row level security;

-- profiles
create policy "profiles readable by authenticated"
  on profiles for select to authenticated using (true);
create policy "users manage own profile"
  on profiles for update to authenticated using (id = auth.uid());

-- matches : lecture seule côté client (écriture via clé service / MCP)
create policy "matches readable by authenticated"
  on matches for select to authenticated using (true);

-- predictions : lecture ouverte, écriture verrouillée au coup d'envoi
create policy "predictions readable by authenticated"
  on predictions for select to authenticated using (true);
create policy "users insert own prediction before kickoff"
  on predictions for insert to authenticated
  with check (
    user_id = auth.uid()
    and exists (select 1 from matches m where m.id = match_id and m.kickoff_at > now())
  );
create policy "users update own prediction before kickoff"
  on predictions for update to authenticated
  using (user_id = auth.uid())
  with check (
    user_id = auth.uid()
    and exists (select 1 from matches m where m.id = match_id and m.kickoff_at > now())
  );
create policy "users delete own prediction before kickoff"
  on predictions for delete to authenticated
  using (
    user_id = auth.uid()
    and exists (select 1 from matches m where m.id = match_id and m.kickoff_at > now())
  );

-- bonus_questions : lecture seule
create policy "bonus_questions readable by authenticated"
  on bonus_questions for select to authenticated using (true);

-- bonus_predictions : lecture ouverte, écriture verrouillée à lock_at
create policy "bonus_predictions readable by authenticated"
  on bonus_predictions for select to authenticated using (true);
create policy "users insert own bonus before lock"
  on bonus_predictions for insert to authenticated
  with check (
    user_id = auth.uid()
    and exists (select 1 from bonus_questions q where q.id = bonus_question_id and q.lock_at > now())
  );
create policy "users update own bonus before lock"
  on bonus_predictions for update to authenticated
  using (user_id = auth.uid())
  with check (
    user_id = auth.uid()
    and exists (select 1 from bonus_questions q where q.id = bonus_question_id and q.lock_at > now())
  );
