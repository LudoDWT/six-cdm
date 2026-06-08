import { useState } from 'react'
import { Lock, Minus, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { isLocked } from '@/lib/lock'
import { cn } from '@/lib/utils'

interface Props {
  kickoffIso: string
  homeTeam: string
  awayTeam: string
  defaultHome?: number
  defaultAway?: number
  onSubmit: (s: { home: number; away: number }) => void
}

const clamp = (n: number) => Math.max(0, Math.min(99, Number.isFinite(n) ? n : 0))

function Stepper({
  label,
  value,
  onChange,
  disabled,
}: {
  label: string
  value: number
  onChange: (n: number) => void
  disabled: boolean
}) {
  const stepBtn =
    'grid size-9 place-items-center rounded-full transition-colors disabled:opacity-30 disabled:hover:bg-transparent'
  return (
    <div className="inline-flex items-center gap-0.5 rounded-full border border-border bg-background p-1 shadow-sm">
      <button
        type="button"
        aria-label={`Retirer un but à ${label}`}
        disabled={disabled || value <= 0}
        onClick={() => onChange(clamp(value - 1))}
        className={cn(stepBtn, 'text-muted-foreground hover:bg-muted')}
      >
        <Minus className="size-4" />
      </button>
      <input
        aria-label={`Score ${label}`}
        inputMode="numeric"
        pattern="[0-9]*"
        disabled={disabled}
        value={value}
        onChange={(e) => onChange(clamp(parseInt(e.target.value.replace(/\D/g, ''), 10)))}
        className="w-9 bg-transparent text-center font-display text-2xl leading-none tabular-nums outline-none disabled:opacity-70"
      />
      <button
        type="button"
        aria-label={`Ajouter un but à ${label}`}
        disabled={disabled}
        onClick={() => onChange(clamp(value + 1))}
        className={cn(stepBtn, 'text-primary hover:bg-primary/10')}
      >
        <Plus className="size-4" />
      </button>
    </div>
  )
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
      className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-secondary/40 p-2.5"
    >
      <div className="flex items-center gap-2">
        <Stepper label={homeTeam} value={home} onChange={setHome} disabled={locked} />
        <span className="font-display text-lg text-muted-foreground">:</span>
        <Stepper label={awayTeam} value={away} onChange={setAway} disabled={locked} />
      </div>
      {locked ? (
        <span className="inline-flex items-center gap-1.5 px-2 text-xs font-medium text-muted-foreground">
          <Lock className="size-3.5" />
          Verrouillé
        </span>
      ) : (
        <Button type="submit">Valider</Button>
      )}
    </form>
  )
}
