import { processSellerMessage } from './engine'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://wtcntclzcubkbtcsqkzc.supabase.co'
const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? 'sb_publishable_02U2KDLDTR42KxdcFHtfYw_IDM00Deb'
const GATEWAY_URL = 'https://ai-gateway.vercel.sh/v1/chat/completions'
const STYLE_MODELS = ['openai/gpt-5.4-nano', 'google/gemini-3.5-flash-lite', 'openai/gpt-5.4']

export type SellerPersona = {
  tone: 'natural' | 'friendly' | 'sales' | 'formal'
  responseLength: 'short' | 'normal'
  useEmojis: boolean
  useVos: boolean
  oneQuestionAtATime: boolean
  customInstructions: string
}

type SellerInput = {
  token: string
  companyId: string
  companyName: string
  phone: string
  text: string
  externalMessageId?: string | null
  commitSale?: boolean
}

type TrainingRow = {
  id: string
  company_id: string
  source_message_id: string | null
  customer_text: string
  ai_response: string
  rating: number
  corrected_response: string | null
  created_at: string
}

const DEFAULT_PERSONA: SellerPersona = {
  tone: 'natural',
  responseLength: 'short',
  useEmojis: true,
  useVos: true,
  oneQuestionAtATime: true,
  customInstructions: 'Respondé como una persona del comercio: cálido, simple y concreto. Evitá frases acartonadas o de call center. No repitas saludos si la conversación ya empezó.',
}

function headers(token: string, prefer?: string) {
  return {
    apikey: PUBLISHABLE_KEY,
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
    ...(prefer ? { Prefer: prefer } : {}),
  }
}

async function rest<T>(token: string, path: string, init: RequestInit = {}) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...init,
    headers: { ...headers(token), ...(init.headers || {}) },
    cache: 'no-store',
  })
  const text = await response.text()
  let data: any = null
  try { data = text ? JSON.parse(text) : null } catch { data = text }
  if (!response.ok) throw new Error(data?.message || data?.error || `Supabase ${response.status}`)
  return data as T
}

function sanitizePersona(value: any): SellerPersona {
  const tone = ['natural', 'friendly', 'sales', 'formal'].includes(value?.tone) ? value.tone : DEFAULT_PERSONA.tone
  const responseLength = value?.responseLength === 'normal' ? 'normal' : 'short'
  return {
    tone,
    responseLength,
    useEmojis: value?.useEmojis !== false,
    useVos: value?.useVos !== false,
    oneQuestionAtATime: value?.oneQuestionAtATime !== false,
    customInstructions: String(value?.customInstructions || DEFAULT_PERSONA.customInstructions).trim().slice(0, 1200),
  }
}

async function companySettings(token: string, companyId: string) {
  const rows = await rest<any[]>(token, `companies?id=eq.${encodeURIComponent(companyId)}&select=sales_settings&limit=1`)
  return rows?.[0]?.sales_settings || {}
}

export async function getTrainingState(token: string, companyId: string) {
  const [settings, examples] = await Promise.all([
    companySettings(token, companyId),
    rest<TrainingRow[]>(token, `whatsapp_ai_training_examples?company_id=eq.${encodeURIComponent(companyId)}&active=eq.true&select=id,source_message_id,customer_text,ai_response,rating,corrected_response,created_at&order=created_at.desc&limit=50`),
  ])
  return {
    persona: sanitizePersona(settings?.whatsappAiPersona || {}),
    examples: examples || [],
    approvedCount: (examples || []).filter(row => row.rating === 1).length,
    correctedCount: (examples || []).filter(row => row.rating === -1 && row.corrected_response).length,
  }
}

export async function saveTrainingProfile(token: string, companyId: string, raw: unknown) {
  const persona = sanitizePersona(raw)
  const settings = await companySettings(token, companyId)
  await rest(token, `companies?id=eq.${encodeURIComponent(companyId)}`, {
    method: 'PATCH',
    headers: { Prefer: 'return=minimal' },
    body: JSON.stringify({ sales_settings: { ...settings, whatsappAiPersona: persona } }),
  })
  return persona
}

export async function saveTrainingFeedback(
  token: string,
  companyId: string,
  sourceMessageId: string,
  rating: 1 | -1,
  correctedResponse?: string,
) {
  if (!sourceMessageId) throw new Error('No se encontró la respuesta a calificar.')
  const corrected = String(correctedResponse || '').trim().slice(0, 4000)
  if (rating === -1 && !corrected) throw new Error('Escribí cómo debería haber respondido antes de guardar la corrección.')

  const messages = await rest<any[]>(
    token,
    `whatsapp_ai_messages?id=eq.${encodeURIComponent(sourceMessageId)}&company_id=eq.${encodeURIComponent(companyId)}&direction=eq.outbound&select=id,conversation_id,body,created_at&limit=1`,
  )
  const outbound = messages?.[0]
  if (!outbound) throw new Error('Esa respuesta ya no está disponible.')

  const previous = await rest<any[]>(
    token,
    `whatsapp_ai_messages?conversation_id=eq.${encodeURIComponent(outbound.conversation_id)}&direction=eq.inbound&created_at=lt.${encodeURIComponent(outbound.created_at)}&select=body&order=created_at.desc&limit=1`,
  )
  const customerText = String(previous?.[0]?.body || '').trim()
  if (!customerText) throw new Error('No se encontró el mensaje del cliente asociado.')

  const rows = await rest<TrainingRow[]>(token, 'whatsapp_ai_training_examples?on_conflict=company_id,source_message_id', {
    method: 'POST',
    headers: { Prefer: 'resolution=merge-duplicates,return=representation' },
    body: JSON.stringify({
      company_id: companyId,
      source_message_id: sourceMessageId,
      customer_text: customerText,
      ai_response: String(outbound.body || '').slice(0, 4000),
      rating,
      corrected_response: rating === -1 ? corrected : null,
      active: true,
      updated_at: new Date().toISOString(),
    }),
  })
  return rows?.[0] || null
}

