-- Verrou à la journée : un pari est modifiable tant que le jour du match (heure de
-- Paris) est strictement futur. Les matchs du jour J se verrouillent à minuit (Paris)
-- le jour J ; il faut parier la veille au plus tard.
drop policy "users insert own prediction before kickoff" on predictions;
create policy "users insert own prediction before kickoff"
  on predictions for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and exists (
      select 1 from matches m
      where m.id = match_id
        and (m.kickoff_at at time zone 'Europe/Paris')::date > (now() at time zone 'Europe/Paris')::date
    )
  );

drop policy "users update own prediction before kickoff" on predictions;
create policy "users update own prediction before kickoff"
  on predictions for update to authenticated
  using (user_id = (select auth.uid()))
  with check (
    user_id = (select auth.uid())
    and exists (
      select 1 from matches m
      where m.id = match_id
        and (m.kickoff_at at time zone 'Europe/Paris')::date > (now() at time zone 'Europe/Paris')::date
    )
  );

drop policy "users delete own prediction before kickoff" on predictions;
create policy "users delete own prediction before kickoff"
  on predictions for delete to authenticated
  using (
    user_id = (select auth.uid())
    and exists (
      select 1 from matches m
      where m.id = match_id
        and (m.kickoff_at at time zone 'Europe/Paris')::date > (now() at time zone 'Europe/Paris')::date
    )
  );
