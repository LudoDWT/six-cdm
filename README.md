# six-cdm ⚽🎉

Site de pronostics entre amis pour la **Coupe du Monde de football 2026**
(Canada / Mexique / USA). Chaque joueur pronostique le score exact de chaque
match jusqu'au coup d'envoi, gagne des points et grimpe au classement. Des
bonus « tournoi » (vainqueur, meilleur buteur…) complètent le jeu.

## Stack

- **Vite + React + TypeScript**
- **TanStack Router** (routing) + **TanStack Query** (état serveur)
- **Zustand** (état UI)
- **Supabase** (Postgres + Auth Google + RLS)
- **Tailwind CSS v4 + shadcn/ui**
- **GitHub Actions → GitHub Pages** (déploiement)

## Règles du jeu

- **Barème** : bon résultat (vainqueur / nul) = **1 pt**, score exact = **3 pts**
  (le score exact remplace, ne se cumule pas).
- Les pronostics sont **modifiables jusqu'au coup d'envoi** (verrou garanti
  côté base par les politiques RLS), puis figés.
- Les pronostics sont **visibles par tous** à tout moment.
- **Bonus tournoi** : vainqueur (10 pts), finaliste perdant (5 pts),
  meilleur buteur (8 pts), verrouillés au coup d'envoi du 1er match.

## Développement local

```bash
pnpm install
cp .env.example .env   # puis renseigner les variables (voir ci-dessous)
pnpm dev               # http://localhost:5173/six-cdm/
pnpm test              # tests Vitest
pnpm build             # build de production (génère aussi dist/404.html)
```

### Variables d'environnement (`.env`)

```
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<clé publishable / anon>
```

Ces variables sont **publiques** (incluses dans le bundle client) : la sécurité
repose sur les politiques **RLS** de Supabase, pas sur leur confidentialité.

## Base de données (Supabase)

Le schéma, les vues de scoring et les politiques RLS sont versionnés dans
`supabase/migrations/`. Tables : `profiles`, `matches`, `predictions`,
`bonus_questions`, `bonus_predictions`. Vues : `prediction_points`,
`bonus_points`, `leaderboard`.

### Source de vérité des matchs & résultats

`src/data/matches.json` contient les 104 matchs (calendrier officiel FIFA).
C'est la **source de vérité humaine**. Workflow de mise à jour des résultats
(voir aussi `scripts/seed-matches.ts`) :

1. Éditer `src/data/matches.json` (scores réels, équipes des phases finales).
2. Synchroniser vers Supabase (table `matches`), par ex. :
   ```sql
   update matches set home_score = 2, away_score = 1, status = 'finished'
   where id = 1;
   ```
3. Les vues SQL recalculent automatiquement le classement.

Renseigner la bonne réponse d'un bonus :
```sql
update bonus_questions set correct_answer = '<réponse>' where key = 'winner';
```

## Déploiement (GitHub Pages)

Le site est servi sous le base path **`/six-cdm/`** et déployé automatiquement
par GitHub Actions (`.github/workflows/deploy.yml`) à chaque push sur `main`.

### Configuration unique (à faire dans les consoles)

1. **GitHub → Settings → Pages** : source = **GitHub Actions**.
2. **GitHub → Settings → Secrets and variables → Actions** : ajouter les
   secrets `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY`.
3. **Google Cloud Console** : créer un identifiant OAuth 2.0 (Web), récupérer
   *Client ID* et *Client secret*.
4. **Supabase → Authentication → Providers → Google** : activer et coller le
   Client ID / Secret.
5. **Supabase → Authentication → URL Configuration** :
   - *Site URL* : `https://ludodwt.github.io/six-cdm/`
   - *Redirect URLs* : ajouter `https://ludodwt.github.io/six-cdm/` (et
     `http://localhost:5173/six-cdm/` pour le dev local).

Une fois ces étapes faites, la connexion Google et le déploiement fonctionnent.

## Structure

```
src/
  data/matches.json     # calendrier (source de vérité)
  lib/                  # supabase, scoring, lock, format, stages, flags
  hooks/                # useAuth + hooks TanStack Query
  stores/ui.ts          # filtres (Zustand)
  components/           # AppLayout, MatchCard, PredictionForm, Countdown, ...
  routes/               # login, index (dashboard), matchs, match.$id, classement, bonus, profil
  router.tsx            # routing TanStack (basepath /six-cdm)
supabase/migrations/    # schéma, trigger, vues, RLS
docs/superpowers/       # spec & plan d'implémentation
```
