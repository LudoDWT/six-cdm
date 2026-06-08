import { useEffect, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { BallLogo } from '@/components/BallLogo'

export function LoginPage() {
  const { session, loading, signUp, signIn } = useAuth()
  const navigate = useNavigate()
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!loading && session) navigate({ to: '/' })
  }, [loading, session, navigate])

  if (loading) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)
    try {
      if (mode === 'signup') {
        const { error } = await signUp(email, password, displayName.trim())
        if (error) throw error
        toast.success('Compte créé, bienvenue ! ⚽')
      } else {
        const { error } = await signIn(email, password)
        if (error) throw error
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Une erreur est survenue')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 py-12">
      {/* Bande de pelouse en bas */}
      <div className="pitch-stripes pointer-events-none absolute inset-x-0 bottom-0 h-40 opacity-60" />

      <div className="relative z-10 w-full max-w-md text-center">
        <div className="mb-8 flex flex-col items-center gap-4">
          <span
            aria-hidden
            className="grid size-16 place-items-center rounded-2xl bg-primary shadow-lg shadow-primary/20"
          >
            <BallLogo className="size-9 text-white" />
          </span>
          <div className="space-y-2">
            <p className="font-display text-sm tracking-[0.3em] text-accent">
              COUPE DU MONDE 2026
            </p>
            <h1 className="font-display text-festival text-6xl leading-[0.9] sm:text-7xl">
              six-cdm
            </h1>
          </div>
          <p className="max-w-xs text-balance text-muted-foreground">
            Pronostique chaque match, défie tes amis et grimpe au classement. Que la fête
            commence ! 🇺🇸 🇲🇽 🇨🇦
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-left">
          {mode === 'signup' && (
            <div className="space-y-1">
              <label htmlFor="displayName" className="text-sm font-medium">
                Pseudo
              </label>
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Ton nom de joueur"
                required
                autoComplete="nickname"
              />
            </div>
          )}
          <div className="space-y-1">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="toi@exemple.com"
              required
              autoComplete="email"
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="password" className="text-sm font-medium">
              Mot de passe
            </label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
            />
          </div>

          <Button
            type="submit"
            size="lg"
            disabled={busy}
            className="h-12 w-full gap-2.5 text-base font-semibold shadow-lg shadow-primary/20 transition-transform hover:-translate-y-0.5"
          >
            {busy
              ? 'Un instant…'
              : mode === 'signup'
                ? 'Créer mon compte'
                : 'Se connecter'}
          </Button>
        </form>

        <p className="mt-6 text-sm text-muted-foreground">
          {mode === 'signup' ? 'Déjà un compte ?' : 'Pas encore de compte ?'}{' '}
          <button
            type="button"
            onClick={() => setMode(mode === 'signup' ? 'login' : 'signup')}
            className="font-semibold text-accent underline-offset-4 hover:underline"
          >
            {mode === 'signup' ? 'Se connecter' : 'Créer un compte'}
          </button>
        </p>
      </div>
    </div>
  )
}
