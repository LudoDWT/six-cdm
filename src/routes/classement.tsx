import { Link } from '@tanstack/react-router'
import { Coins } from 'lucide-react'
import { useLeaderboard } from '@/hooks/useLeaderboard'
import { useContributions } from '@/hooks/useContributions'
import { useAuth } from '@/hooks/useAuth'
import { LeaderboardTable } from '@/components/LeaderboardTable'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import { buttonVariants } from '@/components/ui/button'
import { prizeFor, formatEuro } from '@/lib/prize'
import { cn } from '@/lib/utils'

export function ClassementPage() {
  const { data, isLoading, error } = useLeaderboard()
  const { data: contributions } = useContributions()
  const { session } = useAuth()
  const userId = session?.user.id

  if (isLoading) return <div className="text-muted-foreground">Chargement…</div>
  if (error) return <div className="text-destructive">Erreur lors du chargement du classement.</div>

  const rows = data ?? []
  const amountByUser = new Map<string, number>()
  for (const c of contributions ?? []) amountByUser.set(c.user_id, c.amount)
  const pot = (contributions ?? []).reduce((s, c) => s + c.amount, 0)
  const participants = rows.filter((r) => r.user_id && (amountByUser.get(r.user_id) ?? 0) > 0)

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-4xl leading-none">Classement</h1>
        <div className="festival-rule mt-2 h-1 w-16 rounded-full" />
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">Général</TabsTrigger>
          <TabsTrigger value="cagnotte">Cagnotte</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <LeaderboardTable rows={rows} currentUserId={userId} />
        </TabsContent>

        <TabsContent value="cagnotte" className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-festival-gold/15 px-4 py-3">
            <span className="flex items-center gap-2 text-sm">
              <Coins className="size-4 text-festival-gold" />
              Cagnotte : <span className="font-display text-lg">{formatEuro(pot)}</span>
            </span>
            <Link to="/cagnotte" className={buttonVariants({ variant: 'outline', size: 'sm' })}>
              Contribuer
            </Link>
          </div>

          {participants.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Aucun contributeur pour l'instant.{' '}
              <Link to="/cagnotte" className="font-medium text-accent underline-offset-4 hover:underline">
                Lance la cagnotte !
              </Link>
            </p>
          ) : (
            <div className="space-y-2">
              {participants.map((p, i) => {
                const prize = prizeFor(i, pot)
                const isMe = p.user_id === userId
                return (
                  <Card key={p.user_id} className={cn(isMe && 'ring-2 ring-primary/40')}>
                    <CardContent className="flex items-center gap-3 py-3">
                      <span className="w-6 text-center font-display text-lg text-muted-foreground">
                        {i + 1}
                      </span>
                      <Avatar className="size-9">
                        {p.avatar_url && <AvatarImage src={p.avatar_url} alt={p.display_name ?? ''} />}
                        <AvatarFallback>
                          {(p.display_name ?? '?').charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold">
                          {p.display_name ?? '—'}
                          {isMe && <span className="text-muted-foreground"> (vous)</span>}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {p.total_points ?? 0} pts · mise{' '}
                          {formatEuro(amountByUser.get(p.user_id!) ?? 0)}
                        </p>
                      </div>
                      {prize > 0 && (
                        <span className="shrink-0 rounded-full bg-festival-gold/25 px-3 py-1 font-display text-sm">
                          {formatEuro(prize)}
                        </span>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
