import { NextRequest, NextResponse } from 'next/server'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://wtcntclzcubkbtcsqkzc.supabase.co'
const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? 'sb_publishable_02U2KDLDTR42KxdcFHtfYw_IDM00Deb'
const GATEWAY_URL = 'https://ai-gateway.vercel.sh/v1/chat/completions'
const MODEL = 'openai/gpt-5.6-sol'

const manual = `
Sos el Asistente de Comercio Lleno, un sistema POS para comercios minoristas argentinos.
Respondé siempre en español rioplatense claro, breve y profesional. No inventes datos del negocio.

MAPA ACTUAL DEL SISTEMA:
- Inicio: resumen de ventas, ticket promedio, stock bajo y estado de caja.
- Caja: scanner USB, búsqueda, carrito, cantidades, medio de pago, cobro, Factura C por ARCA y contingencia Pendiente ARCA si el servicio fiscal no responde.
- Productos: alta y edición de nombre, código, categoría, unidad, costo, precio minorista, mayorista, stock, stock mínimo, objetivo y proveedor. También impresión de etiquetas.
- Caja diaria: apertura/cierre, actividad y contador de billetes para arqueo.
- Gestión > Ventas: historial, estado fiscal, PDF, impresión, email y detalle de factura.
- Gestión > Reportes: ventas por períodos y medios de pago.
- Gestión > Clientes: alta y consulta de clientes.
- Gestión > Rentabilidad: ventas, costo vendido, ganancia y margen estimado.
- Gestión > Cuentas corrientes: cargos, pagos y saldo por cliente.
- Gestión > Devoluciones: reingreso al stock y registro de nota de crédito pendiente.
- Gestión > Promociones: promociones 2x1.
- Compras: ingreso de mercadería, costo y actualización de stock.
- Proveedores: alta y edición de proveedores.
- Configuración: Comercio, Ventas y caja, ARCA, Impresora y tickets, Stock, Usuarios y roles, Actualizaciones y Mantenimiento. Usuarios/roles, actualizaciones y restablecer ventas son exclusivos del Propietario.

REGLAS:
- Para preguntas sobre datos reales (ventas, productos, stock, clientes, fechas, top vendidos) usá las herramientas disponibles.
- Si el rol no tiene permiso de reportes, no reveles métricas agregadas de ventas.
- Si el usuario pregunta cómo hacer algo en el sistema, explicalo con pasos cortos usando el mapa anterior.
- No asegures que una Factura C fue autorizada salvo que el dato de venta tenga CAE/estado autorizado.
- No hagas cambios en datos: este asistente es de consulta y ayuda. Las operaciones se realizan desde las pantallas correspondientes.
- Si hay un problema que requiere soporte, sugerí el botón rojo “Ayuda humana”.
`.trim()

type Profile = { company_id: string; role: string; permissions?: Record<string, boolean> | null; active?: boolean }

type ToolCall = { id: string; type: 'function'; function: { name: string; arguments: string } }

function headers(token: string) {
  return { apikey: PUBLISHABLE_KEY, Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
}

async function rest<T>(token: string, path: string): Promise<T> {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, { headers: headers(token), cache: 'no-store' })
  const text = await r.text()
  if (!r.ok) throw new Error(text || `Supabase ${r.status}`)
  return (text ? JSON.parse(text) : null) as T
}

function dateStart(days: number) {
  const d = new Date(); d.setHours(0,0,0,0); d.setDate(d.getDate() - Math.max(0, days - 1)); return d.toISOString()
}

