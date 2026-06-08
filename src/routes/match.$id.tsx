import { useParams } from '@tanstack/react-router'
import { toast } from 'sonner'
import { useMatches } from '@/hooks/useMatches'
import { usePredictions, useUpsertPrediction } from '@/hooks/usePredictions'
import { useAuth } from '@/hooks/useAuth'
import { PredictionForm } from '@/components/PredictionForm'
import { PredictionsTable } from '@/components/PredictionsTable'
import { Badge } from '@/components/ui/badge'
import { computePoints } from '@/lib/scoring'

const STAGE_LABELS: Record<string, string> = {
  group: 'Phase de groupes',
  round_of_32: '32es de finale',
  round_of_16: '8es de finale',
  quarter: 'Quarts de finale',
  semi: 'Demi-finales',
  third_place: 'Petite finale',
  final: 'Finale',
}

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
  const params = useParams({ strict: false })
  const matchId = Number((params as Record<string, string>).id)

  const { data: matches, isLoading: matchesLoading } = useMatches()
  const { data: predictions, isLoading: predsLoading } = usePredictions()
  const { session } = useAuth()
  const upsert = useUpsertPrediction()

  if (matchesLoading || predsLoading) {
    return <div className="text-muted-foreground">Chargement…</div>
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
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold">
            {match.home_team} vs {match.away_team}
          </h1>
          <Badge variant="secondary">
            {match.stage === 'group' && match.group_name
              ? `Groupe ${match.group_name}`
              : (STAGE_LABELS[match.stage] ?? match.stage)}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          {formatKickoff(match.kickoff_at)} — {match.venue}
        </p>
      </div>

      {/* Result or prediction form */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Mon prono</h2>

        {finished ? (
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="text-xl font-bold">
                Résultat : {match.home_score} – {match.away_score}
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
                  onSuccess: () => toast.success('Prono enregistré'),
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
        <h2 className="text-lg font-semibold">Pronos des joueurs</h2>
        <PredictionsTable matchId={matchId} match={match} />
      </section>
    </div>
  )
}
