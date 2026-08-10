import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function GET() {
  const configured = Boolean(
    process.env.ARCA_LA_ECONOMICA_CUIT &&
    process.env.ARCA_LA_ECONOMICA_PUNTO_VENTA &&
    process.env.ARCA_LA_ECONOMICA_CERT_PEM &&
    process.env.ARCA_LA_ECONOMICA_KEY_PEM,
  )

  return NextResponse.json({
    account: 'la-economica',
    environment: process.env.ARCA_LA_ECONOMICA_ENV || 'testing',
    configured,
    connected: false,
    message: configured
      ? 'Credenciales ARCA configuradas. Falta ejecutar la autenticación WSAA y validar el punto de venta.'
      : 'ARCA todavía no está configurado para La Económica.',
  })
}
