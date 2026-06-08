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
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Classement</h1>
      <LeaderboardTable rows={data ?? []} currentUserId={session?.user.id} />
    </div>
  )
}
