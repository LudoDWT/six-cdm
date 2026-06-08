import { useEffect, useState } from 'react'
import { formatCountdown } from '@/lib/format'

export function Countdown({ kickoffIso }: { kickoffIso: string }) {
  const [remaining, setRemaining] = useState(() => new Date(kickoffIso).getTime() - Date.now())
  useEffect(() => {
    const id = setInterval(() => setRemaining(new Date(kickoffIso).getTime() - Date.now()), 60000)
    return () => clearInterval(id)
  }, [kickoffIso])
  return <span>{formatCountdown(remaining)}</span>
}
