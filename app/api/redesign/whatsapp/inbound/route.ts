import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function disabled() {
  return NextResponse.json(
    {
      ok: false,
      error: 'El webhook legacy de WhatsApp por QR/Evolution está deshabilitado. La recepción futura se realizará mediante webhooks oficiales de WhatsApp Business Platform.',
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
