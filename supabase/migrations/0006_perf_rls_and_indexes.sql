-- Optimisations de performance (advisors Supabase)
-- 1) Index sur les FK non couvertes
create index if not exists idx_predictions_match_id on predictions(match_id);
create index if not exists idx_bonus_predictions_question_id on bonus_predictions(bonus_question_id);

-- 2) (select auth.uid()) au lieu de auth.uid() : évite la réévaluation par ligne dans les RLS
drop policy "users manage own profile" on profiles;
create policy "users manage own profile"
  on profiles for update to authenticated using (id = (select auth.uid()));

drop policy "users insert own prediction before kickoff" on predictions;
create policy "users insert own prediction before kickoff"
  on predictions for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and exists (select 1 from matches m where m.id = match_id and m.kickoff_at > now())
  );

drop policy "users update own prediction before kickoff" on predictions;
create policy "users update own prediction before kickoff"
  on predictions for update to authenticated
  using (user_id = (select auth.uid()))
  with check (
    user_id = (select auth.uid())
    and exists (select 1 from matches m where m.id = match_id and m.kickoff_at > now())
  );

drop policy "users delete own prediction before kickoff" on predictions;
create policy "users delete own prediction before kickoff"
  on predictions for delete to authenticated
  using (
    user_id = (select auth.uid())
    and exists (select 1 from matches m where m.id = match_id and m.kickoff_at > now())
  );

drop policy "users insert own bonus before lock" on bonus_predictions;
create policy "users insert own bonus before lock"
  on bonus_predictions for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and exists (select 1 from bonus_questions q where q.id = bonus_question_id and q.lock_at > now())
  );

drop policy "users update own bonus before lock" on bonus_predictions;
create policy "users update own bonus before lock"
  on bonus_predictions for update to authenticated
  using (user_id = (select auth.uid()))
  with check (
    user_id = (select auth.uid())
    and exists (select 1 from bonus_questions q where q.id = bonus_question_id and q.lock_at > now())
  );
