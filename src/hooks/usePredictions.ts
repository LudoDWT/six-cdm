import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export function usePredictions() {
  return useQuery({
    queryKey: ['predictions'],
    queryFn: async () => {
      const { data, error } = await supabase.from('predictions').select('*')
      if (error) throw error
      return data
    },
  })
}

export function useUpsertPrediction() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (p: { user_id: string; match_id: number; home_score: number; away_score: number }) => {
      const { error } = await supabase
        .from('predictions')
        .upsert({ ...p, updated_at: new Date().toISOString() }, { onConflict: 'user_id,match_id' })
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['predictions'] })
      qc.invalidateQueries({ queryKey: ['leaderboard'] })
    },
  })
}
