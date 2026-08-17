import { apiError, requireMetaTenantSession, supabaseAdminRest, supabaseUserRest } from '@/lib/meta-whatsapp-server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function uuid(value: unknown) {
  const id = String(value || '').trim()
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) return ''
  return id
}

export async function GET(request: Request) {
  try {
    const session = await requireMetaTenantSession(request)
    const url = new URL(request.url)
    const conversationId = uuid(url.searchParams.get('conversationId'))

    if (conversationId) {
      const conversationResponse = await supabaseUserRest(
        session,
        `whatsapp_cloud_conversations?id=eq.${encodeURIComponent(conversationId)}&company_id=eq.${encodeURIComponent(session.companyId)}&select=*&limit=1`,
      )
      const conversations = await conversationResponse.json().catch(() => [])
      if (!conversationResponse.ok) throw new Error(conversations?.message || 'No se pudo abrir la conversación.')
      const conversation = Array.isArray(conversations) ? conversations[0] || null : null
      if (!conversation) return Response.json({ ok: false, error: 'Conversación no encontrada.' }, { status: 404 })

      const messagesResponse = await supabaseUserRest(
        session,
        `whatsapp_cloud_messages?conversation_id=eq.${encodeURIComponent(conversationId)}&company_id=eq.${encodeURIComponent(session.companyId)}&select=*&order=created_at.asc&limit=300`,
      )
      const messages = await messagesResponse.json().catch(() => [])
      if (!messagesResponse.ok) throw new Error(messages?.message || 'No se pudieron cargar los mensajes.')
      return Response.json({ ok: true, conversation, messages: Array.isArray(messages) ? messages : [] })
    }

    const response = await supabaseUserRest(
      session,
      `whatsapp_cloud_conversations?company_id=eq.${encodeURIComponent(session.companyId)}&select=*&order=last_message_at.desc.nullslast&limit=60`,
    )
    const conversations = await response.json().catch(() => [])
    if (!response.ok) throw new Error(conversations?.message || 'No se pudieron cargar las conversaciones.')
    return Response.json({ ok: true, conversations: Array.isArray(conversations) ? conversations : [] })
  } catch (error) {
    return apiError(error)
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await requireMetaTenantSession(request)
    const body = await request.json().catch(() => ({}))
    const conversationId = uuid(body?.conversationId)
    if (!conversationId || String(body?.action || '') !== 'mark_read') {
      return Response.json({ ok: false, error: 'Solicitud inválida.' }, { status: 400 })
    }
    const response = await supabaseAdminRest(
      `whatsapp_cloud_conversations?id=eq.${encodeURIComponent(conversationId)}&company_id=eq.${encodeURIComponent(session.companyId)}`,
      {
        method: 'PATCH',
        headers: { Prefer: 'return=minimal' },
        body: JSON.stringify({ unread_count: 0, updated_at: new Date().toISOString() }),
      },
    )
    if (!response.ok) throw new Error('No se pudo marcar la conversación como leída.')
    return Response.json({ ok: true })
  } catch (error) {
    return apiError(error)
  }
}
