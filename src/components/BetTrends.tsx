import type { Tables } from '@/types/db'

interface Props {
  predictions: Pick<Tables<'predictions'>, 'home_score' | 'away_score'>[]
  homeTeam: string
  awayTeam: string
}

/** Jauge de répartition des pronostics des joueurs : victoire dom (1) / nul (N) / victoire ext (2). */
export function BetTrends({ predictions, homeTeam, awayTeam }: Props) {
  const total = predictions.length
  if (total === 0) {
    return <p className="text-xs text-muted-foreground">Aucun prono pour ce match.</p>
  }
  let h = 0
  let d = 0
  let a = 0
  for (const p of predictions) {
    if (p.home_score > p.away_score) h++
    else if (p.home_score < p.away_score) a++
    else d++
  }
  const pct = (n: number) => Math.round((n / total) * 100)

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-[11px] font-medium text-muted-foreground">
        <span>Tendances ({total} prono{total > 1 ? 's' : ''})</span>
      </div>
      <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-muted">
        {h > 0 && <div className="bg-primary" style={{ width: `${pct(h)}%` }} />}
        {d > 0 && <div className="bg-festival-gold" style={{ width: `${pct(d)}%` }} />}
        {a > 0 && <div className="bg-accent" style={{ width: `${pct(a)}%` }} />}
      </div>
      <div className="flex justify-between text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1">
          <span className="size-2 rounded-full bg-primary" /> {homeTeam} {pct(h)}%
        </span>
        <span className="flex items-center gap-1">
          <span className="size-2 rounded-full bg-festival-gold" /> Nul {pct(d)}%
        </span>
        <span className="flex items-center gap-1">
          <span className="size-2 rounded-full bg-accent" /> {awayTeam} {pct(a)}%
        </span>
      </div>
    </div>
  )
}