async function executeTool(token: string, profile: Profile, name: string, rawArgs: string) {
  let args: any = {}
  try { args = JSON.parse(rawArgs || '{}') } catch {}
  const companyId = encodeURIComponent(profile.company_id)
  const canReports = profile.role === 'owner' || profile.permissions?.can_view_reports !== false

  if (name === 'search_products') {
    const rows = await rest<any[]>(token, `products?select=id,name,barcode,category,price,cost,wholesale_price,stock,min_stock,target_stock,unit&company_id=eq.${companyId}&active=eq.true&order=name.asc&limit=5000`)
    const q = String(args.query || '').toLowerCase().trim()
    const filtered = rows.filter(p => !q || `${p.name} ${p.barcode || ''} ${p.category || ''}`.toLowerCase().includes(q)).slice(0, Math.min(30, Number(args.limit) || 10))
    return { products: filtered.map(p => ({ ...p, price:Number(p.price||0), cost:Number(p.cost||0), wholesale_price:Number(p.wholesale_price||0), stock:Number(p.stock||0) })) }
  }

  if (name === 'low_stock') {
    const rows = await rest<any[]>(token, `products?select=id,name,barcode,category,stock,min_stock&company_id=eq.${companyId}&active=eq.true&order=stock.asc&limit=5000`)
    const low = rows.filter(p => Number(p.stock||0) <= Number(p.min_stock ?? 5)).slice(0, Math.min(50, Number(args.limit) || 20))
    return { count: low.length, products: low }
  }

  if (!canReports && ['sales_summary','sales_on_date','top_products','recent_sales'].includes(name)) {
    return { error: 'El rol actual no tiene permiso para consultar reportes de ventas.' }
  }

  if (name === 'sales_summary') {
    const days = Math.max(1, Math.min(365, Number(args.days) || 30))
    const start = encodeURIComponent(dateStart(days))
    const rows = await rest<any[]>(token, `sales?select=id,sold_at,total,payment_method,fiscal_status,cae,receipt_number,details&company_id=eq.${companyId}&sold_at=gte.${start}&order=sold_at.desc&limit=5000`)
    const byPayment: Record<string, number> = {}
    let total = 0, authorized = 0, pending = 0
    for (const s of rows) { const amount=Number(s.total||0); total+=amount; const pay=s.payment_method||'Sin definir'; byPayment[pay]=(byPayment[pay]||0)+amount; if(s.cae||s.fiscal_status==='authorized')authorized++; else pending++ }
    return { days, operations: rows.length, total, average: rows.length ? total/rows.length : 0, authorized, pending, by_payment: byPayment }
  }

  if (name === 'sales_on_date') {
    const value = String(args.date || '').slice(0,10)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return { error:'Fecha inválida; usar YYYY-MM-DD.' }
    const start = new Date(`${value}T00:00:00`).toISOString(), endDate=new Date(`${value}T00:00:00`); endDate.setDate(endDate.getDate()+1); const end=endDate.toISOString()
    const rows = await rest<any[]>(token, `sales?select=id,sold_at,total,payment_method,fiscal_status,cae,receipt_number,details&company_id=eq.${companyId}&sold_at=gte.${encodeURIComponent(start)}&sold_at=lt.${encodeURIComponent(end)}&order=sold_at.asc&limit=1000`)
    return { date:value, operations:rows.length, total:rows.reduce((a,s)=>a+Number(s.total||0),0), sales:rows.slice(0,100) }
  }

  if (name === 'recent_sales') {
    const limit=Math.max(1,Math.min(100,Number(args.limit)||20))
    const rows=await rest<any[]>(token,`sales?select=id,sold_at,total,payment_method,fiscal_status,cae,receipt_number,details&company_id=eq.${companyId}&order=sold_at.desc&limit=${limit}`)
    return { sales: rows }
  }

  if (name === 'top_products') {
    const days=Math.max(1,Math.min(365,Number(args.days)||30)), start=encodeURIComponent(dateStart(days))
    const rows=await rest<any[]>(token,`sales?select=id,sold_at,details&company_id=eq.${companyId}&sold_at=gte.${start}&order=sold_at.desc&limit=5000`)
    const map=new Map<string,{name:string;qty:number;revenue:number}>()
    for(const s of rows){for(const item of (s.details?.items||[])){const id=String(item.product_id||item.name||'');const old=map.get(id)||{name:String(item.name||'Producto'),qty:0,revenue:0};old.qty+=Number(item.qty||0);old.revenue+=Number(item.line_total ?? Number(item.qty||0)*Number(item.unit_price||0));map.set(id,old)}}
    const top=[...map.values()].sort((a,b)=>b.qty-a.qty).slice(0,Math.max(1,Math.min(30,Number(args.limit)||10)))
    return { days, top }
  }

  return { error: `Herramienta desconocida: ${name}` }
}