function mandatoryTokens(base: string) {
  const found = base.match(/(?:\$\s?[\d.]+(?:,\d+)?|#[A-Z0-9]{6,}|\*CONFIRMAR\*|CONFIRMAR)/g) || []
  return [...new Set(found)]
}

async function humanizeReply(token: string, companyId: string, companyName: string, customerText: string, baseReply: string) {
  const apiKey = process.env.AI_GATEWAY_API_KEY || process.env.VERCEL_OIDC_TOKEN
  if (!apiKey || !baseReply.trim()) return baseReply

  let training
  try { training = await getTrainingState(token, companyId) } catch { return baseReply }
  const persona = training.persona
  const examples = (training.examples || [])
    .filter((row: TrainingRow) => row.rating === 1 || Boolean(row.corrected_response))
    .slice(0, 12)
    .reverse()
    .map((row: TrainingRow) => `Cliente: ${row.customer_text}\nRespuesta ideal: ${row.corrected_response || row.ai_response}`)
    .join('\n\n')

  const toneText = persona.tone === 'friendly'
    ? 'cálido y cercano'
    : persona.tone === 'sales'
      ? 'vendedor, útil y proactivo sin ser insistente'
      : persona.tone === 'formal'
        ? 'cordial y profesional, sin sonar burocrático'
        : 'natural, cotidiano y humano'

  const system = `Reescribís respuestas de WhatsApp de ${companyName} para que suenen como una persona real del comercio. NO sos quien decide productos, stock, precios, cantidades, total, estado del pedido ni si una venta se confirma: esos datos vienen en una respuesta base y son inmutables.\n\nReglas obligatorias:\n- Conservá exactamente los hechos de la respuesta base: productos, cantidades, precios, stock, totales, números de pedido y la palabra CONFIRMAR cuando aparezca.\n- No inventes datos ni promociones.\n- No agregues una venta, descuento, envío, horario o disponibilidad que no figure en la base.\n- Soná ${toneText}.\n- ${persona.responseLength === 'short' ? 'Respondé corto, idealmente en 1 a 3 frases salvo que haya una lista de productos.' : 'Podés usar una respuesta normal, pero evitá párrafos innecesarios.'}\n- ${persona.useVos ? 'Usá voseo argentino natural.' : 'Evitá el voseo y usá un trato neutral.'}\n- ${persona.useEmojis ? 'Podés usar 0 o 1 emoji cuando quede natural.' : 'No uses emojis.'}\n- ${persona.oneQuestionAtATime ? 'Si necesitás preguntar algo, hacé una sola pregunta por mensaje.' : 'Podés hacer más de una pregunta sólo si es realmente necesario.'}\n- Evitá frases robóticas como "con gusto puedo ayudarte", "procederé", "estimado cliente", "según nuestros registros" o presentaciones largas.\n- No digas que sos humano. Si te preguntan explícitamente quién sos, podés decir que sos el asistente virtual del comercio.\n- Instrucciones del comercio: ${persona.customInstructions || 'Sin instrucciones adicionales.'}\n\n${examples ? `Ejemplos aprobados/corregidos de este comercio:\n${examples}\n\n` : ''}Devolvé únicamente la respuesta final, sin explicar el proceso.`

  for (const model of STYLE_MODELS) {
    try {
      const response = await fetch(GATEWAY_URL, {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: system },
            { role: 'user', content: `Mensaje del cliente:\n${customerText}\n\nRespuesta base inmutable en contenido:\n${baseReply}` },
          ],
          temperature: 0.45,
          max_tokens: 500,
        }),
        cache: 'no-store',
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) continue
      const styled = String(data?.choices?.[0]?.message?.content || '').trim().slice(0, 4000)
      if (!styled) continue
      const required = mandatoryTokens(baseReply)
      if (required.some(tokenValue => !styled.includes(tokenValue))) continue
      return styled
    } catch {}
  }
  return baseReply
}

async function replaceLatestOutbound(token: string, conversationId: string, original: string, styled: string) {
  if (!conversationId || !styled || styled === original) return
  const rows = await rest<any[]>(
    token,
    `whatsapp_ai_messages?conversation_id=eq.${encodeURIComponent(conversationId)}&direction=eq.outbound&select=id,body&order=created_at.desc&limit=1`,
  )
  const latest = rows?.[0]
  if (!latest?.id || String(latest.body || '') !== original) return
  await rest(token, `whatsapp_ai_messages?id=eq.${encodeURIComponent(latest.id)}`, {
    method: 'PATCH',
    headers: { Prefer: 'return=minimal' },
    body: JSON.stringify({ body: styled }),
  })
}

export async function processSellerMessageStyled(input: SellerInput) {
  const result: any = await processSellerMessage(input)
  if (!result?.reply || result?.duplicate) return result
  const original = String(result.reply)
  const styled = await humanizeReply(input.token, input.companyId, input.companyName, input.text, original)
  if (styled !== original) {
    try { await replaceLatestOutbound(input.token, String(result?.conversation?.id || ''), original, styled) } catch {}
  }
  return { ...result, reply: styled }
}
