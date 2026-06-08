# Six-CDM — Site de pronostics Coupe du Monde 2026

**Date :** 2026-06-08
**Statut :** Spec validée, prête pour le plan d'implémentation
**Repo :** `git@github.com:LudoDWT/six-cdm.git`
**Déploiement :** GitHub Pages (base path `/six-cdm/`)

## Objectif

Site de pronostics entre amis pour la Coupe du Monde de football 2026
(Canada / Mexique / USA, 104 matchs). Chaque joueur pronostique le score
exact de chaque match jusqu'au coup d'envoi, gagne des points selon un
barème, et un classement (ladder) départage le groupe. Des bonus
« tournoi » (vainqueur, meilleur buteur…) complètent le jeu.

## Périmètre v1

**Inclus :**
- Authentification Google OAuth (via Supabase Auth)
- Calendrier des 104 matchs (source : PDF officiel FIFA)
- Saisie/édition d'un pronostic de score par match, **verrouillé au coup d'envoi**
- Barème : **bon résultat = 1 pt, score exact = 3 pts** (le score exact remplace, ne se cumule pas)
- Pronostics de tous les joueurs **visibles par tous, à tout moment**
- Bonus tournoi (vainqueur, finaliste, meilleur buteur) verrouillés au coup d'envoi du 1er match
- Classement (ladder) global du groupe
- Profil (pseudo, avatar)

**Hors périmètre v1 (YAGNI) :**
- Ligues/groupes multiples (un seul classement global)
- Inscription publique ouverte (cercle privé)
- API de foot tierce automatique (résultats saisis manuellement via JSON → Supabase)
- Notifications, chat, commentaires

## Audience & accès

