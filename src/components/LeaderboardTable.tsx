import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import type { Tables } from '@/types/db'

type LeaderboardRow = Tables<'leaderboard'>

interface Props {
  rows: LeaderboardRow[]
  currentUserId?: string
}

const MEDALS = ['🥇', '🥈', '🥉']

export function LeaderboardTable({ rows, currentUserId }: Props) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-12">Rang</TableHead>
          <TableHead>Joueur</TableHead>
          <TableHead className="text-right">Total</TableHead>
          <TableHead className="text-right">Matchs</TableHead>
          <TableHead className="text-right">Bonus</TableHead>
          <TableHead className="text-right">Exacts</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row, index) => {
          const isCurrentUser = row.user_id != null && row.user_id === currentUserId
          return (
            <TableRow
              key={row.user_id ?? index}
              className={isCurrentUser ? 'bg-muted font-bold' : undefined}
            >
              <TableCell className="text-center">
                {index < 3 ? MEDALS[index] : index + 1}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Avatar className="h-7 w-7">
                    <AvatarImage src={row.avatar_url ?? undefined} />
                    <AvatarFallback>
                      {(row.display_name ?? '?').charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span>{row.display_name ?? '—'}</span>
                </div>
              </TableCell>
              <TableCell className="text-right">{row.total_points ?? 0}</TableCell>
              <TableCell className="text-right">{row.match_points ?? 0}</TableCell>
              <TableCell className="text-right">{row.bonus_points ?? 0}</TableCell>
              <TableCell className="text-right">{row.exact_count ?? 0}</TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}
