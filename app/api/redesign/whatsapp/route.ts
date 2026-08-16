import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function legacyWhatsAppDisabled() {
  return NextResponse.json(
    {
      ok: false,
      error: 'La integración legacy de WhatsApp por QR fue retirada. Comercio Lleno usará únicamente WhatsApp Business Platform / Cloud API oficial de Meta.',
      code: 'LEGACY_WHATSAPP_DISABLED',
    },
    { status: 410, headers: { 'Cache-Control': 'no-store' } },
  )
}

export async function GET() {
  return legacyWhatsAppDisabled()
}

export async function POST() {
  return legacyWhatsAppDisabled()
}
