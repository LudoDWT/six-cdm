import { Lock } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Flag } from '@/components/Flag'
import { BetTrends } from '@/components/BetTrends'
import { computePoints } from '@/lib/scoring'
import { matchStageLabel } from '@/lib/stages'
import { cn } from '@/lib/utils'
import type { Tables } from '@/types/db'

interface Props {
  match: Tables<'matches'>
  myPrediction?: Tables<'predictions'> | null
  allPredictions: Tables<'predictions'>[]
}

function timeLabel(iso: string): string {
  return new Date(iso).toLocaleString('fr-FR', {
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function Side({ team, score }: { team: string; score: number | null }) {
  return (
    <div className="flex flex-col items-center gap-1.5 text-center">
      <Flag team={team} className="h-9 w-[3.25rem] shadow" />
      <span className="line-clamp-2 text-sm font-semibold leading-tight">{team}</span>
      {score !== null && (
        <span className="font-display text-2xl leading-none tabular-nums">{score}</span>
      )}
    </div>
  )
}

/** Carte d'un match du jour : verrouillé, en lecture seule, avec mon prono et la jauge de tendances. */
export function TodayMatchCard({ match, myPrediction, allPredictions }: Props) {
  const finished = match.home_score !== null && match.away_score !== null
  const points =
    finished && myPrediction != null
      ? computePoints(
          { h: myPrediction.home_score, a: myPrediction.away_score },
          { h: match.home_score!, a: match.away_score! },
        )
      : null

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <Badge variant="secondary" className="font-medium">
            {matchStageLabel(match.stage, match.group_name)}
          </Badge>
          <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground">
            {finished ? (
              <>
                <span className="size-1.5 rounded-full bg-primary" /> Terminé
              </>
            ) : (
              <>
                <Lock className="size-3.5" /> {timeLabel(match.kickoff_at)}
              </>
            )}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-[1fr_auto_1fr] items-start gap-2">
          <Side team={match.home_team} score={finished ? match.home_score : null} />
          <span className="self-center pt-9 font-display text-lg text-muted-foreground">
            {finished ? ':' : 'vs'}
          </span>
          <Side team={match.away_team} score={finished ? match.away_score : null} />
        </div>

        <div className="flex items-center justify-center gap-2 border-y border-border/60 py-2 text-sm">
          {myPrediction ? (
            <>
              <span className="text-muted-foreground">Ton prono</span>
              <span className="font-display tabular-nums">
                {myPrediction.home_score}-{myPrediction.away_score}
              </span>
              {points !== null && (
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
              )}
            </>
          ) : (
            <span className="text-muted-foreground">Tu n'as pas pronostiqué ce match</span>
          )}
        </div>

        <BetTrends
          predictions={allPredictions}
          homeTeam={match.home_team}
          awayTeam={match.away_team}
        />
      </CardContent>
    </Card>
  )
}
