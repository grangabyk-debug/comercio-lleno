import type { NextRequest } from 'next/server'

export const runtime = 'nodejs'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://wtcntclzcubkbtcsqkzc.supabase.co'
const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? 'sb_publishable_02U2KDLDTR42KxdcFHtfYw_IDM00Deb'

type Profile = { active?: boolean | null }

function authorization(req: NextRequest) {
  const value = req.headers.get('authorization') || ''
  return value.toLowerCase().startsWith('bearer ') ? value : ''
}

async function branchPermission(auth:string,branchId:string,key:string){
  const response=await fetch(`${SUPABASE_URL}/rest/v1/rpc/branch_has_permission`,{method:'POST',headers:{apikey:PUBLISHABLE_KEY,Authorization:auth,'Content-Type':'application/json'},body:JSON.stringify({p_branch:branchId,p_key:key,p_default_roles:['manager','supervisor']}),cache:'no-store'})
  const value=await response.json().catch(()=>false)
  return response.ok&&value===true
}

async function authorizeProductAdministration(req: NextRequest) {
  const auth = authorization(req)
  if (!auth) return Response.json({ ok:false, error:'Sesión no disponible.' }, { status:401 })
  const branchId=String(req.headers.get('x-comercio-branch-id')||'').trim()
  if(!/^[0-9a-f-]{36}$/i.test(branchId))return Response.json({ok:false,error:'Elegí una sucursal válida.'},{status:400})

  const userResponse = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: { apikey:PUBLISHABLE_KEY, Authorization:auth },
    cache: 'no-store',
  })
  const user = await userResponse.json().catch(() => null)
  if (!userResponse.ok || !user?.id) return Response.json({ ok:false, error:'Sesión no válida.' }, { status:401 })

  const profileResponse = await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${encodeURIComponent(String(user.id))}&select=active&limit=1`, {
    headers: { apikey:PUBLISHABLE_KEY, Authorization:auth },
    cache: 'no-store',
  })
  const rows = await profileResponse.json().catch(() => [])
  const profile: Profile | null = profileResponse.ok && Array.isArray(rows) ? rows[0] ?? null : null
  if (!profile || profile.active !== true) return Response.json({ ok:false, error:'Perfil del comercio no disponible.' }, { status:403 })

  const [stock,edit,sheets]=await Promise.all([
    branchPermission(auth,branchId,'can_manage_stock'),
    branchPermission(auth,branchId,'can_edit_products'),
    branchPermission(auth,branchId,'can_import_export_products'),
  ])
  if(!stock&&!edit&&!sheets)return Response.json({ok:false,error:'No tenés permiso para administrar productos en esta sucursal.'},{status:403})
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
