import { useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function LoginPage() {
  const { session, loading, signInWithGoogle } = useAuth()
  const navigate = useNavigate()
  useEffect(() => {
    if (!loading && session) navigate({ to: '/' })
  }, [loading, session, navigate])

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-sm text-center">
        <CardHeader>
          <CardTitle>six-cdm — Pronostics CDM 2026</CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={() => signInWithGoogle()}>Se connecter avec Google</Button>
        </CardContent>
      </Card>
    </div>
  )
}
