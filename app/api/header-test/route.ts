export const dynamic = 'force-dynamic'

export async function GET() {
  return Response.json(
    { ok: true },
    {
      headers: {
        'Permissions-Policy': 'camera=(), microphone=(self), geolocation=()',
        'X-Commerce-Header-Test': 'app-response',
      },
    },
  )
}
