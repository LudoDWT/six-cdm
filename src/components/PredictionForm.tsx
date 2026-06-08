import { useState } from 'react'
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
      className="flex items-center gap-2"
    >
      <Input
        aria-label={`Score ${homeTeam}`}
        type="number"
        min={0}
        value={home}
        disabled={locked}
        onChange={(e) => setHome(Number(e.target.value))}
        className="w-16"
      />
      <span>-</span>
      <Input
        aria-label={`Score ${awayTeam}`}
        type="number"
        min={0}
        value={away}
        disabled={locked}
        onChange={(e) => setAway(Number(e.target.value))}
        className="w-16"
      />
      <Button type="submit" disabled={locked}>
        Valider
      </Button>
    </form>
  )
}
