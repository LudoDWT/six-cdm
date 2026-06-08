import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

type AuthErr = { message: string; code?: string; status?: number } | null

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => sub.subscription.unsubscribe()
  }, [])

  // Inscription via l'Edge Function `signup` : crée un compte déjà confirmé
  // (API admin, sans email de confirmation), puis ouvre la session.
  const signUp = async (
    email: string,
    password: string,
    displayName: string,
  ): Promise<{ data: { session: Session | null }; error: AuthErr }> => {
    const { data, error } = await supabase.functions.invoke('signup', {
      body: { email, password, displayName },
    })
    if (error) {
      return { data: { session: null }, error: { message: 'Serveur indisponible, réessaie.' } }
    }
    if (!data?.ok) {
      return {
        data: { session: null },
        error: { message: data?.error ?? 'Inscription impossible.', code: data?.code },
      }
    }
    const res = await supabase.auth.signInWithPassword({ email, password })
    return { data: { session: res.data.session }, error: res.error }
  }

  const signIn = (email: string, password: string) =>
    supabase.auth.signInWithPassword({ email, password })

  const signOut = () => supabase.auth.signOut()

  return { session, loading, signUp, signIn, signOut }
}
