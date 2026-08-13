import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

function cors(req: Request) {
  const origin = req.headers.get('origin') || '';
  const allowed = origin === 'https://comerciolleno.com' || origin === 'https://www.comerciolleno.com' || /^https:\/\/[-a-z0-9]+\.vercel\.app$/i.test(origin);
  return {
    'Access-Control-Allow-Origin': allowed ? origin : 'https://www.comerciolleno.com',
    'Vary':'Origin',
    'Access-Control-Allow-Headers':'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods':'POST, OPTIONS',
  };
}
function json(req:Request,body:unknown,status=200){return Response.json(body,{status,headers:{...cors(req),'Cache-Control':'no-store'}})}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status:204, headers: cors(req) });
  if (req.method !== 'POST') return json(req,{error:'Método no permitido'},405);
  try {
    const authHeader = req.headers.get("Authorization") || "";
    const token = authHeader.replace(/^Bearer\s+/i, "");
    if (!token) return json(req,{error:'Sesión inválida'},401);

    const { password } = await req.json().catch(()=>({}));
    if (!password || typeof password !== "string") return json(req,{error:'Ingresá la contraseña del propietario'},400);

    const url = Deno.env.get("SUPABASE_URL")!;
    const anon = Deno.env.get("SUPABASE_ANON_KEY")!;
    const service = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = createClient(url, service, { auth: { persistSession: false } });

    const userRes = await fetch(url + "/auth/v1/user", {
      headers: { apikey: anon, Authorization: `Bearer ${token}` },
      cache:'no-store',
    });
    if (!userRes.ok) return json(req,{error:'La sesión venció. Volvé a ingresar.'},401);
    const user = await userRes.json();
    if (!user?.id || !user?.email) return json(req,{error:'No pudimos verificar al usuario'},401);

    const { data: profile, error: pErr } = await admin
      .from("profiles")
      .select("company_id,role,active")
      .eq("id", user.id)
      .single();
    if (pErr || !profile?.company_id) return json(req,{error:'No encontramos el comercio asociado'},403);
    if (profile.role !== "owner" || profile.active !== true) return json(req,{error:'Solo el propietario activo puede restablecer las ventas'},403);

    const verifyRes = await fetch(url + "/auth/v1/token?grant_type=password", {
      method: "POST",
      headers: { apikey: anon, "Content-Type": "application/json" },
      body: JSON.stringify({ email: user.email, password }),
      cache:'no-store',
    });
    if (!verifyRes.ok) return json(req,{error:'La contraseña del propietario es incorrecta'},403);

    const { data: sales, error: sErr } = await admin
      .from("sales")
      .select("id")
      .eq("company_id", profile.company_id);
    if (sErr) throw sErr;

    const ids = (sales || []).map((s: any) => s.id);
    for (let i = 0; i < ids.length; i += 200) {
      const chunk = ids.slice(i, i + 200);
      const { error } = await admin.from("sale_items").delete().in("sale_id", chunk);
      if (error) throw error;
    }
    const { error: dErr } = await admin.from("sales").delete().eq("company_id", profile.company_id);
    if (dErr) throw dErr;

    return json(req,{ ok: true, deleted_sales: ids.length });
  } catch (e) {
    return json(req,{ error: e instanceof Error ? e.message : "No se pudo restablecer" },500);
  }
});
