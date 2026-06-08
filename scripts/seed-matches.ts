/**
 * Source de vérité des matchs & résultats : src/data/matches.json
 *
 * Workflow de synchronisation vers Supabase (projet six-cdm) :
 *  1. Éditer src/data/matches.json (scores réels, équipes des phases finales, venues).
 *  2. Pousser vers la table `matches` via le MCP Supabase :
 *       update matches set home_score = <h>, away_score = <a>, status = 'finished'
 *       where id = <id>;
 *     (ou réappliquer un INSERT ... ON CONFLICT DO UPDATE généré depuis le JSON).
 *  3. Les vues SQL (prediction_points, bonus_points, leaderboard) recalculent
 *     automatiquement le classement.
 *
 * Les questions bonus (winner, finalist, top_scorer) se mettent à jour via :
 *   update bonus_questions set correct_answer = '<réponse>' where key = '<key>';
 */
export {}
