import { Link } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'
import { useMatches } from '@/hooks/useMatches'
import { usePredictions } from '@/hooks/usePredictions'
import { useLeaderboard } from '@/hooks/useLeaderboard'
import { useAuth } from '@/hooks/useAuth'
import { isLocked } from '@/lib/lock'
import { teamFlag } from '@/lib/flags'
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
    <div className="space-y-8">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-primary p-6 text-primary-foreground sm:p-8">
        <div className="field-glow pointer-events-none absolute inset-0" />
        <div className="relative z-10">
          <p className="font-display text-xs tracking-[0.25em] text-primary-foreground/70">
            TABLEAU DE BORD
          </p>
          <h1 className="mt-1 font-display text-4xl leading-none sm:text-5xl">
            Allez, on pronostique !
          </h1>
          {myRank ? (
            <p className="mt-3 text-sm text-primary-foreground/80">
              Tu es <span className="font-semibold text-primary-foreground">#{myRank.rank}</span> au
              classement avec <span className="font-semibold text-primary-foreground">{myRank.total} pts</span>.
            </p>
          ) : (
            <p className="mt-3 text-sm text-primary-foreground/80">
              Pas encore classé — fais tes premiers pronos pour démarrer.
            </p>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-l-4 border-l-festival-gold pl-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Mon rang</CardTitle>
          </CardHeader>
          <CardContent>
            {lbLoading ? (
              <span className="text-muted-foreground text-sm">Chargement…</span>
            ) : myRank ? (
              <div className="space-y-1">
                <p className="font-display text-4xl leading-none">#{myRank.rank}</p>
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
        <h2 className="font-display text-2xl">Prochains matchs à pronostiquer</h2>
        {isLoading ? (
          <p className="text-muted-foreground text-sm">Chargement…</p>
        ) : upcomingMatches.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            Tous les prochains matchs ont déjà un prono, ou aucun match à venir.
          </p>
        ) : (
          <div className="space-y-2">
            {upcomingMatches.map((match) => (
              <Card key={match.id} className="transition-shadow hover:shadow-md hover:shadow-primary/5">
                <CardContent className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="flex items-center gap-1.5 font-medium">
                      {teamFlag(match.home_team) && <span aria-hidden>{teamFlag(match.home_team)}</span>}
                      <span className="truncate">{match.home_team}</span>
                      <span className="text-muted-foreground">vs</span>
                      {teamFlag(match.away_team) && <span aria-hidden>{teamFlag(match.away_team)}</span>}
                      <span className="truncate">{match.away_team}</span>
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
                    className={buttonVariants({ variant: 'default', size: 'sm' }) + ' shrink-0 gap-1'}
                  >
                    Pronostiquer
                    <ArrowRight className="size-3.5" />
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
