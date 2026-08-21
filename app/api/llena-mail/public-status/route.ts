import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

const RESEND_API = 'https://api.resend.com'
const DOMAIN = 'postulamejor.com'

export async function GET() {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) return NextResponse.json({ ok: false, error: 'mail_provider_not_configured' }, { status: 503 })

  const headers = { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' }
  const listed = await fetch(`${RESEND_API}/domains`, { headers, cache: 'no-store' })
  const listData = await listed.json().catch(() => ({}))
  if (!listed.ok) return NextResponse.json({ ok: false, error: 'provider_error' }, { status: 502 })

  const row = Array.isArray(listData?.data)
    ? listData.data.find((item: any) => String(item?.name || '').toLowerCase() === DOMAIN)
    : null
  if (!row?.id) return NextResponse.json({ ok: false, error: 'domain_not_found' }, { status: 404 })

  const detail = await fetch(`${RESEND_API}/domains/${encodeURIComponent(row.id)}`, { headers, cache: 'no-store' })
  const data = await detail.json().catch(() => ({}))
  if (!detail.ok) return NextResponse.json({ ok: false, error: 'provider_error' }, { status: 502 })

  const records = Array.isArray(data?.records)
    ? data.records.map((record: any) => ({
        record: record?.record ?? null,
        name: record?.name ?? null,
        type: record?.type ?? null,
        status: record?.status ?? null,
        ttl: record?.ttl ?? null,
        value: record?.value ?? null,
        priority: record?.priority ?? null,
      }))
    : []

  return NextResponse.json({
    ok: true,
    domain: DOMAIN,
    status: data?.status ?? row?.status ?? null,
    region: data?.region ?? row?.region ?? null,
    capabilities: data?.capabilities ?? row?.capabilities ?? null,
    records,
  }, { headers: { 'Cache-Control': 'no-store' } })
}
