import { Link, Outlet, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import { LogOut } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Toaster } from '@/components/ui/sonner'
import { BallLogo } from '@/components/BallLogo'
import { Flag } from '@/components/Flag'

const NAV = [
  { to: '/', label: 'Accueil' },
  { to: '/matchs', label: 'Matchs' },
  { to: '/classement', label: 'Classement' },
  { to: '/bonus', label: 'Bonus' },
  { to: '/cagnotte', label: 'Cagnotte' },
  { to: '/regles', label: 'Règles' },
  { to: '/profil', label: 'Profil' },
] as const

export function AppLayout() {
  const { session, loading, signOut } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading && !session) navigate({ to: '/login' })
  }, [loading, session, navigate])

  if (loading)
    return (
      <div className="flex min-h-screen items-center justify-center text-muted-foreground">
        Chargement…
      </div>
    )
  if (!session) return null

  const user = session.user
  const name =
    (user.user_metadata?.full_name as string | undefined) ??
    (user.user_metadata?.name as string | undefined) ??
    user.email ??
    '?'
  const avatar = user.user_metadata?.avatar_url as string | undefined

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/80 backdrop-blur-md">
        {/* Liseré festif en haut */}
        <div className="festival-rule h-1 w-full" />
        <nav className="mx-auto flex max-w-5xl items-center gap-1 px-4 py-3">
          <Link to="/" className="group mr-2 flex items-center gap-2">
            <span
              aria-hidden
              className="grid size-8 place-items-center rounded-full bg-primary shadow-sm ring-1 ring-primary/20 transition-transform group-hover:-rotate-12"
            >
              <BallLogo className="size-6 text-[#0b3a2a]" />
            </span>
            <span className="font-display text-festival text-2xl leading-none tracking-tight">
              six-cdm
            </span>
          </Link>

          <div className="ml-1 hidden items-center gap-0.5 sm:flex">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                activeOptions={{ exact: item.to === '/' }}
                className="rounded-full px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground data-[status=active]:bg-primary/12 data-[status=active]:text-primary"
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="ml-auto flex items-center gap-2">
            <Avatar className="size-8 ring-2 ring-accent/40">
              <AvatarImage src={avatar} />
              <AvatarFallback className="bg-secondary text-xs font-semibold">
                {name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Déconnexion"
              title="Déconnexion"
              onClick={() => signOut()}
            >
              <LogOut />
            </Button>
          </div>
        </nav>

        {/* Nav mobile */}
        <div className="flex items-center gap-1 overflow-x-auto px-4 pb-2 sm:hidden">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: item.to === '/' }}
              className="shrink-0 rounded-full px-3 py-1 text-sm font-medium text-muted-foreground transition-colors data-[status=active]:bg-primary/12 data-[status=active]:text-primary"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">
        <Outlet />
      </main>

      <footer className="mx-auto flex w-full max-w-5xl items-center justify-center gap-1.5 px-4 py-6 text-center text-xs text-muted-foreground">
        six-cdm · Coupe du Monde 2026 ·
        <Flag team="Canada" className="h-3 w-4" />
        <Flag team="Mexique" className="h-3 w-4" />
        <Flag team="États-Unis" className="h-3 w-4" />
      </footer>

      <Toaster />
    </div>
  )
}
