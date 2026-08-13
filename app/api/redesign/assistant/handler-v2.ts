import { NextRequest, NextResponse } from 'next/server'

const SUPABASE_URL=process.env.NEXT_PUBLIC_SUPABASE_URL??'https://wtcntclzcubkbtcsqkzc.supabase.co'
const PUBLISHABLE_KEY=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY??'sb_publishable_02U2KDLDTR42KxdcFHtfYw_IDM00Deb'
const GATEWAY_URL='https://ai-gateway.vercel.sh/v1/chat/completions'
const MODELS=['openai/gpt-5.4-nano','google/gemini-3.5-flash-lite','openai/gpt-5.4']

type Profile={user_id:string;company_id:string;role:string;permissions?:Record<string,boolean>|null;company_name:string}
type ToolCall={id:string;type:'function';function:{name:string;arguments:string}}
class HttpError extends Error{status:number;constructor(status:number,message:string){super(message);this.status=status}}

const manual=`Sos el Asistente IA de Comercio Lleno, un POS multi-tenant para comercios argentinos.
Respondé en español rioplatense claro, breve y profesional. Nunca inventes datos.
Usá herramientas para consultar información real del comercio autenticado.
Podés ayudar con ventas, facturación interna, productos, precios, stock, más vendidos, medios de pago, clientes, caja y explicar cómo usar Comercio Lleno.
Nunca hagas cambios ni reveles datos de otro comercio. Si un dato no está disponible, decilo.`

function headers(token:string){return{apikey:PUBLISHABLE_KEY,Authorization:`Bearer ${token}`,'Content-Type':'application/json'}}
async function rest<T>(token:string,path:string):Promise<T>{const r=await fetch(`${SUPABASE_URL}/rest/v1/${path}`,{headers:headers(token),cache:'no-store'});const text=await r.text();if(!r.ok)throw new Error(text||`Supabase ${r.status}`);return(text?JSON.parse(text):null)as T}
function dateStart(days:number){const d=new Date();d.setHours(0,0,0,0);d.setDate(d.getDate()-Math.max(0,days-1));return d.toISOString()}
function canReports(p:Profile){return p.role==='owner'||p.permissions?.can_view_reports!==false}
function peso(n:number){return new Intl.NumberFormat('es-AR',{style:'currency',currency:'ARS',maximumFractionDigits:0}).format(n)}
function detectDays(q:string,def=30){const m=q.match(/(\d{1,3})\s*d[ií]as?/i);if(m)return Math.max(1,Math.min(365,Number(m[1])));if(/semana/i.test(q))return 7;if(/mes|30 d/i.test(q))return 30;if(/año|ano|365 d/i.test(q))return 365;return def}

async function authorize(token:string):Promise<Profile>{
  const userResp=await fetch(`${SUPABASE_URL}/auth/v1/user`,{headers:{apikey:PUBLISHABLE_KEY,Authorization:`Bearer ${token}`},cache:'no-store'})
  const user=await userResp.json().catch(()=>null)
  if(!userResp.ok||!user?.id)throw new HttpError(401,'La sesión no es válida o venció. Volvé a iniciar sesión.')
  const rpc=await fetch(`${SUPABASE_URL}/rest/v1/rpc/authorize_ai_request`,{method:'POST',headers:headers(token),body:'{}',cache:'no-store'})
  const raw=await rpc.json().catch(()=>null)
  if(!rpc.ok){const msg=String(raw?.message||raw?.error||'Usuario no autorizado para usar el asistente.');throw new HttpError(/límite/i.test(msg)?429:403,msg)}
  const ctx=(Array.isArray(raw)?raw[0]:raw) as Profile|null
  if(!ctx?.user_id||ctx.user_id!==user.id||!ctx.company_id)throw new HttpError(403,'No se pudo validar el usuario de Comercio Lleno.')
  return ctx
}

