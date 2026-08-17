import { apiError, metaGraphRequest, requireMetaTenantSession, supabaseUserRest } from '@/lib/meta-whatsapp-server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const session = await requireMetaTenantSession(request)
    const accountResponse = await supabaseUserRest(
      session,
      `whatsapp_cloud_accounts?company_id=eq.${encodeURIComponent(session.companyId)}&select=waba_id,status&limit=1`,
    )
    const accounts = await accountResponse.json().catch(() => [])
    if (!accountResponse.ok) throw new Error(accounts?.message || 'No se pudo consultar WhatsApp.')
    const account = Array.isArray(accounts) ? accounts[0] : null
    if (!account?.waba_id || account?.status === 'disconnected') {
      return Response.json({ ok: false, error: 'Primero conectá una cuenta oficial de WhatsApp.' }, { status: 409 })
    }

    const result = await metaGraphRequest(
      `${account.waba_id}/message_templates?fields=id,name,status,category,language,components&limit=100`,
    )
    const templates = (Array.isArray(result?.data) ? result.data : []).map((item: any) => ({
      id: String(item?.id || ''),
      name: String(item?.name || ''),
      status: String(item?.status || ''),
      category: String(item?.category || ''),
      language: String(item?.language || ''),
      components: Array.isArray(item?.components) ? item.components : [],
    }))

    return Response.json({
      ok: true,
      templates,
      approved: templates.filter((template: any) => template.status === 'APPROVED'),
    })
  } catch (error) {
    return apiError(error)
  }
}
