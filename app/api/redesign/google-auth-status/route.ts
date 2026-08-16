import { NextResponse } from 'next/server'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://wtcntclzcubkbtcsqkzc.supabase.co'
const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? 'sb_publishable_02U2KDLDTR42KxdcFHtfYw_IDM00Deb'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const response = await fetch(`${SUPABASE_URL}/auth/v1/settings`, {
      headers: { apikey: PUBLISHABLE_KEY },
      cache: 'no-store',
    })
    const data = await response.json().catch(() => ({}))
    if (!response.ok) {
      return NextResponse.json({ ok: false, google: false, error: data?.message || data?.error || `HTTP ${response.status}` }, { status: 502 })
    }
    return NextResponse.json({
      ok: true,
      google: data?.external?.google === true,
      callbackUrl: `${SUPABASE_URL}/auth/v1/callback`,
    })
  } catch (error) {
    return NextResponse.json({ ok: false, google: false, error: error instanceof Error ? error.message : String(error) }, { status: 500 })
  }
}