async function executeTool(token:string,profile:Profile,name:string,rawArgs='{}'){
  let args:any={};try{args=JSON.parse(rawArgs||'{}')}catch{}
  const companyId=encodeURIComponent(profile.company_id)
  if(name==='search_products'){
    const rows=await rest<any[]>(token,`products?select=id,name,barcode,category,price,cost,wholesale_price,stock,min_stock,target_stock,unit&company_id=eq.${companyId}&active=eq.true&order=name.asc&limit=5000`)
    const q=String(args.query||'').toLowerCase().trim();return{count:rows.length,products:rows.filter(p=>!q||`${p.name} ${p.barcode||''} ${p.category||''}`.toLowerCase().includes(q)).slice(0,Math.min(30,Number(args.limit)||10))}
  }
  if(name==='product_count'){const rows=await rest<any[]>(token,`products?select=id&company_id=eq.${companyId}&active=eq.true&limit=10000`);return{count:rows.length}}
  if(name==='low_stock'){
    const rows=await rest<any[]>(token,`products?select=id,name,barcode,category,stock,min_stock,target_stock&company_id=eq.${companyId}&active=eq.true&order=stock.asc&limit=5000`)
    const low=rows.filter(p=>Number(p.stock||0)<=Number(p.min_stock??5)).slice(0,Math.min(50,Number(args.limit)||20));return{count:low.length,products:low}
  }
  if(!canReports(profile)&&['sales_summary','sales_on_date','recent_sales','top_products','priority_order'].includes(name))return{error:'El rol actual no tiene permiso para consultar reportes de ventas.'}
  if(name==='sales_summary'){
    const days=Math.max(1,Math.min(365,Number(args.days)||30));const rows=await rest<any[]>(token,`sales?select=id,sold_at,total,payment_method,fiscal_status,cae&company_id=eq.${companyId}&sold_at=gte.${encodeURIComponent(dateStart(days))}&order=sold_at.desc&limit=10000`)
    let total=0,authorized=0,pending=0;const byPayment:Record<string,number>={};for(const sale of rows){const amount=Number(sale.total||0);total+=amount;const pay=sale.payment_method||'Sin definir';byPayment[pay]=(byPayment[pay]||0)+amount;if(sale.cae||sale.fiscal_status==='authorized')authorized++;else pending++}
    return{days,operations:rows.length,total,average:rows.length?total/rows.length:0,authorized,pending,by_payment:byPayment}
  }
  if(name==='sales_on_date'){
    const value=String(args.date||'').slice(0,10);if(!/^\d{4}-\d{2}-\d{2}$/.test(value))return{error:'Fecha inválida.'};const start=new Date(`${value}T00:00:00-03:00`),end=new Date(start);end.setDate(end.getDate()+1)
    const rows=await rest<any[]>(token,`sales?select=id,sold_at,total,payment_method,fiscal_status,cae&company_id=eq.${companyId}&sold_at=gte.${encodeURIComponent(start.toISOString())}&sold_at=lt.${encodeURIComponent(end.toISOString())}&order=sold_at.asc&limit=5000`);const total=rows.reduce((a,s)=>a+Number(s.total||0),0);return{date:value,operations:rows.length,total,average:rows.length?total/rows.length:0,sales:rows.slice(0,100)}
  }
  if(name==='recent_sales')return{sales:await rest<any[]>(token,`sales?select=id,sold_at,total,payment_method,fiscal_status,cae&company_id=eq.${companyId}&order=sold_at.desc&limit=${Math.max(1,Math.min(100,Number(args.limit)||20))}`)}
  if(name==='top_products'){
    const days=Math.max(1,Math.min(365,Number(args.days)||30)),rows=await rest<any[]>(token,`sales?select=details&company_id=eq.${companyId}&sold_at=gte.${encodeURIComponent(dateStart(days))}&limit=10000`),map=new Map<string,{id:string;name:string;qty:number;revenue:number}>()
    for(const sale of rows)for(const item of(sale.details?.items||[])){const id=String(item.product_id||item.name||'');const old=map.get(id)||{id,name:String(item.name||'Producto'),qty:0,revenue:0};old.qty+=Number(item.qty||0);old.revenue+=Number(item.line_total??Number(item.qty||0)*Number(item.unit_price||0));map.set(id,old)}
    return{days,top:[...map.values()].sort((a,b)=>b.qty-a.qty).slice(0,Math.max(1,Math.min(30,Number(args.limit)||10)))}
  }
  if(name==='priority_order'){
    const products=await rest<any[]>(token,`products?select=id,name,stock,min_stock,target_stock&company_id=eq.${companyId}&active=eq.true&limit=5000`),sales=await rest<any[]>(token,`sales?select=details&company_id=eq.${companyId}&sold_at=gte.${encodeURIComponent(dateStart(30))}&limit=10000`),demand=new Map<string,number>()
    for(const sale of sales)for(const item of(sale.details?.items||[])){const id=String(item.product_id||'');if(id)demand.set(id,(demand.get(id)||0)+Number(item.qty||0))}
    const ranked=products.map(p=>{const sold=demand.get(String(p.id))||0,stock=Number(p.stock||0),target=Math.max(Number(p.target_stock||0),Number(p.min_stock||0),1),shortage=Math.max(0,target-stock),score=sold*3+shortage*2+(stock<=Number(p.min_stock||0)?10:0);return{id:p.id,name:p.name,stock,sold,score}}).filter(x=>x.sold>0||x.score>0).sort((a,b)=>b.score-a.score||b.sold-a.sold).slice(0,10)
    return{days:30,products:ranked}
  }
  return{error:`Herramienta desconocida: ${name}`}
}

