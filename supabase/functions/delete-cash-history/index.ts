import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ ok: false, error: 'Método no permitido' }, 405);

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!supabaseUrl || !anonKey || !serviceRoleKey) {
    return json({ ok: false, error: 'Configuración interna incompleta' }, 500);
  }

  const authorization = req.headers.get('authorization') || '';
  if (!authorization.toLowerCase().startsWith('bearer ')) {
    return json({ ok: false, error: 'Sesión no disponible' }, 401);
  }

  const body = await req.json().catch(() => ({} as any)) as { history_id?: unknown; password?: unknown };
  const historyId = String(body?.history_id ?? '').trim();
  const password = String(body?.password ?? '');
  if (!historyId || !password) {
    return json({ ok: false, error: 'Ingresá la contraseña del propietario para continuar.' }, 400);
  }

  try {
    const userResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: { apikey: anonKey, Authorization: authorization },
    });
    const user = await userResponse.json().catch(() => null) as any;
    if (!userResponse.ok || !user?.id || !user?.email) {
      return json({ ok: false, error: 'La sesión no es válida.' }, 401);
    }

    const profileResponse = await fetch(`${supabaseUrl}/rest/v1/profiles?select=id,company_id,role,active&id=eq.${encodeURIComponent(user.id)}&limit=1`, {
      headers: { apikey: serviceRoleKey, Authorization: `Bearer ${serviceRoleKey}` },
    });
    const profiles = await profileResponse.json().catch(() => []) as any[];
    const profile = profiles?.[0];
    if (!profileResponse.ok || !profile?.company_id || profile?.role !== 'owner' || profile?.active === false) {
      return json({ ok: false, error: 'Sólo el propietario puede eliminar una caja.' }, 403);
    }

    const passwordResponse = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: { apikey: anonKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: user.email, password }),
    });
    const passwordData = await passwordResponse.json().catch(() => null) as any;
    if (!passwordResponse.ok || passwordData?.user?.id !== user.id) {
      return json({ ok: false, error: 'Contraseña de propietario incorrecta.' }, 403);
    }

    const companyId = String(profile.company_id);
    const historyResponse = await fetch(`${supabaseUrl}/rest/v1/cash_register_history?select=id,company_id,cash_register_id,closed_at&id=eq.${encodeURIComponent(historyId)}&company_id=eq.${encodeURIComponent(companyId)}&limit=1`, {
      headers: { apikey: serviceRoleKey, Authorization: `Bearer ${serviceRoleKey}` },
    });
    const histories = await historyResponse.json().catch(() => []) as any[];
    const history = histories?.[0];
    if (!historyResponse.ok || !history) {
      return json({ ok: false, error: 'La caja no existe o no pertenece a este comercio.' }, 404);
    }

    const deleteResponse = await fetch(`${supabaseUrl}/rest/v1/cash_register_history?id=eq.${encodeURIComponent(historyId)}&company_id=eq.${encodeURIComponent(companyId)}`, {
      method: 'DELETE',
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
        Prefer: 'return=representation',
      },
    });
    const deleted = await deleteResponse.json().catch(() => []) as any[];
    if (!deleteResponse.ok || !Array.isArray(deleted) || deleted.length !== 1) {
      return json({ ok: false, error: 'No se pudo eliminar el cierre de caja.' }, 500);
    }

    return json({ ok: true, deleted_id: historyId, cash_register_id: history.cash_register_id ?? null });
  } catch (error) {
    return json({ ok: false, error: error instanceof Error ? error.message : 'Error interno al eliminar la caja.' }, 500);
  }
});
