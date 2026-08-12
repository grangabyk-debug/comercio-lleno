import { NextRequest, NextResponse } from 'next/server'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://wtcntclzcubkbtcsqkzc.supabase.co'
const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? 'sb_publishable_02U2KDLDTR42KxdcFHtfYw_IDM00Deb'
const GATEWAY_URL = 'https://ai-gateway.vercel.sh/v1/chat/completions'
const MODELS = ['openai/gpt-5.5', 'openai/gpt-5.4']

const manual = `Sos el Asistente de Comercio Lleno, un POS para comercios minoristas argentinos.
Respondé en español rioplatense claro, breve y profesional. No inventes datos.

MAPA DEL SISTEMA:
- Inicio: ventas, ticket promedio, stock bajo y caja.
- Caja: búsqueda/scanner, carrito, cobro, Factura C por ARCA y contingencia offline.
- Productos: catálogo, costos, precios, stock y etiquetas.
- Gestión: ventas, reportes, clientes, rentabilidad, cuentas corrientes, devoluciones y promociones.
- Compras: registro documental por proveedor, comprobante, total y archivos de factura/remito. Las compras nuevas no modifican stock automáticamente.
- Configuración: comercio, caja, ARCA, impresora/tickets, stock, usuarios, actualizaciones y mantenimiento.

REGLAS:
- Para datos reales usá herramientas.
- Si el rol no tiene reportes, no reveles métricas agregadas.
- No hagas cambios: sólo consulta y ayuda.
- No digas que una Factura C fue autorizada sin CAE/estado autorizado.
- Si hace falta soporte, sugerí Ayuda humana.`

type Profile = { company_id: string; role: string; permissions?: Record<string, boolean> | null; active?: boolean }
type ToolCall = { id: string; type: 'function'; function: { name: string; arguments: string } }

