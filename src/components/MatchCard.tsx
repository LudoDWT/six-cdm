import { MapPin } from 'lucide-react'
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Countdown } from '@/components/Countdown'
import { PredictionForm } from '@/components/PredictionForm'
import { Flag } from '@/components/Flag'
import { computePoints } from '@/lib/scoring'
import { matchStageLabel } from '@/lib/stages'
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

const isFinished = (m: Tables<'matches'>) => m.home_score !== null && m.away_score !== null

/** Colonne d'équipe pour un match terminé : drapeau, nom, et score réel dessous. */
function ResultColumn({ team, score }: { team: string; score: number }) {
  return (
    <div className="flex flex-col items-center gap-2 text-center">
      <Flag team={team} className="h-10 w-[3.5rem] shadow" />
      <span className="line-clamp-2 text-sm font-semibold leading-tight">{team}</span>
      <span className="font-display text-3xl leading-none tabular-nums">{score}</span>
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
        <div className="flex items-start justify-between gap-2">
          <Badge variant="secondary" className="font-medium">
            {matchStageLabel(match.stage, match.group_name)}
          </Badge>
          <div className="flex flex-col items-end gap-0.5 text-xs font-medium text-muted-foreground">
            <span className="capitalize">{formatKickoff(match.kickoff_at)}</span>
            {finished ? (
              <span className="inline-flex items-center gap-1 text-primary">
                <span className="size-1.5 rounded-full bg-primary" />
                Terminé
              </span>
            ) : (
              <Countdown kickoffIso={match.kickoff_at} />
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {finished ? (
          <>
            <div className="grid grid-cols-[1fr_auto_1fr] items-start gap-2">
              <ResultColumn team={match.home_team} score={match.home_score!} />
              <span className="self-center pt-10 font-display text-lg text-muted-foreground">:</span>
              <ResultColumn team={match.away_team} score={match.away_score!} />
            </div>
            <div className="flex items-center justify-center border-t border-border/60 pt-3">
              {prediction != null && points !== null ? (
                <Badge
                  className={cn(
                    'font-display tabular-nums',
                    points === 3 && 'bg-primary text-primary-foreground',
                    points === 1 && 'bg-festival-gold text-foreground',
                    points === 0 && 'bg-muted text-muted-foreground',
                  )}
                >
                  Ton prono {prediction.home_score}-{prediction.away_score} · +{points} pts
                </Badge>
              ) : (
                <span className="text-xs text-muted-foreground">Tu n'avais pas pronostiqué</span>
              )}
            </div>
          </>
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
        <CardFooter className="justify-center gap-1 text-xs text-muted-foreground">
          <MapPin className="size-3.5 shrink-0" />
          <span className="truncate">{match.venue}</span>
        </CardFooter>
      )}
    </Card>
  )
}