const tools=[
  {type:'function',function:{name:'search_products',description:'Busca productos reales por nombre, código o categoría.',parameters:{type:'object',properties:{query:{type:'string'},limit:{type:'number'}},required:['query']}}},
  {type:'function',function:{name:'product_count',description:'Cuenta productos activos cargados.',parameters:{type:'object',properties:{}}}},
  {type:'function',function:{name:'low_stock',description:'Lista productos con stock bajo.',parameters:{type:'object',properties:{limit:{type:'number'}}}}},
  {type:'function',function:{name:'sales_summary',description:'Resumen de ventas de los últimos N días.',parameters:{type:'object',properties:{days:{type:'number'}},required:['days']}}},
  {type:'function',function:{name:'sales_on_date',description:'Ventas de una fecha.',parameters:{type:'object',properties:{date:{type:'string'}},required:['date']}}},
  {type:'function',function:{name:'recent_sales',description:'Ventas recientes.',parameters:{type:'object',properties:{limit:{type:'number'}}}}},
  {type:'function',function:{name:'top_products',description:'Productos más vendidos.',parameters:{type:'object',properties:{days:{type:'number'},limit:{type:'number'}},required:['days']}}},
  {type:'function',function:{name:'priority_order',description:'Lista prioritaria de compra basada en demanda y stock.',parameters:{type:'object',properties:{}}}},
]

async function gateway(messages:any[]){
  const apiKey=process.env.AI_GATEWAY_API_KEY||process.env.VERCEL_OIDC_TOKEN;if(!apiKey)throw new Error('gateway-unavailable');let last=''
  for(const model of MODELS){const r=await fetch(GATEWAY_URL,{method:'POST',headers:{Authorization:`Bearer ${apiKey}`,'Content-Type':'application/json'},body:JSON.stringify({model,messages,tools,tool_choice:'auto',temperature:.2,max_tokens:700}),cache:'no-store'});const data=await r.json().catch(()=>({}));if(r.ok)return{message:data?.choices?.[0]?.message,model};last=String(data?.error?.message||data?.error||`AI Gateway ${r.status}`);if(![403,404,429].includes(r.status))throw new Error(last)}throw new Error(last||'gateway-unavailable')
}

