import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export function useContributions() {
  return useQuery({
    queryKey: ['contributions'],
    queryFn: async () => {
      const { data, error } = await supabase.from('contributions').select('*')
      if (error) throw error
      return data
    },
  })
}

export function useSetContribution() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (p: { user_id: string; amount: number }) => {
      const { error } = await supabase
        .from('contributions')
        .upsert(
          { user_id: p.user_id, amount: p.amount, updated_at: new Date().toISOString() },
          { onConflict: 'user_id' },
        )
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['contributions'] }),
  })
}
