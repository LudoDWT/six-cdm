-- Vues de scoring et classement (security_invoker : appliquent les RLS de l'appelant)

-- Points par pronostic : 3 si score exact, 1 si bon résultat, 0 sinon, NULL si non joué
create or replace view prediction_points
with (security_invoker = true) as
select
  p.id, p.user_id, p.match_id,
  case
    when m.home_score is null or m.away_score is null then null
    when p.home_score = m.home_score and p.away_score = m.away_score then 3
    when sign(p.home_score - p.away_score) = sign(m.home_score - m.away_score) then 1
    else 0
  end as points
from predictions p
join matches m on m.id = p.match_id;

-- Points par bonus
create or replace view bonus_points
with (security_invoker = true) as
select
  bp.id, bp.user_id, bp.bonus_question_id,
  case
    when bq.correct_answer is not null and bp.answer = bq.correct_answer then bq.points
    else 0
  end as points
from bonus_predictions bp
join bonus_questions bq on bq.id = bp.bonus_question_id;

-- Classement agrégé par joueur
create or replace view leaderboard
with (security_invoker = true) as
select
  pr.id as user_id,
  pr.display_name,
  pr.avatar_url,
  coalesce(mp.match_points, 0) as match_points,
  coalesce(bn.bonus_points, 0) as bonus_points,
  coalesce(mp.match_points, 0) + coalesce(bn.bonus_points, 0) as total_points,
  coalesce(mp.exact_count, 0) as exact_count,
  coalesce(mp.result_count, 0) as result_count
from profiles pr
left join (
  select user_id,
    sum(points) as match_points,
    count(*) filter (where points = 3) as exact_count,
    count(*) filter (where points >= 1) as result_count
  from prediction_points where points is not null
  group by user_id
) mp on mp.user_id = pr.id
left join (
  select user_id, sum(points) as bonus_points
  from bonus_points group by user_id
) bn on bn.user_id = pr.id;
