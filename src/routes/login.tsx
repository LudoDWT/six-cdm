import { useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'

export function LoginPage() {
  const { session, loading, signInWithGoogle } = useAuth()
  const navigate = useNavigate()
  useEffect(() => {
    if (!loading && session) navigate({ to: '/' })
  }, [loading, session, navigate])

  if (loading) return null

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 py-12">
      {/* Bande de pelouse en bas */}
      <div className="pitch-stripes pointer-events-none absolute inset-x-0 bottom-0 h-40 opacity-60" />

      <div className="relative z-10 w-full max-w-md text-center">
        <div className="mb-8 flex flex-col items-center gap-4">
          <span
            aria-hidden
            className="grid size-16 place-items-center rounded-2xl bg-primary text-4xl shadow-lg shadow-primary/20"
          >
            ⚽
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

        <Button
          size="lg"
          onClick={() => signInWithGoogle()}
          className="h-12 w-full gap-2.5 text-base font-semibold shadow-lg shadow-primary/20 transition-transform hover:-translate-y-0.5"
        >
          <GoogleIcon />
          Se connecter avec Google
        </Button>

        <p className="mt-6 text-xs text-muted-foreground">
          Connexion sécurisée · aucun engagement
        </p>
      </div>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" aria-hidden>
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8a12 12 0 1 1 0-24c3 0 5.8 1.1 7.9 3l5.7-5.7A20 20 0 1 0 24 44c11 0 20-8.9 20-20 0-1.3-.1-2.4-.4-3.5z"
      />
      <path
        fill="#FF3D00"
        d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3 0 5.8 1.1 7.9 3l5.7-5.7A20 20 0 0 0 6.3 14.7z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2A12 12 0 0 1 12.7 28l-6.5 5C9.6 39.6 16.3 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3a12 12 0 0 1-4.1 5.6l6.2 5.2C39.9 36.3 44 30.7 44 24c0-1.3-.1-2.4-.4-3.5z"
      />
    </svg>
  )
}
