import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

interface Row {
  user_id: string | null
  display_name: string | null
  avatar_url: string | null
  total_points: number | null
}

const STYLES = [
  // rang 1
  {
    pedestal: 'h-24 bg-[color-mix(in_oklch,var(--festival-gold)_82%,white)] ring-festival-gold/70',
    badge: 'bg-festival-gold text-foreground',
    ring: 'ring-festival-gold',
  },
  // rang 2
  {
    pedestal: 'h-16 bg-muted ring-border',
    badge: 'bg-muted-foreground/20 text-foreground',
    ring: 'ring-muted-foreground/30',
  },
  // rang 3
  {
    pedestal: 'h-12 bg-[color-mix(in_oklch,var(--accent)_30%,white)] ring-accent/40',
    badge: 'bg-accent/30 text-foreground',
    ring: 'ring-accent/40',
  },
]

function Step({ row, rank, isMe }: { row: Row; rank: number; isMe: boolean }) {
  const s = STYLES[rank - 1]
  const name = row.display_name ?? '—'
  return (
    <div className="flex w-full flex-col items-center justify-end gap-2">
      <Avatar className={cn('size-12 ring-2', s.ring)}>
        {row.avatar_url && <AvatarImage src={row.avatar_url} alt={name} />}
        <AvatarFallback className="text-sm font-semibold">
          {name.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="text-center leading-tight">
        <p className="max-w-[7rem] truncate text-sm font-semibold">
          {name}
          {isMe && <span className="text-muted-foreground"> (vous)</span>}
        </p>
        <p className="font-display text-lg">{row.total_points ?? 0}</p>
        <p className="-mt-1 text-[10px] tracking-wider text-muted-foreground">PTS</p>
      </div>
      <div
        className={cn(
          'flex w-full items-start justify-center rounded-t-xl pt-2 ring-1',
          s.pedestal,
        )}
      >
        <span className={cn('grid size-7 place-items-center rounded-full font-display text-sm', s.badge)}>
          {rank}
        </span>
      </div>
    </div>
  )
}

/** Podium des 3 premiers du classement (ordre visuel : 2 · 1 · 3). */
export function Podium({ rows, currentUserId }: { rows: Row[]; currentUserId?: string }) {
  const top = rows.slice(0, 3).map((row, i) => ({ row, rank: i + 1 }))
  if (top.length === 0) return null
  const visual = [top[1], top[0], top[2]].filter(Boolean) as { row: Row; rank: number }[]
  return (
    <div className="mx-auto flex max-w-md items-end gap-2 sm:gap-3">
      {visual.map(({ row, rank }) => (
        <Step key={row.user_id ?? rank} row={row} rank={rank} isMe={row.user_id === currentUserId} />
      ))}
    </div>
  )
}