const tools = [
  { type:'function', function:{ name:'search_products', description:'Busca productos reales del comercio por nombre, código o categoría y devuelve precio y stock.', parameters:{type:'object',properties:{query:{type:'string'},limit:{type:'number'}},required:['query']} } },
  { type:'function', function:{ name:'low_stock', description:'Lista productos reales con stock menor o igual a su mínimo.', parameters:{type:'object',properties:{limit:{type:'number'}}} } },
  { type:'function', function:{ name:'sales_summary', description:'Obtiene resumen real de ventas para una cantidad de días.', parameters:{type:'object',properties:{days:{type:'number'}},required:['days']} } },
  { type:'function', function:{ name:'sales_on_date', description:'Obtiene ventas reales de una fecha exacta.', parameters:{type:'object',properties:{date:{type:'string',description:'YYYY-MM-DD'}},required:['date']} } },
  { type:'function', function:{ name:'recent_sales', description:'Obtiene las ventas más recientes del comercio.', parameters:{type:'object',properties:{limit:{type:'number'}}} } },
  { type:'function', function:{ name:'top_products', description:'Calcula productos más vendidos por unidades en un período.', parameters:{type:'object',properties:{days:{type:'number'},limit:{type:'number'}},required:['days']} } },
]

async function gateway(messages: any[]) {
  const apiKey = process.env.AI_GATEWAY_API_KEY || process.env.VERCEL_OIDC_TOKEN
  if (!apiKey) throw new Error('AI Gateway no tiene autenticación disponible en este deployment.')
  const r = await fetch(GATEWAY_URL, {
    method:'POST',
    headers:{ Authorization:`Bearer ${apiKey}`, 'Content-Type':'application/json' },
    body:JSON.stringify({ model:MODEL, messages, tools, tool_choice:'auto', temperature:0.2, max_tokens:700 }),
    cache:'no-store',
  })
  const data = await r.json().catch(()=>({}))
  if(!r.ok) throw new Error(data?.error?.message || data?.error || `AI Gateway ${r.status}`)
  return data?.choices?.[0]?.message
}

export async function POST(req: NextRequest) {
  try {
    const token = (req.headers.get('authorization') || '').replace(/^Bearer\s+/i,'').trim()
    if(!token) return NextResponse.json({error:'Sesión requerida.'},{status:401})
    const body=await req.json().catch(()=>({}))
    const question=String(body?.message||'').trim().slice(0,2000)
    if(!question) return NextResponse.json({error:'Escribí una consulta.'},{status:400})

    const profiles=await rest<Profile[]>(token,'profiles?select=company_id,role,permissions,active&limit=1')
    const profile=profiles?.[0]
    if(!profile?.company_id||profile.active===false) return NextResponse.json({error:'Usuario sin comercio activo.'},{status:403})
    const companies=await rest<Array<{name:string}>>(token,`companies?select=name&id=eq.${encodeURIComponent(profile.company_id)}&limit=1`)
    const companyName=companies?.[0]?.name||'este comercio'

    const history=Array.isArray(body?.history)?body.history.slice(-8).map((m:any)=>({role:m?.role==='assistant'?'assistant':'user',content:String(m?.content||'').slice(0,1500)})):[]
    const messages:any[]=[{role:'system',content:`${manual}\n\nCOMERCIO ACTUAL: ${companyName}\nROL ACTUAL: ${profile.role}\nPERMISOS: ${JSON.stringify(profile.permissions||{})}`} ,...history,{role:'user',content:question}]

    let message=await gateway(messages)
    for(let round=0;round<3&&Array.isArray(message?.tool_calls)&&message.tool_calls.length;round++){
      messages.push(message)
      for(const call of message.tool_calls as ToolCall[]){const result=await executeTool(token,profile,call.function.name,call.function.arguments);messages.push({role:'tool',tool_call_id:call.id,content:JSON.stringify(result)})}
      message=await gateway(messages)
    }
    const answer=String(message?.content||'').trim()
    if(!answer) throw new Error('El asistente no devolvió una respuesta.')
    return NextResponse.json({ok:true,answer,model:MODEL})
  } catch (e) {
    return NextResponse.json({ok:false,error:e instanceof Error?e.message:String(e)},{status:500})
  }
}
