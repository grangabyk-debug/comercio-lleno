import {
  apiError,
  metaGraphRequest,
  requireMetaTenantSession,
  supabaseAdminRest,
  supabaseServiceRoleKey,
  supabaseUserRest,
} from '@/lib/meta-whatsapp-server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function destination(value: unknown) {
  const digits = String(value ?? '').replace(/\D/g, '')
  if (digits.length < 8 || digits.length > 15) throw new Error('Número de destino inválido.')
  return digits
}

function withinCustomerServiceWindow(lastInboundAt: unknown) {
  const stamp = new Date(String(lastInboundAt || '')).getTime()
  return Number.isFinite(stamp) && Date.now() - stamp <= 24 * 60 * 60 * 1000
}

async function conversationFor(session: Awaited<ReturnType<typeof requireMetaTenantSession>>, phone: string) {
  const response = await supabaseUserRest(
    session,
    `whatsapp_cloud_conversations?company_id=eq.${encodeURIComponent(session.companyId)}&customer_phone=eq.${encodeURIComponent(phone)}&select=id,last_inbound_at&limit=1`,
  )
  const rows = await response.json().catch(() => [])
  if (!response.ok) throw new Error(rows?.message || 'No se pudo consultar la conversación.')
  return Array.isArray(rows) ? rows[0] || null : null
}

async function persistOutbound(companyId: string, phone: string, externalId: string, type: string, body: string, payload: Record<string, unknown>) {
  const now = new Date().toISOString()
  const currentResponse = await supabaseAdminRest(
    `whatsapp_cloud_conversations?company_id=eq.${encodeURIComponent(companyId)}&customer_phone=eq.${encodeURIComponent(phone)}&select=id&limit=1`,
  )
  const currentRows = await currentResponse.json().catch(() => [])
  const current = Array.isArray(currentRows) ? currentRows[0] : null
  let conversationId = current?.id ? String(current.id) : ''
  const conversationPatch = {
    status: 'open',
    last_message_preview: body.slice(0, 280),
    last_message_at: now,
    last_outbound_at: now,
    updated_at: now,
  }

  if (conversationId) {
    await supabaseAdminRest(`whatsapp_cloud_conversations?id=eq.${encodeURIComponent(conversationId)}`, {
      method: 'PATCH', headers: { Prefer: 'return=minimal' }, body: JSON.stringify(conversationPatch),
    })
  } else {
    const inserted = await supabaseAdminRest('whatsapp_cloud_conversations', {
      method: 'POST',
      headers: { Prefer: 'return=representation' },
      body: JSON.stringify({ company_id: companyId, customer_phone: phone, unread_count: 0, ...conversationPatch }),
    })
    const rows = await inserted.json().catch(() => [])
    conversationId = Array.isArray(rows) && rows[0]?.id ? String(rows[0].id) : ''
  }

  if (!conversationId) return
  await supabaseAdminRest('whatsapp_cloud_messages', {
    method: 'POST',
    headers: { Prefer: 'return=minimal' },
    body: JSON.stringify({
      company_id: companyId,
      conversation_id: conversationId,
      external_message_id: externalId || null,
      direction: 'outbound',
      message_type: type,
      body,
      status: 'accepted',
      payload,
      sent_at: now,
      created_at: now,
    }),
  })
}

export async function POST(request: Request) {
  try {
    const session = await requireMetaTenantSession(request)
    if (!supabaseServiceRoleKey()) {
      return Response.json({ ok: false, error: 'La mensajería oficial todavía no tiene habilitada la credencial segura del servidor.' }, { status: 503 })
    }

    const body = await request.json().catch(() => ({}))
    const connectionResponse = await supabaseUserRest(
      session,
      `whatsapp_cloud_accounts?company_id=eq.${encodeURIComponent(session.companyId)}&select=phone_number_id,status,registered&limit=1`,
    )
    const connections = await connectionResponse.json().catch(() => [])
    const connection = Array.isArray(connections) ? connections[0] : null
    if (!connectionResponse.ok) throw new Error(connections?.message || 'No se pudo consultar WhatsApp.')
    if (!connection?.phone_number_id || connection?.status !== 'connected' || !connection?.registered) {
      return Response.json({ ok: false, error: 'WhatsApp oficial todavía no está listo para enviar mensajes.' }, { status: 409 })
    }

    let to = ''
    try { to = destination(body?.to) } catch (error) {
      return Response.json({ ok: false, error: error instanceof Error ? error.message : 'Número inválido.' }, { status: 400 })
    }

    const type = String(body?.type || 'text')
    let message: Record<string, unknown>
    let preview = ''

    if (type === 'text') {
      const text = String(body?.text || '').trim()
      if (!text || text.length > 4096) {
        return Response.json({ ok: false, error: 'El mensaje debe tener entre 1 y 4096 caracteres.' }, { status: 400 })
      }
      const conversation = await conversationFor(session, to)
      if (!withinCustomerServiceWindow(conversation?.last_inbound_at)) {
        return Response.json({
          ok: false,
          code: 'WHATSAPP_TEMPLATE_REQUIRED',
          error: 'Fuera de la ventana de atención de 24 horas, Meta exige enviar una plantilla aprobada.',
        }, { status: 409 })
      }
      preview = text
      message = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to,
        type: 'text',
        text: { preview_url: Boolean(body?.previewUrl), body: text },
      }
    } else if (type === 'template') {
      const name = String(body?.template?.name || '').trim()
      const language = String(body?.template?.language || 'es_AR').trim()
      if (!/^[a-z0-9_]{1,512}$/i.test(name) || !/^[a-z]{2,3}(?:_[A-Z]{2})?$/.test(language)) {
        return Response.json({ ok: false, error: 'Plantilla o idioma inválido.' }, { status: 400 })
      }
      preview = `[Plantilla: ${name}]`
      message = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to,
        type: 'template',
        template: {
          name,
          language: { code: language },
          ...(Array.isArray(body?.template?.components) ? { components: body.template.components } : {}),
        },
      }
    } else {
      return Response.json({ ok: false, error: 'Tipo de mensaje no admitido.' }, { status: 400 })
    }

    const result = await metaGraphRequest(`${connection.phone_number_id}/messages`, {
      method: 'POST',
      body: JSON.stringify(message),
    })

    const messageId = Array.isArray(result?.messages) ? String(result.messages[0]?.id || '') : ''
    await persistOutbound(session.companyId, to, messageId, type, preview, message)
    return Response.json({ ok: true, sent: true, messageId: messageId || null })
  } catch (error) {
    return apiError(error)
  }
}
