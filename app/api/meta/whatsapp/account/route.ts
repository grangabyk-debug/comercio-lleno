import { apiError, metaGraphRequest, requireMetaTenantSession, supabaseUserRest } from '@/lib/meta-whatsapp-server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type CloudAccount = {
  company_id: string
  waba_id: string
  phone_number_id?: string | null
  meta_business_id?: string | null
  display_phone_number?: string | null
  verified_name?: string | null
  quality_rating?: string | null
  name_status?: string | null
  status: string
  subscribed?: boolean
  registered?: boolean
  last_error?: string | null
  connected_at?: string | null
  updated_at?: string | null
}

function metaId(value: unknown, label: string, optional = false) {
  const id = String(value ?? '').trim()
  if (!id && optional) return ''
  if (!/^\d{5,30}$/.test(id)) throw new Error(`${label} inválido.`)
  return id
}

async function readAccount(session: Awaited<ReturnType<typeof requireMetaTenantSession>>) {
  const response = await supabaseUserRest(
    session,
    `whatsapp_cloud_accounts?company_id=eq.${encodeURIComponent(session.companyId)}&select=company_id,waba_id,phone_number_id,meta_business_id,display_phone_number,verified_name,quality_rating,name_status,status,subscribed,registered,last_error,connected_at,updated_at&limit=1`,
  )
  const data = await response.json().catch(() => [])
  if (!response.ok) throw new Error(data?.message || 'No se pudo consultar la conexión oficial de WhatsApp.')
  return (Array.isArray(data) ? data[0] : null) as CloudAccount | null
}

export async function GET(request: Request) {
  try {
    const session = await requireMetaTenantSession(request)
    const account = await readAccount(session)
    return Response.json({
      ok: true,
      configured: Boolean(account),
      connected: account?.status === 'connected',
      account,
    })
  } catch (error) {
    return apiError(error)
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireMetaTenantSession(request, true)
    const body = await request.json().catch(() => ({}))
    if (String(body?.action || 'complete_onboarding') !== 'complete_onboarding') {
      return Response.json({ ok: false, error: 'Acción no disponible.' }, { status: 400 })
    }

    let wabaId = ''
    let requestedPhoneId = ''
    try {
      wabaId = metaId(body?.wabaId, 'WABA ID')
      requestedPhoneId = metaId(body?.phoneNumberId, 'Phone Number ID', true)
    } catch (error) {
      return Response.json({ ok: false, error: error instanceof Error ? error.message : 'Identificadores inválidos.' }, { status: 400 })
    }

    const existing = await readAccount(session)
    const phoneList = await metaGraphRequest(`${wabaId}/phone_numbers`)
    const phones = Array.isArray(phoneList?.data) ? phoneList.data : []
    const phone = requestedPhoneId
      ? phones.find((item: any) => String(item?.id || '') === requestedPhoneId)
      : phones.length === 1 ? phones[0] : null

    if (!phone?.id) {
      return Response.json({
        ok: false,
        error: requestedPhoneId
          ? 'El número indicado no pertenece a la cuenta de WhatsApp seleccionada.'
          : 'Meta devolvió más de un número. Falta indicar cuál querés conectar.',
        phoneNumbers: phones.map((item: any) => ({
          id: String(item?.id || ''),
          displayPhoneNumber: String(item?.display_phone_number || ''),
          verifiedName: String(item?.verified_name || ''),
          qualityRating: String(item?.quality_rating || ''),
        })),
      }, { status: 409 })
    }

    const phoneNumberId = String(phone.id)
    await metaGraphRequest(`${wabaId}/subscribed_apps`, { method: 'POST' })

    let registered = Boolean(existing?.registered && existing?.waba_id === wabaId && existing?.phone_number_id === phoneNumberId)
    const pin = String(body?.pin || '').trim()
    if (pin) {
      if (!/^\d{6}$/.test(pin)) {
        return Response.json({ ok: false, error: 'El PIN de verificación en dos pasos debe tener 6 dígitos.' }, { status: 400 })
      }
      await metaGraphRequest(`${phoneNumberId}/register`, {
        method: 'POST',
        body: JSON.stringify({ messaging_product: 'whatsapp', pin }),
      })
      registered = true
    }

    const now = new Date().toISOString()
    const metaBusinessId = String(body?.metaBusinessId || '').trim()
    const payload = {
      company_id: session.companyId,
      waba_id: wabaId,
      phone_number_id: phoneNumberId,
      meta_business_id: /^\d{5,30}$/.test(metaBusinessId) ? metaBusinessId : null,
      display_phone_number: phone?.display_phone_number ? String(phone.display_phone_number) : null,
      verified_name: phone?.verified_name ? String(phone.verified_name) : null,
      quality_rating: phone?.quality_rating ? String(phone.quality_rating) : null,
      status: registered ? 'connected' : 'pending',
      subscribed: true,
      registered,
      connected_at: registered ? (existing?.connected_at || now) : null,
      last_error: registered ? null : 'Falta completar el registro del número con el PIN de verificación en dos pasos.',
      metadata: { source: 'meta_embedded_signup', graphVersion: 'v26.0' },
      updated_at: now,
    }

    const save = await supabaseUserRest(session, 'whatsapp_cloud_accounts?on_conflict=company_id', {
      method: 'POST',
      headers: { Prefer: 'resolution=merge-duplicates,return=representation' },
      body: JSON.stringify(payload),
    })
    const saved = await save.json().catch(() => [])
    if (!save.ok) throw new Error(saved?.message || 'No se pudo guardar la conexión de WhatsApp.')

    return Response.json({
      ok: true,
      connected: registered,
      subscribed: true,
      registered,
      needsRegistration: !registered,
      account: Array.isArray(saved) ? saved[0] || payload : payload,
    })
  } catch (error) {
    return apiError(error)
  }
}
