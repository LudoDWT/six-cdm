import { toast } from 'sonner'
import { Minus, Plus, Coins, Trophy } from 'lucide-react'
import { useContributions, useSetContribution } from '@/hooks/useContributions'
import { useLeaderboard } from '@/hooks/useLeaderboard'
import { useAuth } from '@/hooks/useAuth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { CONTRIB_STEP, PRIZE_SPLIT, prizeFor, formatEuro } from '@/lib/prize'
import { cn } from '@/lib/utils'

export function CagnottePage() {
  const { data: contributions, isLoading: cLoading } = useContributions()
  const { data: leaderboard, isLoading: lbLoading } = useLeaderboard()
  const { session } = useAuth()
  const setContribution = useSetContribution()
  const userId = session?.user.id

  const amountByUser = new Map<string, number>()
  for (const c of contributions ?? []) amountByUser.set(c.user_id, c.amount)

  const pot = (contributions ?? []).reduce((sum, c) => sum + c.amount, 0)
  const myAmount = userId ? (amountByUser.get(userId) ?? 0) : 0

  // Contributeurs classés par points (ordre du leaderboard), montant > 0
  const participants = (leaderboard ?? []).filter(
    (r) => r.user_id && (amountByUser.get(r.user_id) ?? 0) > 0,
  )

  const changeBy = (delta: number) => {
    if (!userId || setContribution.isPending) return
    const next = Math.max(0, myAmount + delta)
    setContribution.mutate(
      { user_id: userId, amount: next },
      {
        onSuccess: () =>
          toast.success(
            next > myAmount ? `+${CONTRIB_STEP}€ ajoutés à la cagnotte` : 'Contribution mise à jour',
          ),
        onError: (e) => toast.error("Échec de l'enregistrement", { description: e.message }),
      },
    )
  }

  const splitPct = PRIZE_SPLIT.map((p) => Math.round(p * 100))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-4xl leading-none">Cagnotte</h1>
        <div className="festival-rule mt-2 h-1 w-16 rounded-full" />
        <p className="mt-2 text-sm text-muted-foreground">
          Mets de l'argent en jeu et tente de remporter une part de la cagnotte selon ton
          classement final.
        </p>
      </div>

      {/* Comment ça marche */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Comment ça marche</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            • Chaque participation se fait par tranches de{' '}
            <span className="font-semibold text-foreground">{CONTRIB_STEP}€</span> (système
            d'honneur — le règlement se fait entre vous).
          </p>
          <p>
            • À la fin du tournoi, la cagnotte est répartie entre les{' '}
            <span className="font-semibold text-foreground">3 premiers contributeurs</span> au
            classement général :
          </p>
          <p className="flex flex-wrap gap-2 pt-1">
            <span className="rounded-full bg-festival-gold/30 px-3 py-1 font-medium text-foreground">
              🥇 1er · {splitPct[0]}%
            </span>
            <span className="rounded-full bg-muted px-3 py-1 font-medium text-foreground">
              🥈 2e · {splitPct[1]}%
            </span>
            <span className="rounded-full bg-accent/20 px-3 py-1 font-medium text-foreground">
              🥉 3e · {splitPct[2]}%
            </span>
          </p>
          <p>• Seuls les joueurs ayant contribué peuvent remporter une part.</p>
        </CardContent>
      </Card>

      {/* Total + ma contribution */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="border-l-4 border-l-festival-gold">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Coins className="size-4" /> Cagnotte totale
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-display text-5xl leading-none">{formatEuro(pot)}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {participants.length} contributeur{participants.length > 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Ma contribution
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                aria-label="Retirer 10€"
                disabled={myAmount <= 0 || setContribution.isPending}
                onClick={() => changeBy(-CONTRIB_STEP)}
              >
                <Minus className="size-4" />
              </Button>
              <span className="min-w-20 text-center font-display text-3xl tabular-nums">
                {formatEuro(myAmount)}
              </span>
              <Button
                size="icon"
                aria-label="Ajouter 10€"
                disabled={setContribution.isPending}
                onClick={() => changeBy(CONTRIB_STEP)}
              >
                <Plus className="size-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Ajuste ta mise par tranches de {CONTRIB_STEP}€.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Classement des contributeurs */}
      <section className="space-y-3">
        <h2 className="flex items-center gap-2 font-display text-2xl">
          <Trophy className="size-5 text-festival-gold" /> Contributeurs &amp; gains projetés
        </h2>
        {cLoading || lbLoading ? (
          <p className="text-sm text-muted-foreground">Chargement…</p>
        ) : participants.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Personne n'a encore contribué. Sois le premier à lancer la cagnotte !
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
                      <AvatarFallback>{(p.display_name ?? '?').charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold">
                        {p.display_name ?? '—'}
                        {isMe && <span className="text-muted-foreground"> (vous)</span>}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {p.total_points ?? 0} pts · mise {formatEuro(amountByUser.get(p.user_id!) ?? 0)}
                      </p>
                    </div>
                    {prize > 0 ? (
                      <span className="shrink-0 rounded-full bg-festival-gold/25 px-3 py-1 font-display text-sm">
                        {formatEuro(prize)}
                      </span>
                    ) : (
                      <span className="shrink-0 text-xs text-muted-foreground">—</span>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
        <p className="text-xs text-muted-foreground">
          Gains indicatifs, calculés sur la cagnotte actuelle et le classement du moment.
        </p>
      </section>
    </div>
  )
}
