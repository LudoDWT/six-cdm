import { Link } from '@tanstack/react-router'
import { useMatches } from '@/hooks/useMatches'
import { usePredictions } from '@/hooks/usePredictions'
import { useLeaderboard } from '@/hooks/useLeaderboard'
import { useAuth } from '@/hooks/useAuth'
import { isLocked } from '@/lib/lock'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function DashboardPage() {
  const { data: matches, isLoading: matchesLoading } = useMatches()
  const { data: predictions, isLoading: predsLoading } = usePredictions()
  const { data: leaderboard, isLoading: lbLoading } = useLeaderboard()
  const { session } = useAuth()

  const isLoading = matchesLoading || predsLoading || lbLoading
  const userId = session?.user.id

  // Matches not locked + without current user prediction, sorted by kickoff, up to 5
  const upcomingMatches = (() => {
    if (!matches || !userId) return []
    const predictedMatchIds = new Set(
      (predictions ?? []).filter((p) => p.user_id === userId).map((p) => p.match_id),
    )
    return matches
      .filter((m) => !isLocked(m.kickoff_at) && !predictedMatchIds.has(m.id))
      .slice(0, 5)
  })()

  // Current user rank and total
  const myRank = (() => {
    if (!leaderboard || !userId) return null
    const idx = leaderboard.findIndex((r) => r.user_id === userId)
    if (idx === -1) return null
    return { rank: idx + 1, total: leaderboard[idx].total_points ?? 0 }
  })()

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Tableau de bord</h1>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Mon rang</CardTitle>
          </CardHeader>
          <CardContent>
            {lbLoading ? (
              <span className="text-muted-foreground text-sm">Chargement…</span>
            ) : myRank ? (
              <div className="space-y-1">
                <p className="text-3xl font-bold">#{myRank.rank}</p>
                <p className="text-sm text-muted-foreground">{myRank.total} pts</p>
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">Pas encore classé</p>
            )}
          </CardContent>
        </Card>

        <Card className="sm:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Accès rapides</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Link to="/matchs" className={buttonVariants({ variant: 'outline', size: 'sm' })}>Matchs</Link>
            <Link to="/classement" className={buttonVariants({ variant: 'outline', size: 'sm' })}>Classement</Link>
            <Link to="/bonus" className={buttonVariants({ variant: 'outline', size: 'sm' })}>Bonus</Link>
          </CardContent>
        </Card>
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Prochains matchs à pronostiquer</h2>
        {isLoading ? (
          <p className="text-muted-foreground text-sm">Chargement…</p>
        ) : upcomingMatches.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            Tous les prochains matchs ont déjà un prono, ou aucun match à venir.
          </p>
        ) : (
          <div className="space-y-2">
            {upcomingMatches.map((match) => (
              <Card key={match.id}>
                <CardContent className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium">
                      {match.home_team} vs {match.away_team}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(match.kickoff_at).toLocaleString('fr-FR', {
                        weekday: 'short',
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                  <Link
                    to="/match/$id"
                    params={{ id: String(match.id) }}
                    className={buttonVariants({ variant: 'outline', size: 'sm' })}
                  >
                    Pronostiquer
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
