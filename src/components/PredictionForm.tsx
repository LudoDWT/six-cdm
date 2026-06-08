import { useState } from 'react'
import { Lock, Minus, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Flag } from '@/components/Flag'
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
    'grid size-8 place-items-center rounded-full transition-colors disabled:opacity-30 disabled:hover:bg-transparent'
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
        className="w-8 bg-transparent text-center font-display text-2xl leading-none tabular-nums outline-none disabled:opacity-70"
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

function TeamColumn({ team, children }: { team: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-2 text-center">
      <Flag team={team} className="h-10 w-[3.5rem] shadow" />
      <span className="line-clamp-2 text-sm font-semibold leading-tight">{team}</span>
      {children}
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
      className="space-y-4"
    >
      <div className="grid grid-cols-[1fr_auto_1fr] items-start gap-2">
        <TeamColumn team={homeTeam}>
          <Stepper label={homeTeam} value={home} onChange={setHome} disabled={locked} />
        </TeamColumn>
        <span className="self-center pt-10 font-display text-lg text-muted-foreground">:</span>
        <TeamColumn team={awayTeam}>
          <Stepper label={awayTeam} value={away} onChange={setAway} disabled={locked} />
        </TeamColumn>
      </div>
      {locked ? (
        <div className="flex items-center justify-center gap-1.5 text-xs font-medium text-muted-foreground">
          <Lock className="size-3.5" />
          Verrouillé
        </div>
      ) : (
        <Button type="submit" className="w-full">
          Valider mon prono
        </Button>
      )}
    </form>
  )
}
