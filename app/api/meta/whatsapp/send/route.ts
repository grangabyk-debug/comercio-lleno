import { apiError, metaGraphRequest, requireMetaTenantSession, supabaseUserRest } from '@/lib/meta-whatsapp-server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function destination(value: unknown) {
  const digits = String(value ?? '').replace(/\D/g, '')
  if (digits.length < 8 || digits.length > 15) throw new Error('Número de destino inválido.')
  return digits
}

export async function POST(request: Request) {
  try {
    const session = await requireMetaTenantSession(request)
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

    if (type === 'text') {
      const text = String(body?.text || '').trim()
      if (!text || text.length > 4096) {
        return Response.json({ ok: false, error: 'El mensaje debe tener entre 1 y 4096 caracteres.' }, { status: 400 })
      }
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
      if (!/^[a-z0-9_]{1,512}$/i.test(name) || !/^[a-z]{2,3}_[A-Z]{2}$/.test(language)) {
        return Response.json({ ok: false, error: 'Plantilla o idioma inválido.' }, { status: 400 })
      }
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
    return Response.json({ ok: true, sent: true, messageId: messageId || null })
  } catch (error) {
    return apiError(error)
  }
}