async function directAnswer(question:string,token:string,profile:Profile){
  const q=question.toLowerCase(),days=detectDays(q,30)
  if(/qu[eé] puedo hacer.*ia|qu[eé] hace.*asistente|para qu[eé] sirve.*ia/.test(q))return'Puedo consultar datos reales de tu comercio: ventas por fecha o período, facturación, ticket promedio, medios de pago, productos más vendidos, cantidad de productos, precios, stock bajo y prioridades de reposición. También puedo explicarte cómo usar las funciones de Comercio Lleno. Trabajo sólo con el comercio y permisos de tu usuario.'
  if(!canReports(profile)&&/venta|factur|recaud|ticket promedio|m[aá]s vendido/.test(q))return'Tu usuario no tiene permiso para consultar reportes de ventas.'
  if(/producto.*m[aá]s vendido|m[aá]s vendido.*producto/.test(q)){const r:any=await executeTool(token,profile,'top_products',JSON.stringify({days,limit:10}));const p=r.top?.[0];return p?`El producto más vendido en los últimos ${days} días fue ${p.name}, con ${p.qty} unidades vendidas${p.revenue?` y ${peso(p.revenue)} de facturación asociada`:''}.`:`No encontré ventas de productos en los últimos ${days} días.`}
  if(/productos?.*(m[aá]s vendidos|ranking|top)/.test(q)){const r:any=await executeTool(token,profile,'top_products',JSON.stringify({days,limit:5}));return r.top?.length?`Más vendidos en los últimos ${days} días: ${r.top.map((p:any,i:number)=>`${i+1}. ${p.name} (${p.qty})`).join(' · ')}`:`No encontré ventas en ese período.`}
  if(/cu[aá]ntos?.*productos|cantidad.*productos/.test(q)){const r:any=await executeTool(token,profile,'product_count');return`Tenés ${r.count||0} productos activos cargados en Comercio Lleno.`}
  if(/stock bajo|reponer|faltan productos|sin stock/.test(q)){const r:any=await executeTool(token,profile,'low_stock',JSON.stringify({limit:20}));return r.count?`Tenés ${r.count} productos con stock bajo. Los primeros son: ${r.products.slice(0,10).map((p:any)=>`${p.name} (${p.stock})`).join(', ')}.`:'No hay productos por debajo de su stock mínimo.'}
  if(/pedido.*ia|lista.*compr|prioridad.*compr/.test(q)){const r:any=await executeTool(token,profile,'priority_order');return r.products?.length?`Prioridad de compra según demanda de 30 días y stock: ${r.products.map((p:any,i:number)=>`${i+1}. ${p.name}`).join(' · ')}`:'No hay suficiente información para armar una prioridad de compra todavía.'}
  if(/ventas?.*(hoy)|c[oó]mo vienen.*ventas/.test(q)){const today=new Intl.DateTimeFormat('en-CA',{timeZone:'America/Argentina/Buenos_Aires'}).format(new Date()),r:any=await executeTool(token,profile,'sales_on_date',JSON.stringify({date:today}));return`Hoy llevás ${r.operations||0} venta${r.operations===1?'':'s'} por ${peso(Number(r.total||0))}. Ticket promedio: ${peso(Number(r.average||0))}.`}
  if(/factur|vend[ií]|ventas|recaud|ticket promedio/.test(q)){const r:any=await executeTool(token,profile,'sales_summary',JSON.stringify({days}));return`En los últimos ${days} días registraste ${r.operations||0} ventas por ${peso(Number(r.total||0))}. Ticket promedio: ${peso(Number(r.average||0))}.`}
  return null
}

export async function POST(req:NextRequest){
  try{
    const token=(req.headers.get('authorization')||'').replace(/^Bearer\s+/i,'').trim();if(!token)throw new HttpError(401,'Iniciá sesión en Comercio Lleno para usar el asistente.')
    const profile=await authorize(token)
    const body=await req.json().catch(()=>({}))
    if(body?.action==='priority_order'){if(!canReports(profile))throw new HttpError(403,'Tu usuario no tiene permiso para consultar esta información.');const result:any=await executeTool(token,profile,'priority_order');return NextResponse.json({ok:true,products:result.products||[]})}
    const question=String(body?.message||'').trim().slice(0,2000);if(!question)return NextResponse.json({error:'Escribí una consulta.'},{status:400})

    const direct=await directAnswer(question,token,profile);if(direct)return NextResponse.json({ok:true,answer:direct,model:'direct-commerce-data'})
    const history=Array.isArray(body?.history)?body.history.slice(-8).map((m:any)=>({role:m?.role==='assistant'?'assistant':'user',content:String(m?.content||'').slice(0,1500)})):[]
    const messages:any[]=[{role:'system',content:`${manual}\nCOMERCIO: ${profile.company_name}\nROL: ${profile.role}\nPERMISOS: ${JSON.stringify(profile.permissions||{})}`},...history,{role:'user',content:question}]
    try{
      let out=await gateway(messages),response=out.message,selectedModel=out.model
      for(let round=0;round<3&&Array.isArray(response?.tool_calls)&&response.tool_calls.length;round++){messages.push(response);for(const call of response.tool_calls as ToolCall[]){const result=await executeTool(token,profile,call.function.name,call.function.arguments);messages.push({role:'tool',tool_call_id:call.id,content:JSON.stringify(result)})}out=await gateway(messages);response=out.message;selectedModel=out.model}
      const answer=String(response?.content||'').trim();if(answer)return NextResponse.json({ok:true,answer,model:selectedModel})
    }catch{}
    return NextResponse.json({ok:true,answer:'Puedo consultar ventas, facturación, productos, stock y ayudarte con el sistema, pero no pude interpretar esa consulta con precisión. Probá preguntarme, por ejemplo: “¿cuánto facturé los últimos 30 días?”, “¿cuál fue el producto más vendido?” o “¿qué productos tienen stock bajo?”.',model:'safe-fallback'})
  }catch(e){const status=e instanceof HttpError?e.status:500;return NextResponse.json({ok:false,error:e instanceof Error?e.message:String(e)},{status})}
}
