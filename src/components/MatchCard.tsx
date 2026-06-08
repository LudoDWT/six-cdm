import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Countdown } from '@/components/Countdown'
import { PredictionForm } from '@/components/PredictionForm'
import { computePoints } from '@/lib/scoring'
import type { Tables } from '@/types/db'

interface Props {
  match: Tables<'matches'>
  prediction?: Tables<'predictions'> | null
  onSubmit: (s: { home: number; away: number }) => void
}

const STAGE_LABELS: Record<string, string> = {
  group: '', // handled via group_name
  round_of_32: '32es',
  round_of_16: '8es',
  quarter: 'Quart',
  semi: 'Demie',
  third_place: 'Petite finale',
  final: 'Finale',
}

function stageBadgeLabel(match: Tables<'matches'>): string {
  if (match.stage === 'group' && match.group_name) {
    return `Groupe ${match.group_name}`
  }
  return STAGE_LABELS[match.stage] ?? match.stage
}

function formatKickoff(iso: string): string {
  return new Date(iso).toLocaleString('fr-FR', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const isFinished = (match: Tables<'matches'>) =>
  match.home_score !== null && match.away_score !== null

export function MatchCard({ match, prediction, onSubmit }: Props) {
  const finished = isFinished(match)

  const points =
    finished && prediction != null
      ? computePoints(
          { h: prediction.home_score, a: prediction.away_score },
          { h: match.home_score!, a: match.away_score! },
        )
      : null

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base">
            {match.home_team} vs {match.away_team}
          </CardTitle>
          <Badge variant="secondary">{stageBadgeLabel(match)}</Badge>
        </div>
        <div className="text-sm text-muted-foreground">
          {finished ? formatKickoff(match.kickoff_at) : <Countdown kickoffIso={match.kickoff_at} />}
        </div>
      </CardHeader>

      <CardContent>
        {finished ? (
          <div className="flex items-center gap-3">
            <span className="text-lg font-semibold">
              {match.home_score} – {match.away_score}
            </span>
            {prediction != null && points !== null && (
              <Badge variant={points === 3 ? 'default' : points === 1 ? 'outline' : 'secondary'}>
                +{points} pts
              </Badge>
            )}
            {prediction == null && (
              <span className="text-sm text-muted-foreground">Aucun prono</span>
            )}
          </div>
        ) : (
          <PredictionForm
            kickoffIso={match.kickoff_at}
            homeTeam={match.home_team}
            awayTeam={match.away_team}
            defaultHome={prediction?.home_score}
            defaultAway={prediction?.away_score}
            onSubmit={onSubmit}
          />
        )}
      </CardContent>

      {!finished && (
        <CardFooter>
          <span className="text-xs text-muted-foreground">{match.venue}</span>
        </CardFooter>
      )}
    </Card>
  )
}
