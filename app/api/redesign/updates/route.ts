import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://wtcntclzcubkbtcsqkzc.supabase.co'
const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? 'sb_publishable_02U2KDLDTR42KxdcFHtfYw_IDM00Deb'
const VERCEL_TOKEN = process.env.COMERCIO_UPDATES_VERCEL_TOKEN || process.env.VERCEL_API_TOKEN || ''
const PROJECT_ID = process.env.COMERCIO_UPDATES_PROJECT_ID || process.env.VERCEL_PROJECT_ID || 'prj_B5On6rxooSLbNsfc9U4dslI27uy6'
const TEAM_ID = process.env.COMERCIO_UPDATES_TEAM_ID || 'team_TSaB47sSMlYTSIjRCP28lsyv'
const RELEASE_PREFIX = process.env.COMERCIO_UPDATES_RELEASE_PREFIX || 'release/'

type Deployment = {
  uid?: string
  id?: string
  url?: string
  name?: string
  state?: string
  readyState?: string
  target?: string | null
  created?: number
  createdAt?: number
  projectId?: string
  meta?: Record<string, unknown>
  gitSource?: { ref?: string | null; sha?: string | null }
}

type Release = {
  id: string
  version: string
  title: string
  notes: string[]
  createdAt: string | null
  branch: string | null
  commitSha: string | null
  url: string | null
}

function branchOf(deployment: Deployment) {
  const meta = deployment.meta || {}
  return String(deployment.gitSource?.ref || meta.githubCommitRef || meta.gitlabCommitRef || meta.bitbucketCommitRef || '') || null
}

function shaOf(deployment: Deployment) {
  const meta = deployment.meta || {}
  return String(deployment.gitSource?.sha || meta.githubCommitSha || meta.gitlabCommitSha || meta.bitbucketCommitSha || '') || null
}

function commitMessageOf(deployment: Deployment) {
  const meta = deployment.meta || {}
  return String(meta.githubCommitMessage || meta.gitlabCommitMessage || meta.bitbucketCommitMessage || '').trim()
}

function deploymentId(deployment: Deployment) {
  return String(deployment.uid || deployment.id || '')
}

function isReady(deployment: Deployment) {
  return String(deployment.readyState || deployment.state || '').toUpperCase() === 'READY'
}

function releaseFrom(deployment: Deployment): Release {
  const branch = branchOf(deployment)
  const sha = shaOf(deployment)
  const commitMessage = commitMessageOf(deployment)
  const lines = commitMessage.split('\n').map(x => x.trim()).filter(Boolean)
  const cleanBranch = branch?.startsWith(RELEASE_PREFIX) ? branch.slice(RELEASE_PREFIX.length) : branch
  const rawVersion = cleanBranch || (sha ? sha.slice(0, 7) : 'versión')
  const version = /^v/i.test(rawVersion || '') ? String(rawVersion) : `v${rawVersion}`
  const title = lines[0] || (branch?.startsWith(RELEASE_PREFIX) ? 'Actualización preparada' : 'Versión de Comercio Lleno')
  const notes = lines.slice(1, 6)
  if (!notes.length && branch?.startsWith(RELEASE_PREFIX)) notes.push('Mejoras y correcciones preparadas para esta versión.')
  const created = Number(deployment.created || deployment.createdAt || 0)
  return {
    id: deploymentId(deployment),
    version,
    title,
    notes,
    createdAt: created ? new Date(created).toISOString() : null,
    branch,
    commitSha: sha,
    url: deployment.url ? `https://${deployment.url}` : null,
  }
}

async function requireOwner(req: NextRequest) {
  const authorization = req.headers.get('authorization') || ''
  if (!authorization.toLowerCase().startsWith('bearer ')) throw new Error('UNAUTHORIZED')

  const userResponse = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: { apikey: PUBLISHABLE_KEY, Authorization: authorization },
    cache: 'no-store',
  })
  const user = await userResponse.json().catch(() => null)
  if (!userResponse.ok || !user?.id) throw new Error('UNAUTHORIZED')

  const profileResponse = await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${encodeURIComponent(String(user.id))}&select=role,active&limit=1`, {
    headers: { apikey: PUBLISHABLE_KEY, Authorization: authorization },
    cache: 'no-store',
  })
  const rows = await profileResponse.json().catch(() => [])
  const profile = Array.isArray(rows) ? rows[0] : null
  if (!profileResponse.ok || !profile || profile.active === false || profile.role !== 'owner') throw new Error('FORBIDDEN')
  return user
}

async function vercel(path: string, init: RequestInit = {}) {
  if (!VERCEL_TOKEN) throw new Error('NOT_CONFIGURED')
  const response = await fetch(`https://api.vercel.com${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${VERCEL_TOKEN}`,
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
    cache: 'no-store',
  })
  const text = await response.text()
  let body: any = null
  try { body = text ? JSON.parse(text) : null } catch { body = text }
  if (!response.ok) {
    const detail = body?.error?.message || body?.message || text || `Vercel respondió ${response.status}`
    throw new Error(`VERCEL:${detail}`)
  }
  return body
}

async function listDeployments(): Promise<Deployment[]> {
  const params = new URLSearchParams({ projectId: PROJECT_ID, teamId: TEAM_ID, limit: '100' })
  const body = await vercel(`/v6/deployments?${params.toString()}`)
  return Array.isArray(body?.deployments) ? body.deployments : []
}

