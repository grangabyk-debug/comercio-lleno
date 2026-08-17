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

function normalizeInvoicePayload(payload: any) {
  const raw = payload?.invoice ?? payload?.response ?? payload
  if (!raw || typeof raw !== 'object') return null
  const cae = String(raw.cae || '').trim()
  const receiptNumber = raw.receipt_number == null ? '' : String(raw.receipt_number).trim()
  if (!cae || !receiptNumber) return null
  return {
    cae,
    receipt_number: receiptNumber,
    cae_expiration: raw.cae_expiration || null,
    amount: Number(raw.amount || 0),
  }
}

async function persistAuthorization(authorization: string, sale: any, fiscal: any) {
  const details = {
    ...(sale.details || {}),
    cae: fiscal.cae,
    receipt_number: Number(fiscal.receipt_number),
    cae_expiration: fiscal.cae_expiration || null,
    fiscal_retried_at: new Date().toISOString(),
    fiscal_reconciled: true,
  }
  delete details.fiscal_pending_reason
  delete details.fiscal_pending_since

  const patchRes = await rest(authorization, `sales?id=eq.${encodeURIComponent(sale.id)}`, {
    method: 'PATCH',
    headers: { Prefer: 'return=minimal' },
    body: JSON.stringify({
      receipt_type: 'factura_c',
      fiscal_status: 'authorized',
      receipt_number: String(fiscal.receipt_number),
      cae: fiscal.cae,
      details,
    }),
  })

  if (!patchRes.ok) {
    const text = await patchRes.text()
    throw new Error(text || 'No se pudo reconciliar la autorización ARCA con la venta.')
  }
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

  // Antes de volver a emitir, reconciliamos cualquier autorización ya registrada para esta venta.
  const reqRes = await rest(
    authorization,
    `arca_invoice_requests?request_id=eq.${encodeURIComponent(sale.id)}&status=eq.authorized&select=cae,receipt_number,cae_expiration,amount,response&limit=1`,
  )
  const reqRows = await reqRes.json().catch(() => []) as Array<any>
  const existing = reqRows?.[0]
  if (existing) {
    const fiscal = normalizeInvoicePayload(existing.response) || normalizeInvoicePayload(existing)
    if (!fiscal) {
      return NextResponse.json({ ok: false, error: 'Existe una autorización ARCA registrada, pero sus datos están incompletos.' }, { status: 500 })
    }
    if (Math.abs(Number(existing.amount || fiscal.amount || 0) - Number(sale.total || 0)) >= 0.01) {
      return NextResponse.json({ ok: false, error: 'La autorización ARCA registrada no coincide con el importe de esta venta.' }, { status: 409 })
    }
    try {
      await persistAuthorization(authorization, sale, fiscal)
    } catch (error) {
      return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : String(error) }, { status: 500 })
    }
    return NextResponse.json({ ok: true, reconciled: true, ...fiscal })
  }

  // Si no hay autorización previa, recién ahí intentamos facturar con el mismo request_id de la venta.
  const invoiceRes = await fetch(`${req.nextUrl.origin}/api/redesign/arca-invoice`, {
    method: 'POST',
    headers: { Authorization: authorization, 'Content-Type': 'application/json' },
    body: JSON.stringify({ request_id: sale.id, amount: Number(sale.total || 0) }),
    cache: 'no-store',
  })
  const payload = await invoiceRes.json().catch(() => ({ ok: false, error: 'Respuesta inválida de ARCA' })) as any
  if (!invoiceRes.ok || !payload?.ok) {
    return NextResponse.json(payload, { status: invoiceRes.status || 502 })
  }

  const fiscal = normalizeInvoicePayload(payload)
  if (!fiscal) {
    return NextResponse.json({ ok: false, error: 'ARCA autorizó la operación, pero la respuesta no contiene CAE o número de comprobante.' }, { status: 502 })
  }

  try {
    await persistAuthorization(authorization, sale, fiscal)
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : String(error) }, { status: 500 })
  }

  return NextResponse.json({ ok: true, ...fiscal })
}
