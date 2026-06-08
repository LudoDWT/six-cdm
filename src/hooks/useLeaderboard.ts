import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export function useLeaderboard() {
  return useQuery({
    queryKey: ['leaderboard'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leaderboard').select('*').order('total_points', { ascending: false })
      if (error) throw error
      return data
    },
  })
}
