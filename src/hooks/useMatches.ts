import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export function useMatches() {
  return useQuery({
    queryKey: ['matches'],
    queryFn: async () => {
      const { data, error } = await supabase.from('matches').select('*').order('kickoff_at')
      if (error) throw error
      return data
    },
  })
}
