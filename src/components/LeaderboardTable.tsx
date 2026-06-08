import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import type { Tables } from '@/types/db'

type LeaderboardRow = Tables<'leaderboard'>

interface Props {
  rows: LeaderboardRow[]
  currentUserId?: string
}

const MEDALS = ['🥇', '🥈', '🥉']
const PODIUM_RING = [
  'ring-festival-gold/70',
  'ring-muted-foreground/40',
  'ring-festival-orange/60',
]

export function LeaderboardTable({ rows, currentUserId }: Props) {
  return (
    <div className="overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10">
      <Table>
        <TableHeader>
          <TableRow className="border-border/60 hover:bg-transparent">
            <TableHead className="w-12 text-center">Rang</TableHead>
            <TableHead>Joueur</TableHead>
            <TableHead className="text-right">Total</TableHead>
            <TableHead className="hidden text-right sm:table-cell">Matchs</TableHead>
            <TableHead className="hidden text-right sm:table-cell">Bonus</TableHead>
            <TableHead className="hidden text-right sm:table-cell">Exacts</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row, index) => {
            const isCurrentUser = row.user_id != null && row.user_id === currentUserId
            const isPodium = index < 3
            return (
              <TableRow
                key={row.user_id ?? index}
                className={cn(
                  'border-border/50 transition-colors',
                  isPodium && 'bg-secondary/40',
                  isCurrentUser &&
                    'bg-primary/10 font-semibold hover:bg-primary/15',
                )}
              >
                <TableCell className="text-center text-lg">
                  {isPodium ? MEDALS[index] : <span className="text-sm text-muted-foreground">{index + 1}</span>}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Avatar
                      className={cn('size-8', isPodium && `ring-2 ${PODIUM_RING[index]}`)}
                    >
                      <AvatarImage src={row.avatar_url ?? undefined} />
                      <AvatarFallback className="text-xs font-semibold">
                        {(row.display_name ?? '?').charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="truncate">
                      {row.display_name ?? '—'}
                      {isCurrentUser && (
                        <span className="ml-1.5 text-xs font-normal text-primary">(vous)</span>
                      )}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <span className="font-display text-lg tabular-nums">{row.total_points ?? 0}</span>
                </TableCell>
                <TableCell className="hidden text-right tabular-nums text-muted-foreground sm:table-cell">
                  {row.match_points ?? 0}
                </TableCell>
                <TableCell className="hidden text-right tabular-nums text-muted-foreground sm:table-cell">
                  {row.bonus_points ?? 0}
                </TableCell>
                <TableCell className="hidden text-right tabular-nums text-muted-foreground sm:table-cell">
                  {row.exact_count ?? 0}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
