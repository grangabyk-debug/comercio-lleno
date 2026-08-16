import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function disabled() {
  return NextResponse.json(
    {
      ok: false,
      error: 'El Vendedor IA asociado a la integración legacy de WhatsApp por QR está archivado y deshabilitado hasta migrarlo a la API oficial de Meta.',
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
