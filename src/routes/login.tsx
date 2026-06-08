import { useEffect, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { BallLogo } from '@/components/BallLogo'

type AuthErr = { message?: string; code?: string; status?: number }

/** Traduit les erreurs d'auth Supabase en messages clairs en français. */
function authErrorFr(error: AuthErr): string {
  const code = error.code ?? ''
  const msg = (error.message ?? '').toLowerCase()
  if (code === 'invalid_credentials' || msg.includes('invalid login credentials'))
    return 'Email ou mot de passe incorrect.'
  if (
    code === 'user_already_exists' ||
    msg.includes('already registered') ||
    msg.includes('already been registered')
  )
    return 'Un compte existe déjà avec cet email — connecte-toi plutôt.'
  if (code === 'weak_password' || msg.includes('password should be at least'))
    return 'Mot de passe trop court (6 caractères minimum).'
  if (code === 'email_not_confirmed' || msg.includes('email not confirmed'))
    return "Ce compte n'est pas encore confirmé — préviens l'admin."
  if (error.status === 429 || code.includes('rate_limit') || msg.includes('rate limit'))
    return 'Trop de tentatives — patiente quelques minutes avant de réessayer.'
  if (msg.includes('unable to validate email') || msg.includes('invalid email'))
    return 'Adresse email invalide.'
  return error.message || 'Une erreur est survenue. Réessaie.'
}

export function LoginPage() {
  const { session, loading, signUp, signIn } = useAuth()
  const navigate = useNavigate()
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)

  useEffect(() => {
    if (!loading && session) navigate({ to: '/' })
  }, [loading, session, navigate])

  if (loading) return null

  const switchMode = (m: 'login' | 'signup') => {
    setMode(m)
    setError(null)
    setInfo(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setInfo(null)

    // Validation côté client
    if (mode === 'signup' && displayName.trim().length < 2) {
      setError('Choisis un pseudo (au moins 2 caractères).')
      return
    }
    if (password.length < 6) {
      setError('Le mot de passe doit faire au moins 6 caractères.')
      return
    }

    setBusy(true)
    try {
      if (mode === 'signup') {
        const { data, error: err } = await signUp(email.trim(), password, displayName.trim())
        if (err) {
          setError(authErrorFr(err))
          return
        }
        if (data.session) {
          // Connecté directement (confirmation email désactivée) → la redirection se fait via l'effet
          return
        }
        // Compte créé mais session absente (confirmation email active)
        switchMode('login')
        setInfo('Compte créé ✅ Connecte-toi avec ton email et ton mot de passe.')
      } else {
        const { error: err } = await signIn(email.trim(), password)
        if (err) {
          setError(authErrorFr(err))
          return
        }
        // Succès → redirection via l'effet
      }
    } catch {
      setError('Impossible de joindre le serveur. Vérifie ta connexion.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 py-12">
      <div className="relative z-10 w-full max-w-md text-center">
        <div className="mb-8 flex flex-col items-center gap-4">
          <span
            aria-hidden
            className="grid size-20 place-items-center rounded-full bg-primary shadow-xl shadow-primary/25 ring-1 ring-primary/20"
          >
            <BallLogo className="size-12 text-[#0b3a2a]" />
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
            {mode === 'signup'
              ? 'Crée ton compte pour rejoindre la partie.'
              : 'Connecte-toi, pronostique et grimpe au classement.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-3 text-left">
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
              placeholder="6 caractères minimum"
              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
            />
          </div>

          {error && (
            <p
              role="alert"
              className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive"
            >
              {error}
            </p>
          )}
          {info && !error && (
            <p
              role="status"
              className="rounded-lg border border-primary/30 bg-primary/10 px-3 py-2 text-sm font-medium text-primary"
            >
              {info}
            </p>
          )}

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
            onClick={() => switchMode(mode === 'signup' ? 'login' : 'signup')}
            className="font-semibold text-accent underline-offset-4 hover:underline"
          >
            {mode === 'signup' ? 'Se connecter' : 'Créer un compte'}
          </button>
        </p>
      </div>
    </div>
  )
}
