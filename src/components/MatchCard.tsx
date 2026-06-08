import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Countdown } from '@/components/Countdown'
import { PredictionForm } from '@/components/PredictionForm'
import { computePoints } from '@/lib/scoring'
import { matchStageLabel } from '@/lib/stages'
import { teamFlag } from '@/lib/flags'
import { cn } from '@/lib/utils'
import type { Tables } from '@/types/db'

interface Props {
  match: Tables<'matches'>
  prediction?: Tables<'predictions'> | null
  onSubmit: (s: { home: number; away: number }) => void
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

function TeamName({ name, align }: { name: string; align: 'start' | 'end' }) {
  const flag = teamFlag(name)
  return (
    <div
      className={cn(
        'flex min-w-0 items-center gap-2',
        align === 'end' && 'flex-row-reverse text-right',
      )}
    >
      {flag ? (
        <span aria-hidden className="text-2xl leading-none">
          {flag}
        </span>
      ) : (
        <span
          aria-hidden
          className="grid size-6 shrink-0 place-items-center rounded-full bg-muted text-[10px] font-bold text-muted-foreground"
        >
          ?
        </span>
      )}
      <span className="truncate text-sm font-semibold leading-tight">{name}</span>
    </div>
  )
}

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
    <Card className="group/match transition-shadow hover:shadow-lg hover:shadow-primary/5">
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <Badge variant="secondary" className="font-medium">
            {matchStageLabel(match.stage, match.group_name)}
          </Badge>
          <span className="text-xs font-medium text-muted-foreground">
            {finished ? (
              <span className="inline-flex items-center gap-1 text-primary">
                <span className="size-1.5 rounded-full bg-primary" />
                Terminé
              </span>
            ) : (
              <Countdown kickoffIso={match.kickoff_at} />
            )}
          </span>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Équipe vs équipe */}
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
          <TeamName name={match.home_team} align="start" />
          {finished ? (
            <div className="flex flex-col items-center px-1">
              <span className="font-display text-2xl tabular-nums leading-none">
                {match.home_score}-{match.away_score}
              </span>
            </div>
          ) : (
            <span className="font-display text-sm text-muted-foreground">vs</span>
          )}
          <TeamName name={match.away_team} align="end" />
        </div>

        {finished ? (
          <div className="flex items-center justify-between border-t border-border/60 pt-3">
            <span className="text-xs text-muted-foreground">{formatKickoff(match.kickoff_at)}</span>
            {prediction != null && points !== null ? (
              <Badge
                className={cn(
                  'font-display tabular-nums',
                  points === 3 && 'bg-primary text-primary-foreground',
                  points === 1 && 'bg-festival-gold text-foreground',
                  points === 0 && 'bg-muted text-muted-foreground',
                )}
              >
                +{points} pts
              </Badge>
            ) : (
              <span className="text-xs text-muted-foreground">Aucun prono</span>
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
        <CardFooter className="text-xs text-muted-foreground">
          <span className="truncate">📍 {match.venue}</span>
        </CardFooter>
      )}
    </Card>
  )
}
