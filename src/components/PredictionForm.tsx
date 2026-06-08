import { useState } from 'react'
import { Lock } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { isLocked } from '@/lib/lock'

interface Props {
  kickoffIso: string
  homeTeam: string
  awayTeam: string
  defaultHome?: number
  defaultAway?: number
  onSubmit: (s: { home: number; away: number }) => void
}

export function PredictionForm({
  kickoffIso,
  homeTeam,
  awayTeam,
  defaultHome,
  defaultAway,
  onSubmit,
}: Props) {
  const locked = isLocked(kickoffIso)
  const [home, setHome] = useState(defaultHome ?? 0)
  const [away, setAway] = useState(defaultAway ?? 0)

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit({ home, away })
      }}
      className="flex items-center gap-2 rounded-lg bg-secondary/50 p-2"
    >
      <Input
        aria-label={`Score ${homeTeam}`}
        type="number"
        min={0}
        value={home}
        disabled={locked}
        onChange={(e) => setHome(Number(e.target.value))}
        className="h-9 w-14 text-center font-display text-lg tabular-nums"
      />
      <span className="font-display text-muted-foreground">-</span>
      <Input
        aria-label={`Score ${awayTeam}`}
        type="number"
        min={0}
        value={away}
        disabled={locked}
        onChange={(e) => setAway(Number(e.target.value))}
        className="h-9 w-14 text-center font-display text-lg tabular-nums"
      />
      {locked ? (
        <span className="ml-auto inline-flex items-center gap-1.5 px-2 text-xs font-medium text-muted-foreground">
          <Lock className="size-3.5" />
          Verrouillé
        </span>
      ) : (
        <Button type="submit" disabled={locked} className="ml-auto">
          Valider
        </Button>
      )}
    </form>
  )
}
