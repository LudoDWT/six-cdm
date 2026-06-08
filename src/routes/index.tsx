import { toast } from 'sonner'
import { useMatches } from '@/hooks/useMatches'
import { usePredictions, useUpsertPrediction } from '@/hooks/usePredictions'
import { useLeaderboard } from '@/hooks/useLeaderboard'
import { useBonusQuestions, useBonusPredictions } from '@/hooks/useBonus'
import { useAuth } from '@/hooks/useAuth'
import { parisDateKey } from '@/lib/lock'
import { Podium } from '@/components/Podium'
import { MatchCard } from '@/components/MatchCard'
import { TodayMatchCard } from '@/components/TodayMatchCard'
import { BonusQuestionCard } from '@/components/BonusQuestionCard'
import type { Tables } from '@/types/db'

const ms = (iso: string) => new Date(iso).getTime()
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
  const isLoading = matchesLoading || predsLoading

  // Pronos : les miens (par match) + tous (pour les tendances)
  const myPredByMatch = new Map<number, Tables<'predictions'>>()
  const allPredsByMatch = new Map<number, Tables<'predictions'>[]>()
  for (const p of predictions ?? []) {
    if (p.user_id === userId) myPredByMatch.set(p.match_id, p)
    const arr = allPredsByMatch.get(p.match_id) ?? []
    arr.push(p)
    allPredsByMatch.set(p.match_id, arr)
  }

  const todayKey = parisDateKey(new Date())
  const sorted = [...(matches ?? [])].sort((a, b) => ms(a.kickoff_at) - ms(b.kickoff_at))
  const matchDay = (m: Tables<'matches'>) => parisDateKey(new Date(m.kickoff_at))

  const todayMatches = sorted.filter((m) => matchDay(m) === todayKey)
  const futureDays = [...new Set(sorted.filter((m) => matchDay(m) > todayKey).map(matchDay))].sort()
  const nextOpenDay = futureDays[0] ?? null
  const nextDayMatches = nextOpenDay ? sorted.filter((m) => matchDay(m) === nextOpenDay) : []

  const myRank = (() => {
    if (!leaderboard || !userId) return null
    const idx = leaderboard.findIndex((r) => r.user_id === userId)
    if (idx === -1) return null
    return { rank: idx + 1, total: leaderboard[idx].total_points ?? 0 }
  })()

  const myBonusAnswered = new Set(
    (bonusPredictions ?? []).filter((p) => p.user_id === userId).map((p) => p.bonus_question_id),
  )
  const pendingBonus = (bonusQuestions ?? []).filter(
    (q) => new Date(q.lock_at).getTime() > Date.now() && !myBonusAnswered.has(q.id),
  )

  const bet = (matchId: number) => (s: { home: number; away: number }) => {
    if (!userId) return
    upsert.mutate(
      { user_id: userId, match_id: matchId, home_score: s.home, away_score: s.away },
      {
        onSuccess: () => toast.success('Prono enregistré', { description: 'Modifiable jusqu’à la veille du match.' }),
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

      {/* À parier : matchs du prochain jour */}
      <section className="space-y-4">
        <div>
          <h2 className="font-display text-2xl">À parier</h2>
          <span className="festival-rule mt-2 block h-1 w-16 rounded-full" />
          {nextOpenDay && (
            <p className="mt-2 text-sm text-muted-foreground">
              Matchs du <span className="font-medium capitalize text-foreground">{dayLabel(nextDayMatches[0].kickoff_at)}</span>
              {' '}— modifiables jusqu'à la veille au soir.
            </p>
          )}
        </div>
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Chargement…</p>
        ) : nextDayMatches.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aucun match à parier pour le moment.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {nextDayMatches.map((m) => (
              <MatchCard
                key={m.id}
                match={m}
                prediction={myPredByMatch.get(m.id)}
                onSubmit={bet(m.id)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Matchs du jour : verrouillés, avec tendances */}
      {todayMatches.length > 0 && (
        <section className="space-y-4">
          <div>
            <h2 className="font-display text-2xl">Aujourd'hui</h2>
            <span className="festival-rule mt-2 block h-1 w-16 rounded-full" />
            <p className="mt-2 text-sm text-muted-foreground">
              Paris verrouillés — voici les tendances des joueurs.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {todayMatches.map((m) => (
              <TodayMatchCard
                key={m.id}
                match={m}
                myPrediction={myPredByMatch.get(m.id)}
                allPredictions={allPredsByMatch.get(m.id) ?? []}
              />
            ))}
          </div>
        </section>
      )}

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
