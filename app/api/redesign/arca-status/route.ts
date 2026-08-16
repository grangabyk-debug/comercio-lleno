import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://wtcntclzcubkbtcsqkzc.supabase.co'
const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? 'sb_publishable_02U2KDLDTR42KxdcFHtfYw_IDM00Deb'

function firstArcaError(...groups: unknown[]) {
  for (const group of groups) {
    if (!Array.isArray(group) || !group.length) continue
    const item = group[0] as { code?: unknown; msg?: unknown }
    const code = item?.code == null ? '' : `${String(item.code)}: `
    const msg = item?.msg == null ? 'ARCA devolvió un error' : String(item.msg)
    return `${code}${msg}`
  }
  return null
}

function pointIsUsable(points: unknown, pointOfSale: unknown) {
  if (!Array.isArray(points)) return false
  const expected = Number(pointOfSale)
  if (!Number.isFinite(expected)) return false
  const point = points.find((value: any) => Number(value?.nro) === expected) as any
  if (!point) return false
  const blocked = String(point?.bloqueado ?? '').trim().toUpperCase()
  const disabled = blocked === 'S' || blocked === 'SI' || blocked === 'TRUE' || blocked === '1'
  const endDate = String(point?.fecha_baja ?? '').trim()
  const hasEndDate = Boolean(endDate && endDate !== 'NULL' && endDate !== '00000000')
  return !disabled && !hasEndDate
}

export async function POST(req: NextRequest) {
  const authorization = req.headers.get('authorization') || ''
  if (!authorization.toLowerCase().startsWith('bearer ')) {
    return NextResponse.json({ connected: false, configured: false, error: 'Sesión no disponible' }, { status: 401 })
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 12000)
  const started = Date.now()

  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/arca-test`, {
      method: 'POST',
      headers: {
        apikey: PUBLISHABLE_KEY,
        Authorization: authorization,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ action: 'status' }),
      cache: 'no-store',
      signal: controller.signal,
    })

    let data: any = {}
    try { data = await response.json() } catch {}

    const configured = data?.configured !== false
    const pointOk = pointIsUsable(data?.points_of_sale, data?.test_point_of_sale)
    const pointsError = firstArcaError(data?.points_of_sale_errors)
    const lastError = firstArcaError(data?.last_authorized_errors)
    const vatError = firstArcaError(data?.receiver_vat_condition_errors)
    const lastAuthorizedValid = typeof data?.last_authorized === 'number' && Number.isFinite(data.last_authorized)
    const receiverConditionsOk = Array.isArray(data?.receiver_vat_conditions) && data.receiver_vat_conditions.length > 0
    const consumerFinalOk = Boolean(data?.consumer_final_condition)

    // En la interfaz “conectado” significa “listo para emitir”, no sólo “ARCA respondió HTTP 200”.
    const readyToIssue = Boolean(
      configured &&
      response.ok &&
      data?.ok &&
      pointOk &&
      !pointsError &&
      !lastError &&
      !vatError &&
      lastAuthorizedValid &&
      receiverConditionsOk &&
      consumerFinalOk,
    )

    let error: string | null = null
    if (!readyToIssue) {
      if (!configured) error = 'ARCA no está configurado para este comercio.'
      else if (!response.ok || !data?.ok) error = data?.error || 'ARCA no respondió correctamente'
      else if (lastError) error = `ARCA responde, pero no puede obtener el último comprobante: ${lastError}`
      else if (pointsError) error = `ARCA devolvió un error al consultar puntos de venta: ${pointsError}`
      else if (!pointOk) error = `El punto de venta ${data?.test_point_of_sale ?? 'configurado'} no está disponible para emitir.`
      else if (vatError) error = `ARCA devolvió un error al consultar la condición IVA del receptor: ${vatError}`
      else if (!lastAuthorizedValid) error = 'ARCA no devolvió una numeración fiscal válida.'
      else if (!consumerFinalOk) error = 'ARCA no devolvió la condición Consumidor Final necesaria para Factura C.'
      else error = 'ARCA responde, pero todavía no está listo para emitir.'
    }

    const body = {
      connected: readyToIssue,
      configured,
      checkedAt: new Date().toISOString(),
      latencyMs: Date.now() - started,
      environment: configured ? (data?.environment || 'homologacion') : null,
      service: configured ? (data?.service || 'wsfev1') : null,
      pointOfSale: configured ? (data?.test_point_of_sale ?? null) : null,
      lastAuthorized: configured ? (data?.last_authorized ?? null) : null,
      readyToIssue,
      error,
    }

    return NextResponse.json(body, { status: readyToIssue ? 200 : configured ? 503 : 200 })
  } catch (error) {
    const message = error instanceof Error && error.name === 'AbortError'
      ? 'ARCA no respondió dentro del tiempo esperado'
      : error instanceof Error ? error.message : String(error)
    return NextResponse.json({
      connected: false,
      configured: true,
      checkedAt: new Date().toISOString(),
      latencyMs: Date.now() - started,
      readyToIssue: false,
      error: message,
    }, { status: 503 })
  } finally {
    clearTimeout(timeout)
  }
}

// Redeploy intencional después de la prueba de rollback del 16/08/2026.
