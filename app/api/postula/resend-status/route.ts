import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    ok: true,
    resendConfigured: Boolean(process.env.RESEND_API_KEY),
    environment: process.env.VERCEL_ENV ?? 'unknown',
  })
}
