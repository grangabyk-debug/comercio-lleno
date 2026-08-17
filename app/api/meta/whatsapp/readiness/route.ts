import {
  apiError,
  metaAdminSystemUserToken,
  metaProviderBusinessId,
  metaProviderSystemUserId,
  metaSystemUserToken,
  requireMetaTenantSession,
  supabaseServiceRoleKey,
  supabaseUserRest,
} from '@/lib/meta-whatsapp-server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const session = await requireMetaTenantSession(request, true)
    const accountResponse = await supabaseUserRest(
      session,
      `whatsapp_cloud_accounts?company_id=eq.${encodeURIComponent(session.companyId)}&select=status,subscribed,registered,billing_status,phone_number_id,waba_id,last_webhook_at&limit=1`,
    )
    const rows = await accountResponse.json().catch(() => [])
    if (!accountResponse.ok) throw new Error(rows?.message || 'No se pudo consultar el estado de WhatsApp.')
    const account = Array.isArray(rows) ? rows[0] || null : null

    const checks = {
      appSecret: Boolean((process.env.META_WHATSAPP_APP_SECRET || '').trim()),
      systemUserToken: Boolean(metaSystemUserToken()),
      adminSystemUserToken: Boolean(metaAdminSystemUserToken()),
      providerBusinessId: Boolean(metaProviderBusinessId()),
      providerSystemUserId: Boolean(metaProviderSystemUserId()),
      supabaseServiceRole: Boolean(supabaseServiceRoleKey()),
      verifyToken: Boolean((process.env.META_WHATSAPP_VERIFY_TOKEN || '').trim()),
      uiEnabled: process.env.NEXT_PUBLIC_META_WHATSAPP_OFFICIAL_ENABLED === '1',
    }

    const missing = Object.entries(checks)
      .filter(([key, value]) => key !== 'uiEnabled' && !value)
      .map(([key]) => key)

    return Response.json({
      ok: true,
      checks,
      missing,
      backendReady: missing.length === 0,
      uiEnabled: checks.uiEnabled,
      account,
      connectionReady: Boolean(account?.status === 'connected' && account?.subscribed && account?.registered),
      billingReady: account?.billing_status === 'attached',
      callbackUrl: 'https://www.comerciolleno.com/api/meta/whatsapp/webhook',
    })
  } catch (error) {
    return apiError(error)
  }
}