function sortNewest(rows: Deployment[]) {
  return [...rows].sort((a, b) => Number(b.created || b.createdAt || 0) - Number(a.created || a.createdAt || 0))
}

function publicCurrentRelease(): Release {
  const sha = process.env.VERCEL_GIT_COMMIT_SHA || ''
  const branch = process.env.VERCEL_GIT_COMMIT_REF || null
  return {
    id: process.env.VERCEL_DEPLOYMENT_ID || sha || 'current',
    version: sha ? `v${sha.slice(0, 7)}` : 'versión actual',
    title: 'Versión instalada',
    notes: [],
    createdAt: null,
    branch,
    commitSha: sha || null,
    url: process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
  }
}

function jsonError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error)
  if (message === 'UNAUTHORIZED') return NextResponse.json({ ok: false, error: 'Sesión no disponible.' }, { status: 401 })
  if (message === 'FORBIDDEN') return NextResponse.json({ ok: false, error: 'Solo el Propietario puede administrar actualizaciones.' }, { status: 403 })
  if (message === 'NOT_CONFIGURED') return NextResponse.json({ ok: false, error: 'El servicio seguro de actualizaciones todavía no está conectado.' }, { status: 503 })
  return NextResponse.json({ ok: false, error: message.replace(/^VERCEL:/, '') }, { status: 500 })
}

export async function GET(req: NextRequest) {
  try {
    await requireOwner(req)
    const production = process.env.VERCEL_ENV === 'production'
    if (!VERCEL_TOKEN) {
      return NextResponse.json({
        ok: true,
        configured: false,
        production,
        current: publicCurrentRelease(),
        available: null,
        previous: null,
        history: [publicCurrentRelease()],
        reason: 'El Centro está instalado. Falta conectar la credencial segura de publicación para recibir y restaurar versiones.',
      })
    }

    const deployments = sortNewest(await listDeployments()).filter(isReady)
    const productionDeployments = deployments.filter(d => d.target === 'production')
    const currentDeployment = productionDeployments[0] || null
    const currentSha = currentDeployment ? shaOf(currentDeployment) : process.env.VERCEL_GIT_COMMIT_SHA || null
    const candidates = deployments.filter(d => {
      const branch = branchOf(d)
      return d.target !== 'production' && Boolean(branch?.startsWith(RELEASE_PREFIX)) && (!currentSha || shaOf(d) !== currentSha)
    })
    const availableDeployment = candidates[0] || null
    const previousDeployment = productionDeployments[1] || null

    return NextResponse.json({
      ok: true,
      configured: true,
      production,
      current: currentDeployment ? releaseFrom(currentDeployment) : publicCurrentRelease(),
      available: availableDeployment ? releaseFrom(availableDeployment) : null,
      previous: previousDeployment ? releaseFrom(previousDeployment) : null,
      history: productionDeployments.slice(0, 5).map(releaseFrom),
      reason: null,
    })
  } catch (error) {
    return jsonError(error)
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireOwner(req)
    if (process.env.VERCEL_ENV !== 'production') {
      return NextResponse.json({ ok: false, error: 'Por seguridad, instalar o volver atrás solo se puede ejecutar desde Comercio Lleno en producción.' }, { status: 409 })
    }
    if (!VERCEL_TOKEN) throw new Error('NOT_CONFIGURED')

    const body = await req.json().catch(() => ({})) as { action?: string; deploymentId?: string }
    const action = String(body.action || '')
    const requestedId = String(body.deploymentId || '')
    if (!requestedId || !['install', 'rollback'].includes(action)) {
      return NextResponse.json({ ok: false, error: 'Acción de actualización inválida.' }, { status: 400 })
    }

    const deployments = sortNewest(await listDeployments()).filter(isReady)
    const target = deployments.find(d => deploymentId(d) === requestedId)
    if (!target) return NextResponse.json({ ok: false, error: 'La versión solicitada ya no está disponible.' }, { status: 404 })

    if (action === 'install') {
      const branch = branchOf(target)
      if (target.target === 'production' || !branch?.startsWith(RELEASE_PREFIX)) {
        return NextResponse.json({ ok: false, error: 'Esa versión no está marcada como actualización publicable.' }, { status: 400 })
      }
      await vercel(`/v10/projects/${encodeURIComponent(PROJECT_ID)}/promote/${encodeURIComponent(requestedId)}?teamId=${encodeURIComponent(TEAM_ID)}`, { method: 'POST', body: '{}' })
      return NextResponse.json({ ok: true, action: 'install', deploymentId: requestedId })
    }

    const productionDeployments = deployments.filter(d => d.target === 'production')
    const previous = productionDeployments[1]
    if (!previous || deploymentId(previous) !== requestedId) {
      return NextResponse.json({ ok: false, error: 'Solo se puede restaurar la versión de producción inmediatamente anterior.' }, { status: 400 })
    }
    await vercel(`/v1/projects/${encodeURIComponent(PROJECT_ID)}/rollback/${encodeURIComponent(requestedId)}?teamId=${encodeURIComponent(TEAM_ID)}&description=${encodeURIComponent('Rollback solicitado desde Comercio Lleno')}`, { method: 'POST', body: '{}' })
    return NextResponse.json({ ok: true, action: 'rollback', deploymentId: requestedId })
  } catch (error) {
    return jsonError(error)
  }
}
