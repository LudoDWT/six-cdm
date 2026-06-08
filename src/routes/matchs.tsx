import { toast } from 'sonner'
import { useMatches } from '@/hooks/useMatches'
import { usePredictions, useUpsertPrediction } from '@/hooks/usePredictions'
import { useAuth } from '@/hooks/useAuth'
import { useUIStore } from '@/stores/ui'
import { MatchCard } from '@/components/MatchCard'
import type { Stage } from '@/types/match'
import type { Tables } from '@/types/db'

const STAGE_OPTIONS: { value: Stage | 'all'; label: string }[] = [
  { value: 'all', label: 'Toutes les phases' },
  { value: 'group', label: 'Phase de groupes' },
  { value: 'round_of_32', label: '32es de finale' },
  { value: 'round_of_16', label: '8es de finale' },
  { value: 'quarter', label: 'Quarts de finale' },
  { value: 'semi', label: 'Demi-finales' },
  { value: 'third_place', label: 'Petite finale' },
  { value: 'final', label: 'Finale' },
]

const GROUP_OPTIONS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L']

export function MatchsPage() {
  const { data: matches, isLoading: matchesLoading, error: matchesError } = useMatches()
  const { data: predictions, isLoading: predsLoading } = usePredictions()
  const { session } = useAuth()
  const upsert = useUpsertPrediction()

  const { stageFilter, groupFilter, setStageFilter, setGroupFilter } = useUIStore()

  if (matchesLoading || predsLoading) {
    return <div className="text-muted-foreground">Chargement…</div>
  }

  if (matchesError) {
    return <div className="text-destructive">Erreur lors du chargement des matchs.</div>
  }

  const userId = session?.user.id

  // Build map match_id -> prediction for current user
  const predsByMatch = new Map<number, Tables<'predictions'>>()
  if (predictions && userId) {
    for (const pred of predictions) {
      if (pred.user_id === userId) {
        predsByMatch.set(pred.match_id, pred)
      }
    }
  }

  // Apply filters
  const filtered = (matches ?? []).filter((m) => {
    if (stageFilter !== 'all' && m.stage !== stageFilter) return false
    if (groupFilter !== 'all') {
      if (m.stage !== 'group') return false
      if (m.group_name !== groupFilter) return false
    }
    return true
  })

  const showGroupFilter = stageFilter === 'all' || stageFilter === 'group'

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Matchs</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select
          value={stageFilter}
          onChange={(e) => setStageFilter(e.target.value as Stage | 'all')}
          className="rounded-md border border-input bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          {STAGE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {showGroupFilter && (
          <select
            value={groupFilter}
            onChange={(e) => setGroupFilter(e.target.value)}
            className="rounded-md border border-input bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="all">Tous les groupes</option>
            {GROUP_OPTIONS.map((g) => (
              <option key={g} value={g}>
                Groupe {g}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Match list */}
      {filtered.length === 0 ? (
        <div className="text-muted-foreground">Aucun match pour ces filtres.</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {filtered.map((match) => (
            <MatchCard
              key={match.id}
              match={match}
              prediction={predsByMatch.get(match.id) ?? null}
              onSubmit={(s) => {
                if (!userId) return
                upsert.mutate(
                  {
                    user_id: userId,
                    match_id: match.id,
                    home_score: s.home,
                    away_score: s.away,
                  },
                  {
                    onSuccess: () => toast.success('Prono enregistré'),
                    onError: (err) =>
                      toast.error(`Erreur : ${err instanceof Error ? err.message : 'inconnue'}`),
                  },
                )
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
