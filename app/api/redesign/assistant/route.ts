import type { NextRequest } from 'next/server'
import { getVercelOidcToken } from '@vercel/oidc'

export async function POST(req: NextRequest) {
  if (!process.env.AI_GATEWAY_API_KEY && !process.env.VERCEL_OIDC_TOKEN) {
    try {
      const token = await getVercelOidcToken()
      if (token) process.env.VERCEL_OIDC_TOKEN = token
    } catch {}
  }
  const handler = await import('./handler-v2')
  return handler.POST(req)
}
