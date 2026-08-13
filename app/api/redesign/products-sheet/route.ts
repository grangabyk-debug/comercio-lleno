import type { NextRequest } from 'next/server'

export const runtime = 'nodejs'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://wtcntclzcubkbtcsqkzc.supabase.co'
const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? 'sb_publishable_02U2KDLDTR42KxdcFHtfYw_IDM00Deb'

type Profile = { role?: string | null; active?: boolean | null; permissions?: Record<string, boolean> | null }

function authorization(req: NextRequest) {
  const value = req.headers.get('authorization') || ''
  return value.toLowerCase().startsWith('bearer ') ? value : ''
}

async function authorizeProductAdministration(req: NextRequest) {
  const auth = authorization(req)
  if (!auth) return Response.json({ ok:false, error:'Sesión no disponible.' }, { status:401 })

  const userResponse = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: { apikey:PUBLISHABLE_KEY, Authorization:auth },
    cache: 'no-store',
  })
  const user = await userResponse.json().catch(() => null)
  if (!userResponse.ok || !user?.id) return Response.json({ ok:false, error:'Sesión no válida.' }, { status:401 })

  const profileResponse = await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${encodeURIComponent(String(user.id))}&select=role,active,permissions&limit=1`, {
    headers: { apikey:PUBLISHABLE_KEY, Authorization:auth },
    cache: 'no-store',
  })
  const rows = await profileResponse.json().catch(() => [])
  const profile: Profile | null = profileResponse.ok && Array.isArray(rows) ? rows[0] ?? null : null
  if (!profile || profile.active !== true) return Response.json({ ok:false, error:'Perfil del comercio no disponible.' }, { status:403 })

  const permissions = profile.permissions || {}
  const allowed = profile.role === 'owner'
    || profile.role === 'manager'
    || profile.role === 'supervisor'
    || permissions.can_manage_stock === true
    || permissions.can_edit_products === true
    || permissions.can_import_export_products === true

  if (!allowed) return Response.json({ ok:false, error:'No tenés permiso para importar, exportar o administrar productos.' }, { status:403 })
  return null
}

export async function GET(req: NextRequest) {
  const denied = await authorizeProductAdministration(req)
  if (denied) return denied
  const handler = await import('./handler')
  return handler.GET(req)
}

export async function POST(req: NextRequest) {
  const denied = await authorizeProductAdministration(req)
  if (denied) return denied
  const handler = await import('./handler')
  return handler.POST(req)
}
