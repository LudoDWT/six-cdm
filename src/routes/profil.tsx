import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useAuth } from '@/hooks/useAuth'
import { useLeaderboard } from '@/hooks/useLeaderboard'
import { supabase } from '@/lib/supabase'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function ProfilPage() {
  const { session } = useAuth()
  const userId = session?.user.id
  const qc = useQueryClient()

  const {
    data: profile,
    isLoading: profileLoading,
    error: profileError,
  } = useQuery({
    queryKey: ['profile', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId!)
        .single()
      if (error) throw error
      return data
    },
    enabled: !!userId,
  })

  const { data: leaderboard } = useLeaderboard()

  const [displayName, setDisplayName] = useState('')
  const [saving, setSaving] = useState(false)

  // Keep input in sync with loaded profile (only when profile first loads)
  const profileDisplayName = profile?.display_name ?? ''

  async function handleSave() {
    if (!userId) return
    setSaving(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ display_name: displayName || profileDisplayName })
        .eq('id', userId)
      if (error) throw error
      await qc.invalidateQueries({ queryKey: ['profile', userId] })
      await qc.invalidateQueries({ queryKey: ['leaderboard'] })
      toast.success('Profil mis à jour')
    } catch (err) {
      toast.error(`Erreur : ${err instanceof Error ? err.message : 'inconnue'}`)
    } finally {
      setSaving(false)
    }
  }

  if (profileLoading) {
    return <div className="text-muted-foreground">Chargement…</div>
  }

  if (profileError) {
    return <div className="text-destructive">Erreur lors du chargement du profil.</div>
  }

  if (!profile || !userId) {
    return <div className="text-muted-foreground">Non connecté.</div>
  }

  const myRow = leaderboard?.find((r) => r.user_id === userId)

  // Use local state if user has typed, otherwise fall back to profile value
  const currentDisplayName = displayName !== '' ? displayName : profileDisplayName

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Profil</h1>

      <Card>
        <CardHeader>
          <CardTitle>Identité</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={profile.avatar_url ?? undefined} />
              <AvatarFallback>
                {profileDisplayName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-2">
              <label className="text-sm font-medium" htmlFor="display-name">
                Nom d'affichage
              </label>
              <div className="flex gap-2">
                <Input
                  id="display-name"
                  value={currentDisplayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Votre nom…"
                  className="flex-1"
                />
                <Button onClick={handleSave} disabled={saving} size="sm">
                  {saving ? 'Enregistrement…' : 'Enregistrer'}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {myRow && (
        <Card>
          <CardHeader>
            <CardTitle>Mes points</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="space-y-1">
                <dt className="text-sm text-muted-foreground">Total</dt>
                <dd className="text-2xl font-bold">{myRow.total_points ?? 0}</dd>
              </div>
              <div className="space-y-1">
                <dt className="text-sm text-muted-foreground">Matchs</dt>
                <dd className="text-2xl font-bold">{myRow.match_points ?? 0}</dd>
              </div>
              <div className="space-y-1">
                <dt className="text-sm text-muted-foreground">Bonus</dt>
                <dd className="text-2xl font-bold">{myRow.bonus_points ?? 0}</dd>
              </div>
              <div className="space-y-1">
                <dt className="text-sm text-muted-foreground">Scores exacts</dt>
                <dd className="text-2xl font-bold">{myRow.exact_count ?? 0}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
