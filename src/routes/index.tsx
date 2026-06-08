import { toast } from 'sonner'
import { useMatches } from '@/hooks/useMatches'
import { usePredictions, useUpsertPrediction } from '@/hooks/usePredictions'
import { useLeaderboard } from '@/hooks/useLeaderboard'
import { useBonusQuestions, useBonusPredictions } from '@/hooks/useBonus'
import { useAuth } from '@/hooks/useAuth'
import { isLocked } from '@/lib/lock'
import { Podium } from '@/components/Podium'
import { MatchCard } from '@/components/MatchCard'
import { BonusQuestionCard } from '@/components/BonusQuestionCard'
import type { Tables } from '@/types/db'

const ms = (iso: string) => new Date(iso).getTime()
const dayKey = (iso: string) => new Date(iso).toLocaleDateString('fr-FR')
const dayLabel = (iso: string) =>
  new Date(iso).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })

export function DashboardPage() {
  const { data: matches, isLoading: matchesLoading } = useMatches()
  const { data: predictions, isLoading: predsLoading } = usePredictions()
  const { data: leaderboard, isLoading: lbLoading } = useLeaderboard()
  const { data: bonusQuestions } = useBonusQuestions()
  const { data: bonusPredictions } = useBonusPredictions()
  const { session } = useAuth()
  const upsert = useUpsertPrediction()

  const userId = session?.user.id

  // Questions bonus encore ouvertes et non répondues par l'utilisateur
  const myBonusAnswered = new Set(
    (bonusPredictions ?? []).filter((p) => p.user_id === userId).map((p) => p.bonus_question_id),
  )
  const pendingBonus = (bonusQuestions ?? []).filter(
    (q) => !isLocked(q.lock_at) && !myBonusAnswered.has(q.id),
  )
  const isLoading = matchesLoading || predsLoading || lbLoading

  const myPredByMatch = new Map<number, Tables<'predictions'>>()
  for (const p of predictions ?? []) {
    if (p.user_id === userId) myPredByMatch.set(p.match_id, p)
  }

  const now = Date.now()
  const sorted = [...(matches ?? [])].sort((a, b) => ms(a.kickoff_at) - ms(b.kickoff_at))
  const future = sorted.filter((m) => ms(m.kickoff_at) > now)
  const nextMatch = future[0] ?? null
  const nextDayMatches = nextMatch
    ? future.filter((m) => dayKey(m.kickoff_at) === dayKey(nextMatch.kickoff_at))
    : []
  const restOfDay = nextDayMatches.slice(1)
  const recentMatch = !nextMatch ? sorted[sorted.length - 1] ?? null : null

  const myRank = (() => {
    if (!leaderboard || !userId) return null
    const idx = leaderboard.findIndex((r) => r.user_id === userId)
    if (idx === -1) return null
    return { rank: idx + 1, total: leaderboard[idx].total_points ?? 0 }
  })()

  const bet = (matchId: number) => (s: { home: number; away: number }) => {
    if (!userId) return
    upsert.mutate(
      { user_id: userId, match_id: matchId, home_score: s.home, away_score: s.away },
      {
        onSuccess: () => toast.success('Prono enregistré', { description: 'Tu peux le modifier jusqu’au coup d’envoi.' }),
        onError: (e) => toast.error("Échec de l'enregistrement", { description: e.message }),
      },
    )
  }

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-primary p-6 text-primary-foreground sm:p-8">
        <div className="field-glow pointer-events-none absolute inset-0" />
        <div className="relative z-10">
          <p className="font-display text-xs tracking-[0.25em] text-primary-foreground/70">
            TABLEAU DE BORD
          </p>
          <h1 className="mt-1 font-display text-4xl leading-none sm:text-5xl">
            Allez, on pronostique !
          </h1>
          <p className="mt-3 text-sm text-primary-foreground/80">
            {myRank ? (
              <>
                Tu es <span className="font-semibold text-primary-foreground">#{myRank.rank}</span> au
                classement avec{' '}
                <span className="font-semibold text-primary-foreground">{myRank.total} pts</span>.
              </>
            ) : (
              <>Pas encore classé — fais tes premiers pronos pour démarrer.</>
            )}
          </p>
        </div>
      </div>

      {/* Podium */}
      {!lbLoading && leaderboard && leaderboard.length > 0 && (
        <section className="space-y-4">
          <h2 className="font-display text-2xl">
            Podium
            <span className="festival-rule mt-2 block h-1 w-16 rounded-full" />
          </h2>
          <Podium rows={leaderboard} currentUserId={userId} />
        </section>
      )}

      {/* Prochain match en grand + pari direct sur la journée */}
      <section className="space-y-4">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Chargement…</p>
        ) : nextMatch ? (
          <>
            <h2 className="font-display text-2xl">
              Prochain match
              <span className="festival-rule mt-2 block h-1 w-16 rounded-full" />
            </h2>
            <div className="rounded-2xl bg-primary/5 p-3 ring-2 ring-primary/20 sm:p-4">
              <MatchCard
                match={nextMatch}
                prediction={myPredByMatch.get(nextMatch.id)}
                onSubmit={bet(nextMatch.id)}
              />
            </div>

            {restOfDay.length > 0 && (
              <div className="space-y-3 pt-2">
                <h3 className="text-sm font-medium text-muted-foreground">
                  Pariez aussi sur la journée du {dayLabel(nextMatch.kickoff_at)}
                </h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  {restOfDay.map((m) => (
                    <MatchCard
                      key={m.id}
                      match={m}
                      prediction={myPredByMatch.get(m.id)}
                      onSubmit={bet(m.id)}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        ) : recentMatch ? (
          <>
            <h2 className="font-display text-2xl">
              Dernier match
              <span className="festival-rule mt-2 block h-1 w-16 rounded-full" />
            </h2>
            <MatchCard match={recentMatch} prediction={myPredByMatch.get(recentMatch.id)} onSubmit={() => {}} />
          </>
        ) : (
          <p className="text-sm text-muted-foreground">Aucun match à afficher.</p>
        )}
      </section>

      {/* Bonus tournoi non répondus */}
      {userId && pendingBonus.length > 0 && (
        <section className="space-y-4">
          <div>
            <h2 className="font-display text-2xl">
              Bonus à compléter
              <span className="festival-rule mt-2 block h-1 w-16 rounded-full" />
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Les paris bonus doivent être validés{' '}
              <span className="font-semibold text-foreground">au plus tard le 14 juin à 23h59</span>.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {pendingBonus.map((q) => (
              <BonusQuestionCard key={q.id} question={q} initialAnswer="" userId={userId} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
