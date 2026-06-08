import { useParams } from '@tanstack/react-router'
import { MapPin } from 'lucide-react'
import { toast } from 'sonner'
import { useMatches } from '@/hooks/useMatches'
import { usePredictions, useUpsertPrediction } from '@/hooks/usePredictions'
import { useAuth } from '@/hooks/useAuth'
import { PredictionForm } from '@/components/PredictionForm'
import { PredictionsTable } from '@/components/PredictionsTable'
import { Badge } from '@/components/ui/badge'
import { computePoints } from '@/lib/scoring'
import { matchStageLabel } from '@/lib/stages'
import { Flag } from '@/components/Flag'

function formatKickoff(iso: string): string {
  return new Date(iso).toLocaleString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function MatchDetailPage() {
  const params = useParams({ from: '/app/match/$id' })
  const matchId = Number(params.id)

  const { data: matches, isLoading: matchesLoading, error: matchesError } = useMatches()
  const { data: predictions, isLoading: predsLoading, error: predsError } = usePredictions()
  const { session } = useAuth()
  const upsert = useUpsertPrediction()

  if (matchesLoading || predsLoading) {
    return <div className="text-muted-foreground">Chargement…</div>
  }

  if (matchesError || predsError) {
    return <div className="text-destructive">Erreur lors du chargement du match.</div>
  }

  const match = matches?.find((m) => m.id === matchId)

  if (!match) {
    return <div className="text-destructive">Match introuvable.</div>
  }

  const userId = session?.user.id
  const myPrediction = predictions?.find(
    (p) => p.match_id === matchId && p.user_id === userId,
  ) ?? null

  const finished = match.home_score !== null && match.away_score !== null

  const points =
    finished && myPrediction
      ? computePoints(
          { h: myPrediction.home_score, a: myPrediction.away_score },
          { h: match.home_score!, a: match.away_score! },
        )
      : null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-primary p-6 text-primary-foreground">
        <div className="field-glow pointer-events-none absolute inset-0" />
        <div className="relative z-10 space-y-2">
          <Badge className="bg-primary-foreground/15 text-primary-foreground">
            {matchStageLabel(match.stage, match.group_name)}
          </Badge>
          <h1 className="flex flex-wrap items-center gap-x-3 gap-y-1 font-display text-3xl leading-none sm:text-4xl">
            <span className="inline-flex items-center gap-2">
              <Flag team={match.home_team} className="h-5 w-7" />
              {match.home_team}
            </span>
            <span className="text-primary-foreground/60">vs</span>
            <span className="inline-flex items-center gap-2">
              <Flag team={match.away_team} className="h-5 w-7" />
              {match.away_team}
            </span>
          </h1>
          <p className="flex items-center gap-1.5 text-sm text-primary-foreground/80">
            {formatKickoff(match.kickoff_at)} · <MapPin className="size-3.5" /> {match.venue}
          </p>
        </div>
      </div>

      {/* Result or prediction form */}
      <section className="space-y-3">
        <h2 className="font-display text-2xl">Mon prono</h2>

        {finished ? (
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="font-display text-2xl">
                Résultat : {match.home_score}-{match.away_score}
              </span>
            </div>
            {myPrediction ? (
              <div className="flex items-center gap-3">
                <span className="text-muted-foreground">
                  Mon prono : {myPrediction.home_score} – {myPrediction.away_score}
                </span>
                {points !== null && (
                  <Badge variant={points === 3 ? 'default' : points === 1 ? 'outline' : 'secondary'}>
                    +{points} pts
                  </Badge>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Aucun prono enregistré.</p>
            )}
          </div>
        ) : (
          <PredictionForm
            kickoffIso={match.kickoff_at}
            homeTeam={match.home_team}
            awayTeam={match.away_team}
            defaultHome={myPrediction?.home_score}
            defaultAway={myPrediction?.away_score}
            onSubmit={(s) => {
              if (!userId) return
              upsert.mutate(
                {
                  user_id: userId,
                  match_id: match.id,
                  home_score: s.home,
                  away_score: s.away,
                },
                {
                  onSuccess: () => toast.success('Prono enregistré ⚽'),
                  onError: (err) =>
                    toast.error(`Erreur : ${err instanceof Error ? err.message : 'inconnue'}`),
                },
              )
            }}
          />
        )}
      </section>

      {/* All predictions */}
      <section className="space-y-3">
        <h2 className="font-display text-2xl">Pronos des joueurs</h2>
        <PredictionsTable matchId={matchId} match={match} />
      </section>
    </div>
  )
}
