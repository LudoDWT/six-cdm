import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { computePoints } from '@/lib/scoring'
import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from '@/components/ui/table'
import type { Tables } from '@/types/db'

interface Props {
  matchId: number
  match: Tables<'matches'>
}

type PredictionWithProfile = {
  id: string
  user_id: string
  match_id: number
  home_score: number
  away_score: number
  created_at: string
  updated_at: string
  profiles: { display_name: string; avatar_url: string | null } | null
}

const isFinished = (match: Tables<'matches'>) =>
  match.home_score !== null && match.away_score !== null

export function PredictionsTable({ matchId, match }: Props) {
  const { data, isLoading } = useQuery({
    queryKey: ['predictions', matchId, 'withProfiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('predictions')
        .select('*, profiles(display_name, avatar_url)')
        .eq('match_id', matchId)
      if (error) throw error
      return data as PredictionWithProfile[]
    },
  })

  const finished = isFinished(match)

  if (isLoading) {
    return <div className="text-sm text-muted-foreground">Chargement des pronos…</div>
  }

  if (!data || data.length === 0) {
    return <div className="text-sm text-muted-foreground">Aucun prono pour ce match.</div>
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Joueur</TableHead>
          <TableHead>Prono</TableHead>
          {finished && <TableHead>Points</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((pred) => {
          const points = finished
            ? computePoints(
                { h: pred.home_score, a: pred.away_score },
                { h: match.home_score!, a: match.away_score! },
              )
            : null

          return (
            <TableRow key={pred.id}>
              <TableCell>{pred.profiles?.display_name ?? pred.user_id}</TableCell>
              <TableCell>
                {pred.home_score} – {pred.away_score}
              </TableCell>
              {finished && (
                <TableCell>
                  {points !== null ? `+${points} pts` : '—'}
                </TableCell>
              )}
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}
