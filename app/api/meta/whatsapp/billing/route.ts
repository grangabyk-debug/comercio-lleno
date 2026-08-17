import {
  apiError,
  metaAdminSystemUserToken,
  metaGraphRequest,
  metaProviderBusinessId,
  requireMetaTenantSession,
  supabaseUserRest,
} from '@/lib/meta-whatsapp-server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type BillingAccount = {
  waba_id?: string | null
  billing_status?: string | null
  credit_line_id?: string | null
  allocation_config_id?: string | null
  billing_currency?: string | null
}

async function readAccount(session: Awaited<ReturnType<typeof requireMetaTenantSession>>) {
  const response = await supabaseUserRest(
    session,
    `whatsapp_cloud_accounts?company_id=eq.${encodeURIComponent(session.companyId)}&select=waba_id,billing_status,credit_line_id,allocation_config_id,billing_currency&limit=1`,
  )
  const rows = await response.json().catch(() => [])
  if (!response.ok) throw new Error(rows?.message || 'No se pudo consultar la facturación de WhatsApp.')
  return (Array.isArray(rows) ? rows[0] : null) as BillingAccount | null
}

async function providerCreditLines() {
  const businessId = metaProviderBusinessId()
  const token = metaAdminSystemUserToken()
  if (!businessId || !token) return []
  const result = await metaGraphRequest(
    `${businessId}/extendedcredits?fields=id,legal_entity_name`,
    {},
    token,
  )
  return (Array.isArray(result?.data) ? result.data : []).map((item: any) => ({
    id: String(item?.id || ''),
    legalEntityName: String(item?.legal_entity_name || ''),
  })).filter((item: any) => /^\d+$/.test(item.id))
}

export async function GET(request: Request) {
  try {
    const session = await requireMetaTenantSession(request, true)
    const account = await readAccount(session)
    const businessConfigured = Boolean(metaProviderBusinessId() && metaAdminSystemUserToken())
    let creditLines: Array<{ id: string; legalEntityName: string }> = []
    let providerError = ''

    if (businessConfigured) {
      try { creditLines = await providerCreditLines() }
      catch (error) { providerError = error instanceof Error ? error.message : String(error) }
    }

    return Response.json({
      ok: true,
      account,
      providerConfigured: businessConfigured,
      creditLineAvailable: creditLines.length > 0,
      creditLines,
      providerError: providerError || null,
    })
  } catch (error) {
    return apiError(error)
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireMetaTenantSession(request, true)
    const account = await readAccount(session)
    if (!account?.waba_id) {
      return Response.json({ ok: false, error: 'Primero completá el Embedded Signup y conectá la WABA del comercio.' }, { status: 409 })
    }

    const body = await request.json().catch(() => ({}))
    const creditLineId = String(body?.creditLineId || '').trim()
    const currency = String(body?.currency || '').trim().toUpperCase()
    if (!/^\d{5,30}$/.test(creditLineId) || !/^[A-Z]{3}$/.test(currency)) {
      return Response.json({ ok: false, error: 'Línea de crédito o moneda inválida.' }, { status: 400 })
    }

    const available = await providerCreditLines()
    if (!available.some(item => item.id === creditLineId)) {
      return Response.json({ ok: false, error: 'La línea de crédito indicada no pertenece al proveedor de Comercio Lleno.' }, { status: 400 })
    }

    const token = metaAdminSystemUserToken()
    if (!token) return Response.json({ ok: false, error: 'Falta la credencial administrativa de Meta.' }, { status: 503 })

    const result = await metaGraphRequest(
      `${creditLineId}/whatsapp_credit_sharing_and_attach?waba_id=${encodeURIComponent(String(account.waba_id))}&waba_currency=${encodeURIComponent(currency)}`,
      { method: 'POST' },
      token,
    )
    const allocationConfigId = String(result?.allocation_config_id || '').trim()
    if (!/^\d{5,30}$/.test(allocationConfigId)) {
      return Response.json({ ok: false, error: 'Meta no devolvió el identificador de asignación de facturación.' }, { status: 502 })
    }

    const save = await supabaseUserRest(
      session,
      `whatsapp_cloud_accounts?company_id=eq.${encodeURIComponent(session.companyId)}`,
      {
        method: 'PATCH',
        headers: { Prefer: 'return=representation' },
        body: JSON.stringify({
          billing_status: 'attached',
          credit_line_id: creditLineId,
          allocation_config_id: allocationConfigId,
          billing_currency: currency,
          updated_at: new Date().toISOString(),
        }),
      },
    )
    const saved = await save.json().catch(() => [])
    if (!save.ok) throw new Error(saved?.message || 'No se pudo guardar la configuración de facturación.')

    return Response.json({ ok: true, attached: true, allocationConfigId, account: Array.isArray(saved) ? saved[0] || null : null })
  } catch (error) {
    return apiError(error)
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await requireMetaTenantSession(request, true)
    const account = await readAccount(session)
    const allocationConfigId = String(account?.allocation_config_id || '').trim()
    if (!allocationConfigId) return Response.json({ ok: true, detached: true })

    const token = metaAdminSystemUserToken()
    if (!token) return Response.json({ ok: false, error: 'Falta la credencial administrativa de Meta.' }, { status: 503 })
    await metaGraphRequest(allocationConfigId, { method: 'DELETE' }, token)

    const save = await supabaseUserRest(
      session,
      `whatsapp_cloud_accounts?company_id=eq.${encodeURIComponent(session.companyId)}`,
      {
        method: 'PATCH',
        headers: { Prefer: 'return=minimal' },
        body: JSON.stringify({
          billing_status: 'unconfigured',
          credit_line_id: null,
          allocation_config_id: null,
          billing_currency: null,
          updated_at: new Date().toISOString(),
        }),
      },
    )
    if (!save.ok) throw new Error('No se pudo limpiar la configuración de facturación.')
    return Response.json({ ok: true, detached: true })
  } catch (error) {
    return apiError(error)
  }
}
