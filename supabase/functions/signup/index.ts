// Edge Function `signup` — crée un compte déjà confirmé (API admin, sans email
// de confirmation) pour éviter toute dépendance SMTP. Déployée avec verify_jwt=false
// (endpoint d'inscription public, validation interne).
import { createClient } from 'jsr:@supabase/supabase-js@2'

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json' },
  })
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  if (req.method !== 'POST')
    return json({ ok: false, error: 'Méthode non autorisée.', code: 'method' }, 405)

  let payload: { email?: string; password?: string; displayName?: string }
  try {
    payload = await req.json()
  } catch {
    return json({ ok: false, error: 'Requête invalide.', code: 'bad_request' })
  }

  const email = (payload.email ?? '').trim()
  const password = payload.password ?? ''
  const displayName = (payload.displayName ?? '').trim()

  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email))
    return json({ ok: false, error: 'Adresse email invalide.', code: 'validation' })
  if (password.length < 6)
    return json({ ok: false, error: 'Mot de passe trop court (6 caractères minimum).', code: 'weak_password' })
  if (displayName.length < 2)
    return json({ ok: false, error: 'Choisis un pseudo (au moins 2 caractères).', code: 'validation' })

  const admin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  const { error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { display_name: displayName },
  })

  if (error) {
    const dup = /already|exist|registered/i.test(error.message)
    return json({
      ok: false,
      error: dup
        ? 'Un compte existe déjà avec cet email — connecte-toi plutôt.'
        : error.message,
      code: dup ? 'user_already_exists' : 'create_failed',
    })
  }

  return json({ ok: true })
})
