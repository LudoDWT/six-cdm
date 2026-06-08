import { Link } from '@tanstack/react-router'
import { Coins } from 'lucide-react'
import { useLeaderboard } from '@/hooks/useLeaderboard'
import { useAuth } from '@/hooks/useAuth'
import { LeaderboardTable } from '@/components/LeaderboardTable'
import { buttonVariants } from '@/components/ui/button'
import { potFor, winnersCount, formatEuro } from '@/lib/prize'

export function ClassementPage() {
  const { data, isLoading, error } = useLeaderboard()
  const { session } = useAuth()

  if (isLoading) return <div className="text-muted-foreground">Chargement…</div>
  if (error) return <div className="text-destructive">Erreur lors du chargement du classement.</div>

  const rows = data ?? []
  const players = rows.length
  const pot = potFor(players)
  const winners = winnersCount(players)

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-4xl leading-none">Classement</h1>
        <div className="festival-rule mt-2 h-1 w-16 rounded-full" />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-festival-gold/15 px-4 py-3 text-sm">
        <span className="flex items-center gap-2">
          <Coins className="size-4 text-festival-gold" />
          Cagnotte <span className="font-display text-lg">{formatEuro(pot)}</span>
          <span className="text-muted-foreground">· {winners} gagnant{winners > 1 ? 's' : ''}</span>
        </span>
        <Link to="/cagnotte" className={buttonVariants({ variant: 'outline', size: 'sm' })}>
          Voir la répartition
        </Link>
      </div>

      <LeaderboardTable rows={rows} currentUserId={session?.user.id} prizeWinners={winners} />
    </div>
  )
}
