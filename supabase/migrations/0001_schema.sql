-- Schéma initial six-cdm : profiles, matches, predictions, bonus_questions, bonus_predictions
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  avatar_url text,
  created_at timestamptz not null default now()
);

create table matches (
  id int primary key,
  stage text not null check (stage in
    ('group','round_of_32','round_of_16','quarter','semi','third_place','final')),
  group_name text,
  home_team text not null,
  away_team text not null,
  kickoff_at timestamptz not null,
  venue text not null,
  home_score int check (home_score >= 0),
  away_score int check (away_score >= 0),
  status text not null default 'scheduled'
    check (status in ('scheduled','live','finished'))
);

create table predictions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  match_id int not null references matches(id) on delete cascade,
  home_score int not null check (home_score >= 0),
  away_score int not null check (away_score >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, match_id)
);

create table bonus_questions (
  id int primary key generated always as identity,
  key text unique not null,
  label text not null,
  type text not null check (type in ('team','player','text')),
  lock_at timestamptz not null,
  correct_answer text,
  points int not null
);

create table bonus_predictions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  bonus_question_id int not null references bonus_questions(id) on delete cascade,
  answer text not null,
  unique (user_id, bonus_question_id)
);
