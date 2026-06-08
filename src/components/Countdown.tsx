import { useEffect, useState } from 'react'
import { Clock } from 'lucide-react'
import { formatCountdown } from '@/lib/format'
import { cn } from '@/lib/utils'

const DAY_MS = 24 * 60 * 60 * 1000

export function Countdown({ kickoffIso }: { kickoffIso: string }) {
  const [remaining, setRemaining] = useState(() => new Date(kickoffIso).getTime() - Date.now())
  useEffect(() => {
    const id = setInterval(() => setRemaining(new Date(kickoffIso).getTime() - Date.now()), 60000)
    return () => clearInterval(id)
  }, [kickoffIso])

  const urgent = remaining > 0 && remaining <= DAY_MS

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 tabular-nums',
        urgent && 'font-semibold text-accent',
      )}
    >
      {urgent && <span className="size-1.5 animate-pulse rounded-full bg-accent" />}
      <Clock className="size-3.5" />
      {formatCountdown(remaining)}
    </span>
  )
}
