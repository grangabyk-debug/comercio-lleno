'use client'

import { useEffect } from 'react'
import { isSessionExpiredError, readTenantSession, refreshTenantSession } from '@/lib/comercio/session'

const SUPABASE_HOST = 'wtcntclzcubkbtcsqkzc.supabase.co'
const PROTECTED_LOCAL_PREFIXES = ['/api/redesign/']

export default function SessionFetchGuard() {
  useEffect(() => {
    const nativeFetch = window.fetch.bind(window)
    let refreshing: Promise<string> | null = null

    async function freshToken() {
      if (refreshing) return refreshing
      refreshing = (async () => {
        const session = readTenantSession()
        if (!session) throw new Error('Sesión no disponible')
        return (await refreshTenantSession(session, true)).token
      })()
      try { return await refreshing }
      finally { refreshing = null }
    }

    function isProtected(url: URL) {
      const directSupabase = url.hostname === SUPABASE_HOST &&
        (url.pathname.startsWith('/rest/v1/') || url.pathname.startsWith('/functions/v1/'))
      const localApi = url.origin === location.origin && PROTECTED_LOCAL_PREFIXES.some(prefix => url.pathname.startsWith(prefix))
      return directSupabase || localApi
    }

    function withCurrentToken(request: Request) {
      const current = localStorage.getItem('cl_access_token') || ''
      const auth = request.headers.get('Authorization') || ''
      if (!current || !auth.startsWith('Bearer ') || auth === `Bearer ${current}`) return request
      const headers = new Headers(request.headers)
      headers.set('Authorization', `Bearer ${current}`)
      return new Request(request, { headers })
    }

    const guarded: typeof window.fetch = async (input, init) => {
      let request = new Request(input, init)
      const url = new URL(request.url, location.origin)
      const protectedCall = isProtected(url)
      if (protectedCall) request = withCurrentToken(request)

      const response = await nativeFetch(request.clone())
      if (!protectedCall || response.status !== 401) return response

      try {
        const token = await freshToken()
        const headers = new Headers(request.headers)
        headers.set('Authorization', `Bearer ${token}`)
        return await nativeFetch(new Request(request, { headers }))
      } catch (error) {
        if (isSessionExpiredError(error) || /sesión|session|jwt/i.test(error instanceof Error ? error.message : String(error))) {
          location.replace('/redesign/access?expired=1')
        }
        return response
      }
    }

    window.fetch = guarded
    return () => { window.fetch = nativeFetch }
  }, [])
  return null
}
