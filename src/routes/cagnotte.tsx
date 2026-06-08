import { Coins, Users, Trophy } from 'lucide-react'
import { useLeaderboard } from '@/hooks/useLeaderboard'
import { useAuth } from '@/hooks/useAuth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  ENTRY_FEE,
  PRIZE_TIERS,
  prizeShares,
  prizeFor,
  potFor,
  winnersCount,
  formatEuro,
} from '@/lib/prize'
import { cn } from '@/lib/utils'

function Stat({
  icon,
  label,
  value,
  hint,
}: {
  icon: React.ReactNode
  label: string
  value: string
  hint?: string
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          {icon} {label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="font-display text-4xl leading-none">{value}</p>
        {hint && <p className="mt-1 text-sm text-muted-foreground">{hint}</p>}
      </CardContent>
    </Card>
  )
}

export function CagnottePage() {
  const { data: leaderboard, isLoading } = useLeaderboard()
  const { session } = useAuth()
  const userId = session?.user.id

  const players = leaderboard?.length ?? 0
  const pot = potFor(players)
  const winners = winnersCount(players)
  const shares = prizeShares(players)
  const podium = (leaderboard ?? []).slice(0, winners)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-4xl leading-none">Cagnotte</h1>
        <div className="festival-rule mt-2 h-1 w-16 rounded-full" />
        <p className="mt-2 text-sm text-muted-foreground">
          {ENTRY_FEE}€ par joueur, 100% redistribué. Plus on est nombreux, plus il y a de
          gagnants !
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat
          icon={<Coins className="size-4 text-festival-gold" />}
          label="Cagnotte totale"
          value={formatEuro(pot)}
          hint="100% redistribué"
        />
        <Stat
          icon={<Users className="size-4 text-primary" />}
          label="Participants"
          value={String(players)}
          hint={`${ENTRY_FEE}€ chacun`}
        />
        <Stat
          icon={<Trophy className="size-4 text-festival-gold" />}
          label="Gagnants"
          value={String(winners)}
          hint="selon le nombre de joueurs"
        />
      </div>

      {/* Répartition actuelle */}
      <section className="space-y-3">
        <h2 className="font-display text-2xl">Répartition actuelle</h2>
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Chargement…</p>
        ) : podium.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aucun joueur pour l'instant.</p>
        ) : (
          <div className="space-y-2">
            {podium.map((p, i) => (
              <Card key={p.user_id} className={cn(p.user_id === userId && 'ring-2 ring-primary/40')}>
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
                      {p.user_id === userId && <span className="text-muted-foreground"> (vous)</span>}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {p.total_points ?? 0} pts · {Math.round((shares[i] ?? 0) * 100)}% du pot
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full bg-festival-gold/25 px-3 py-1 font-display text-sm">
                    {formatEuro(prizeFor(i, players))}
                  </span>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        <p className="text-xs text-muted-foreground">
          Gains indicatifs, calculés sur le classement et le nombre de joueurs du moment.
        </p>
      </section>

      {/* Barème complet */}
      <section className="space-y-3">
        <h2 className="font-display text-2xl">Barème des gains</h2>
        <Card>
          <CardContent className="overflow-x-auto p-0">
            <table className="w-full text-sm">
              <thead className="border-b text-left text-muted-foreground">
                <tr>
                  <th className="px-4 py-2 font-medium">Participants</th>
                  <th className="px-4 py-2 font-medium">Cagnotte</th>
                  <th className="px-4 py-2 font-medium">Gagnants</th>
                  <th className="px-4 py-2 font-medium">Répartition</th>
                </tr>
              </thead>
              <tbody>
                {PRIZE_TIERS.map((t) => {
                  const active = players >= t.min && players <= t.max
                  const label = t.max === Infinity ? `${t.min}+` : `${t.min}–${t.max}`
                  const example = t.max === Infinity ? Math.max(t.min, 30) : t.max
                  const pct = prizeShares(example).map((s) => `${Math.round(s * 100)}%`)
                  return (
                    <tr
                      key={t.min}
                      className={cn('border-b last:border-0', active && 'bg-primary/5 font-medium')}
                    >
                      <td className="px-4 py-2">
                        {label}
                        {active && (
                          <span className="ml-2 rounded-full bg-primary px-2 py-0.5 text-[10px] text-primary-foreground">
                            actuel
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-2 text-muted-foreground">
                        {formatEuro(potFor(example))}
                      </td>
                      <td className="px-4 py-2">{t.winners}</td>
                      <td className="px-4 py-2 tabular-nums text-muted-foreground">
                        {pct.join(' · ')}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </CardContent>
        </Card>
        <p className="text-xs text-muted-foreground">
          Le site est réservé aux joueurs ayant réglé leur participation — chaque joueur compte pour
          {' '}{formatEuro(ENTRY_FEE)} dans la cagnotte.
        </p>
      </section>
    </div>
  )
}