function headers(token: string) { return { apikey: PUBLISHABLE_KEY, Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
async function rest<T>(token: string, path: string): Promise<T> {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, { headers: headers(token), cache: 'no-store' })
  const text = await r.text()
  if (!r.ok) throw new Error(text || `Supabase ${r.status}`)
  return (text ? JSON.parse(text) : null) as T
}
function dateStart(days: number) { const d = new Date(); d.setHours(0,0,0,0); d.setDate(d.getDate() - Math.max(0, days - 1)); return d.toISOString() }
function canReports(profile: Profile) { return profile.role === 'owner' || profile.permissions?.can_view_reports !== false }

async function executeTool(token: string, profile: Profile, name: string, rawArgs = '{}') {
  let args: any = {}; try { args = JSON.parse(rawArgs || '{}') } catch {}
  const companyId = encodeURIComponent(profile.company_id)
  if (name === 'search_products') {
    const rows = await rest<any[]>(token, `products?select=id,name,barcode,category,price,cost,wholesale_price,stock,min_stock,target_stock,unit&company_id=eq.${companyId}&active=eq.true&order=name.asc&limit=5000`)
    const q = String(args.query || '').toLowerCase().trim()
    return { products: rows.filter(p => !q || `${p.name} ${p.barcode || ''} ${p.category || ''}`.toLowerCase().includes(q)).slice(0, Math.min(30, Number(args.limit) || 10)) }
  }
  if (name === 'low_stock') {
    const rows = await rest<any[]>(token, `products?select=id,name,barcode,category,stock,min_stock&company_id=eq.${companyId}&active=eq.true&order=stock.asc&limit=5000`)
    const low = rows.filter(p => Number(p.stock || 0) <= Number(p.min_stock ?? 5)).slice(0, Math.min(50, Number(args.limit) || 20))
    return { count: low.length, products: low }
  }
  if (!canReports(profile) && ['sales_summary','sales_on_date','recent_sales','top_products'].includes(name)) return { error: 'El rol actual no tiene permiso para consultar reportes de ventas.' }
  if (name === 'sales_summary') {
    const days = Math.max(1, Math.min(365, Number(args.days) || 30))
    const rows = await rest<any[]>(token, `sales?select=id,sold_at,total,payment_method,fiscal_status,cae&company_id=eq.${companyId}&sold_at=gte.${encodeURIComponent(dateStart(days))}&order=sold_at.desc&limit=5000`)
    let total = 0, authorized = 0, pending = 0; const byPayment: Record<string, number> = {}
    for (const sale of rows) { const amount = Number(sale.total || 0); total += amount; const pay = sale.payment_method || 'Sin definir'; byPayment[pay] = (byPayment[pay] || 0) + amount; if (sale.cae || sale.fiscal_status === 'authorized') authorized++; else pending++ }
    return { days, operations: rows.length, total, average: rows.length ? total / rows.length : 0, authorized, pending, by_payment: byPayment }
  }
  if (name === 'sales_on_date') {
    const value = String(args.date || '').slice(0,10); if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return { error: 'Fecha inválida.' }
    const start = new Date(`${value}T00:00:00`), end = new Date(`${value}T00:00:00`); end.setDate(end.getDate() + 1)
    const rows = await rest<any[]>(token, `sales?select=id,sold_at,total,payment_method,fiscal_status,cae&company_id=eq.${companyId}&sold_at=gte.${encodeURIComponent(start.toISOString())}&sold_at=lt.${encodeURIComponent(end.toISOString())}&order=sold_at.asc&limit=2000`)
    return { date: value, operations: rows.length, total: rows.reduce((a,s)=>a+Number(s.total||0),0), average: rows.length ? rows.reduce((a,s)=>a+Number(s.total||0),0)/rows.length : 0, sales: rows.slice(0,100) }
  }
  if (name === 'recent_sales') return { sales: await rest<any[]>(token, `sales?select=id,sold_at,total,payment_method,fiscal_status,cae&company_id=eq.${companyId}&order=sold_at.desc&limit=${Math.max(1,Math.min(100,Number(args.limit)||20))}`) }
  if (name === 'top_products') {
    const days = Math.max(1, Math.min(365, Number(args.days) || 30))
    const rows = await rest<any[]>(token, `sales?select=details&company_id=eq.${companyId}&sold_at=gte.${encodeURIComponent(dateStart(days))}&limit=5000`)
    const map = new Map<string,{name:string;qty:number;revenue:number}>()
    for (const sale of rows) for (const item of (sale.details?.items || [])) { const id=String(item.product_id||item.name||''); const old=map.get(id)||{name:String(item.name||'Producto'),qty:0,revenue:0}; old.qty+=Number(item.qty||0); old.revenue+=Number(item.line_total ?? Number(item.qty||0)*Number(item.unit_price||0)); map.set(id,old) }
    return { days, top: [...map.values()].sort((a,b)=>b.qty-a.qty).slice(0,Math.max(1,Math.min(30,Number(args.limit)||10))) }
  }
  return { error: `Herramienta desconocida: ${name}` }
}

const tools = [
  { type:'function', function:{ name:'search_products', description:'Busca productos reales por nombre, código o categoría.', parameters:{type:'object',properties:{query:{type:'string'},limit:{type:'number'}},required:['query']} } },
  { type:'function', function:{ name:'low_stock', description:'Lista productos con stock bajo.', parameters:{type:'object',properties:{limit:{type:'number'}}} } },
  { type:'function', function:{ name:'sales_summary', description:'Resumen real de ventas de los últimos N días.', parameters:{type:'object',properties:{days:{type:'number'}},required:['days']} } },
  { type:'function', function:{ name:'sales_on_date', description:'Ventas reales de una fecha.', parameters:{type:'object',properties:{date:{type:'string'}},required:['date']} } },
  { type:'function', function:{ name:'recent_sales', description:'Ventas recientes.', parameters:{type:'object',properties:{limit:{type:'number'}}} } },
  { type:'function', function:{ name:'top_products', description:'Productos más vendidos.', parameters:{type:'object',properties:{days:{type:'number'},limit:{type:'number'}},required:['days']} } },
]

async function gateway(messages: any[]) {
  const apiKey = process.env.AI_GATEWAY_API_KEY || process.env.VERCEL_OIDC_TOKEN
  if (!apiKey) throw new Error('AI Gateway no tiene autenticación disponible en este deployment.')
  let last = ''
  for (const model of MODELS) {
    const r = await fetch(GATEWAY_URL, { method:'POST', headers:{Authorization:`Bearer ${apiKey}`,'Content-Type':'application/json'}, body:JSON.stringify({model,messages,tools,tool_choice:'auto',temperature:0.2,max_tokens:700}), cache:'no-store' })
    const data = await r.json().catch(()=>({}))
    if (r.ok) return { message: data?.choices?.[0]?.message, model }
    last = String(data?.error?.message || data?.error || `AI Gateway ${r.status}`)
    if (r.status !== 403 || !/free tier|access to this model|restricted/i.test(last)) throw new Error(last)
  }
  throw new Error(last || 'No hay un modelo disponible para este plan.')
}

function peso(n:number){return new Intl.NumberFormat('es-AR',{style:'currency',currency:'ARS',maximumFractionDigits:0}).format(n)}
async function deterministicFallback(question:string, token:string, profile:Profile) {
  const q = question.toLowerCase()
  if (!canReports(profile) && /venta|factur|recaud|ticket promedio/i.test(q)) return 'Tu usuario no tiene permiso para consultar reportes de ventas.'
  if (/ventas?.*(hoy)|cómo vienen.*ventas|como vienen.*ventas/i.test(q)) {
    const today = new Intl.DateTimeFormat('en-CA',{timeZone:'America/Argentina/Buenos_Aires'}).format(new Date())
    const r:any = await executeTool(token,profile,'sales_on_date',JSON.stringify({date:today}))
    return `Hoy llevás ${r.operations || 0} venta${r.operations===1?'':'s'} por ${peso(Number(r.total||0))}. Ticket promedio: ${peso(Number(r.average||0))}.`
  }
  if (/stock bajo|faltan productos|reponer/i.test(q)) { const r:any=await executeTool(token,profile,'low_stock','{"limit":20}'); return r.count ? `Tenés ${r.count} producto${r.count===1?'':'s'} en stock bajo: ${r.products.slice(0,10).map((p:any)=>`${p.name} (${p.stock})`).join(', ')}.` : 'No hay productos por debajo de su stock mínimo.' }
  return null
}

export async function POST(req: NextRequest) {
  try {
    const token=(req.headers.get('authorization')||'').replace(/^Bearer\s+/i,'').trim(); if(!token)return NextResponse.json({error:'Sesión requerida.'},{status:401})
    const body=await req.json().catch(()=>({})); const question=String(body?.message||'').trim().slice(0,2000); if(!question)return NextResponse.json({error:'Escribí una consulta.'},{status:400})
    const profiles=await rest<Profile[]>(token,'profiles?select=company_id,role,permissions,active&limit=1'); const profile=profiles?.[0]; if(!profile?.company_id||profile.active===false)return NextResponse.json({error:'Usuario sin comercio activo.'},{status:403})
    const companies=await rest<Array<{name:string}>>(token,`companies?select=name&id=eq.${encodeURIComponent(profile.company_id)}&limit=1`); const companyName=companies?.[0]?.name||'este comercio'
    const history=Array.isArray(body?.history)?body.history.slice(-8).map((m:any)=>({role:m?.role==='assistant'?'assistant':'user',content:String(m?.content||'').slice(0,1500)})):[]
    const messages:any[]=[{role:'system',content:`${manual}\n\nCOMERCIO: ${companyName}\nROL: ${profile.role}\nPERMISOS: ${JSON.stringify(profile.permissions||{})}`},...history,{role:'user',content:question}]
    let selectedModel=''; let response:any
    try {
      let out=await gateway(messages); response=out.message; selectedModel=out.model
      for(let round=0;round<3&&Array.isArray(response?.tool_calls)&&response.tool_calls.length;round++){
        messages.push(response)
        for(const call of response.tool_calls as ToolCall[]){const result=await executeTool(token,profile,call.function.name,call.function.arguments);messages.push({role:'tool',tool_call_id:call.id,content:JSON.stringify(result)})}
        out=await gateway(messages); response=out.message; selectedModel=out.model
      }
      const answer=String(response?.content||'').trim(); if(!answer)throw new Error('El asistente no devolvió una respuesta.')
      return NextResponse.json({ok:true,answer,model:selectedModel})
    } catch (gatewayError) {
      const fallback=await deterministicFallback(question,token,profile)
      if(fallback)return NextResponse.json({ok:true,answer:fallback,model:'direct-data-fallback'})
      throw gatewayError
    }
  } catch(e){return NextResponse.json({ok:false,error:e instanceof Error?e.message:String(e)},{status:500})}
}
