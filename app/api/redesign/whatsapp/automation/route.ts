import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function disabled() {
  return NextResponse.json(
    {
      ok: false,
      error: 'Las automatizaciones de la integración legacy de WhatsApp por QR están deshabilitadas. La nueva implementación será exclusivamente con la API oficial de Meta.',
      code: 'LEGACY_WHATSAPP_DISABLED',
    },
    { status: 410, headers: { 'Cache-Control': 'no-store' } },
  )
}

export async function GET() {
  return disabled()
}

export async function POST() {
  return disabled()
}
