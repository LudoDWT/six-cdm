import { useLeaderboard } from '@/hooks/useLeaderboard'
import { useAuth } from '@/hooks/useAuth'
import { LeaderboardTable } from '@/components/LeaderboardTable'

export function ClassementPage() {
  const { data, isLoading, error } = useLeaderboard()
  const { session } = useAuth()

  if (isLoading) {
    return <div className="text-muted-foreground">Chargement…</div>
  }

  if (error) {
    return <div className="text-destructive">Erreur lors du chargement du classement.</div>
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-4xl leading-none">Classement</h1>
        <div className="festival-rule mt-2 h-1 w-16 rounded-full" />
      </div>
      <LeaderboardTable rows={data ?? []} currentUserId={session?.user.id} />
    </div>
  )
}
