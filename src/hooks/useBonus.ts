import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export function useBonusQuestions() {
  return useQuery({
    queryKey: ['bonus_questions'],
    queryFn: async () => {
      const { data, error } = await supabase.from('bonus_questions').select('*').order('id')
      if (error) throw error
      return data
    },
  })
}

export function useBonusPredictions() {
  return useQuery({
    queryKey: ['bonus_predictions'],
    queryFn: async () => {
      const { data, error } = await supabase.from('bonus_predictions').select('*')
      if (error) throw error
      return data
    },
  })
}

export function useUpsertBonus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (p: { user_id: string; bonus_question_id: number; answer: string }) => {
      const { error } = await supabase
        .from('bonus_predictions').upsert(p, { onConflict: 'user_id,bonus_question_id' })
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bonus_predictions'] })
      qc.invalidateQueries({ queryKey: ['leaderboard'] })
    },
  })
}
