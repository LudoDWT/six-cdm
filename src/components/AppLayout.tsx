import { Link, Outlet, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Toaster } from '@/components/ui/sonner'

export function AppLayout() {
  const { session, loading, signOut } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading && !session) navigate({ to: '/login' })
  }, [loading, session, navigate])

  if (loading) return <div className="flex min-h-screen items-center justify-center">Chargement…</div>
  if (!session) return null

  return (
    <div className="min-h-screen">
      <header className="border-b">
        <nav className="mx-auto flex max-w-5xl items-center gap-4 p-4">
          <Link to="/" className="font-bold">six-cdm</Link>
          <Link to="/matchs">Matchs</Link>
          <Link to="/classement">Classement</Link>
          <Link to="/bonus">Bonus</Link>
          <Link to="/profil">Profil</Link>
          <Button variant="ghost" className="ml-auto" onClick={() => signOut()}>Déconnexion</Button>
        </nav>
      </header>
      <main className="mx-auto max-w-5xl p-4">
        <Outlet />
      </main>
      <Toaster />
    </div>
  )
}