- Cercle privé d'amis (~5 à 50 personnes)
- Connexion Google OAuth ; tout compte Google connecté crée un profil
  (pas de système d'invitation/code en v1, à ajouter plus tard si besoin)

## Contraintes techniques

- **GitHub Pages = hébergement statique** : aucune logique serveur.
  L'app est une SPA Vite/React qui parle **directement à Supabase** depuis
  le navigateur (clé anonyme publique + sécurité par RLS). C'est le mode
  d'usage normal et sûr de Supabase.
- Base path `/six-cdm/` (config Vite + TanStack Router).
- SPA sur GitHub Pages : fallback 404 → index.html (copie de `index.html`
  en `404.html` au build) pour gérer le routing client.
- Déploiement automatisé via **GitHub Actions → branche `gh-pages`**.

## Stack

- **Vite + React + TypeScript**
- **TanStack Router** (routing, type-safe, base path) + **TanStack Query**
  (état serveur Supabase : cache, refetch, invalidation)
- **Zustand** (état UI léger : thème, filtres de calendrier)
- **Supabase** : Postgres + Auth (Google OAuth) + RLS
- **shadcn/ui + Tailwind CSS** (UI ; design via skill `frontend-design` + MCP shadcn)
- **GitHub Actions** (CI build + déploiement Pages)

## Architecture

### Source de vérité des matchs & résultats

- `src/data/matches.json` dans le repo = **source de vérité humaine** des
  104 matchs (n°, phase, groupe, équipes, kickoff, stade) et de leurs
  résultats (`null`/TBD au départ).
- Workflow résultats : l'utilisateur fournit les scores → mise à jour de
  `matches.json` (commit) **et** synchronisation vers la table `matches` de
  Supabase via MCP. Les vues SQL recalculent automatiquement le classement.
- Raison du double stockage : le JSON reste éditable/versionné dans le repo
  (workflow voulu), mais les `kickoff_at` et résultats vivent aussi en base
  pour que le **verrouillage au coup d'envoi (RLS)** et le **calcul du
  classement** soient fiables côté serveur, pas seulement dans le navigateur.

### Modèle de données (Postgres / Supabase)

**`profiles`**
- `id` uuid PK (= `auth.users.id`)
- `display_name` text
- `avatar_url` text null
- `created_at` timestamptz default now()

**`matches`** (synchronisé depuis `matches.json`)
- `id` int PK (= numéro de match FIFA)
- `stage` text (`group` | `round_of_32` | `round_of_16` | `quarter` | `semi` | `third_place` | `final`)
- `group_name` text null (A..L pour la phase de groupes)
- `home_team` text
- `away_team` text
- `kickoff_at` timestamptz
- `venue` text
- `home_score` int null (null = match non joué / TBD)
- `away_score` int null
- `status` text (`scheduled` | `live` | `finished`)

**`predictions`**
- `id` uuid PK default gen_random_uuid()
- `user_id` uuid FK → profiles.id
- `match_id` int FK → matches.id
- `home_score` int (≥ 0)
- `away_score` int (≥ 0)
- `created_at`, `updated_at` timestamptz
- **UNIQUE (user_id, match_id)**

**`bonus_questions`**
- `id` int PK
- `key` text unique (ex : `winner`, `finalist`, `top_scorer`)
- `label` text
- `type` text (`team` | `player` | `text`)
- `lock_at` timestamptz (coup d'envoi du 1er match)
- `correct_answer` text null
- `points` int (ex : winner=10, finalist=5, top_scorer=8)

**`bonus_predictions`**
- `id` uuid PK default gen_random_uuid()
- `user_id` uuid FK → profiles.id
- `bonus_question_id` int FK → bonus_questions.id
- `answer` text
- **UNIQUE (user_id, bonus_question_id)**

### Vues SQL

**`prediction_points`** — points par pronostic
- Joint `predictions` × `matches`
- `NULL` si match non joué (`home_score` ou `away_score` null)
- `3` si score exact (home/away pronostiqué == réel)
- sinon `1` si bon résultat (même signe de `home-away` : victoire dom / nul / victoire ext)
- sinon `0`

**`bonus_points`** — points par bonus
- `points` si `answer == correct_answer` (et `correct_answer` non null), sinon `0`

**`leaderboard`** — agrégat par joueur
- `user_id`, `display_name`, `avatar_url`
- `match_points` = SUM(prediction_points)
- `bonus_points` = SUM(bonus_points)
- `total_points`
- `exact_count`, `result_count` (stats secondaires pour départage/affichage)
- trié par `total_points` desc

### Sécurité (RLS)

- **`profiles`** : lecture pour tous les utilisateurs authentifiés ;
  insert/update de sa propre ligne uniquement.
- **`matches`** : lecture pour tous ; écriture interdite côté client
  (mises à jour via MCP / clé service uniquement).
- **`predictions`** :
  - SELECT : ouvert à tous les authentifiés (pronos visibles tout le temps).
  - INSERT/UPDATE : `user_id = auth.uid()` **ET** le match correspondant a
    `kickoff_at > now()` (verrou au coup d'envoi, garanti en base).
  - DELETE : sa propre ligne, même condition de kickoff.
- **`bonus_predictions`** :
  - SELECT : ouvert à tous les authentifiés.
  - INSERT/UPDATE : `user_id = auth.uid()` ET la question a `lock_at > now()`.
- **`bonus_questions`** : lecture pour tous ; écriture via MCP/service uniquement.
- Trigger : création automatique d'un `profiles` à l'inscription
  (`on auth.users` → insert profile avec `display_name` issu des métadonnées Google).

### Frontend — pages & flux

- **/login** — bouton Google OAuth (redirect vers `https://ludodwt.github.io/six-cdm/`)
- **/** (Dashboard) — prochains matchs à pronostiquer, mon rang, raccourcis
- **/matchs** (Calendrier) — liste filtrable (groupe / phase / date), carte par
  match avec compte à rebours, formulaire de prono inline, état verrouillé
  après kickoff
- **/match/:id** — détail d'un match + table des pronos de tous les joueurs
- **/classement** — le ladder (total, points matchs, points bonus, score exact count)
- **/bonus** — formulaire des pronos tournoi, verrouillé après lock_at
- **/profil** — pseudo, avatar, récap de mes pronos et points

Flux de données : TanStack Query encapsule les appels Supabase (queries +
mutations). Mutations de prono → invalidation des queries `predictions` et
`leaderboard`. Zustand gère seulement l'état UI (filtres calendrier, thème).

### Direction artistique

« Festival + foot » : ambiance vibrante et festive évoquant la fête du
stade et les 3 pays hôtes (USA / Mexique / Canada). Couleurs chaudes et
énergiques, accents graphiques festifs, micro-animations à la validation
d'un prono, cartes de match dynamiques. Exploration visuelle détaillée
réalisée avec le skill `frontend-design` + MCP shadcn lors de
l'implémentation.

## Déploiement

- `vite.config.ts` : `base: '/six-cdm/'`
- Build : copie de `404.html` pour le fallback SPA
- GitHub Actions : build sur push `main` → publication sur `gh-pages`
- Variables : `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (publiques, OK
  côté client car protégées par RLS) injectées au build via secrets GitHub.
- Supabase Auth : URL de redirection autorisée = URL GitHub Pages ; client
  OAuth Google configuré dans la console Google + Supabase.

## Risques & décisions

- **Pas d'API serveur (statique)** → toute la logique sensible (verrou,
  score) est en base via RLS et vues SQL. Décision validée.
- **Données FIFA** : extraites du PDF officiel ; équipes/horaires figés au
  draw (connus à la date de build, J-3 du tournoi).
- **Sécurité du verrou** : repose sur `now()` côté Postgres comparé à
  `kickoff_at` — fiable, indépendant de l'horloge du client.
- **Synchro résultats** : manuelle via MCP ; acceptable pour un usage entre amis.

## Critères de succès

- Un joueur se connecte (Google), pronostique des scores, ne peut plus
  modifier après le coup d'envoi.
- Les résultats saisis mettent à jour le classement automatiquement.
- Le classement reflète correctement le barème 1/3 + bonus.
- Le site est déployé et accessible sur GitHub Pages.
