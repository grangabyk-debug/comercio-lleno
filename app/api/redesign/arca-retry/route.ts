import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://wtcntclzcubkbtcsqkzc.supabase.co'
const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? 'sb_publishable_02U2KDLDTR42KxdcFHtfYw_IDM00Deb'

async function rest(authorization: string, path: string, init?: RequestInit) {
  return fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: PUBLISHABLE_KEY,
      Authorization: authorization,
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
    cache: 'no-store',
  })
}

export async function POST(req: NextRequest) {
  const authorization = req.headers.get('authorization') || ''
  if (!authorization.toLowerCase().startsWith('bearer ')) {
    return NextResponse.json({ ok: false, error: 'Sesión no disponible' }, { status: 401 })
  }

  const body = await req.json().catch(() => ({})) as { sale_id?: string }
  const saleId = String(body.sale_id || '').trim()
  if (!saleId) return NextResponse.json({ ok: false, error: 'Falta la venta a facturar' }, { status: 400 })

  const saleRes = await rest(authorization, `sales?id=eq.${encodeURIComponent(saleId)}&select=id,total,cae,receipt_number,fiscal_status,details&limit=1`)
  const sales = await saleRes.json().catch(() => []) as Array<any>
  const sale = sales?.[0]
  if (!sale) return NextResponse.json({ ok: false, error: 'Venta no encontrada' }, { status: 404 })
  if (sale.cae || sale.fiscal_status === 'authorized') {
    return NextResponse.json({ ok: true, already_authorized: true, cae: sale.cae, receipt_number: sale.receipt_number })
  }

  const invoiceRes = await fetch(`${req.nextUrl.origin}/api/redesign/arca-invoice`, {
    method: 'POST',
    headers: { Authorization: authorization, 'Content-Type': 'application/json' },
    body: JSON.stringify({ request_id: sale.id, amount: Number(sale.total || 0) }),
    cache: 'no-store',
  })
  const invoice = await invoiceRes.json().catch(() => ({ ok: false, error: 'Respuesta inválida de ARCA' })) as any
  if (!invoiceRes.ok || !invoice?.ok) {
    return NextResponse.json(invoice, { status: invoiceRes.status || 502 })
  }

  const details = { ...(sale.details || {}) }
  delete details.fiscal_pending_reason
  delete details.fiscal_pending_since
  details.fiscal_retried_at = new Date().toISOString()

  const patchRes = await rest(authorization, `sales?id=eq.${encodeURIComponent(sale.id)}`, {
    method: 'PATCH',
    headers: { Prefer: 'return=minimal' },
    body: JSON.stringify({
      receipt_type: 'factura_c',
      fiscal_status: 'authorized',
      receipt_number: Number(invoice.receipt_number),
      cae: String(invoice.cae || ''),
      cae_expiration: invoice.cae_expiration || null,
      details,
    }),
  })
  if (!patchRes.ok) {
    const text = await patchRes.text()
    return NextResponse.json({ ok: false, error: text || 'ARCA autorizó el comprobante, pero no se pudo actualizar la venta. Volvé a intentar: el request_id evita volver a emitirla.' }, { status: 500 })
  }

  return NextResponse.json({
    ok: true,
    cae: invoice.cae,
    receipt_number: invoice.receipt_number,
    cae_expiration: invoice.cae_expiration || null,
  })
}