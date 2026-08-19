import {NextRequest,NextResponse} from 'next/server'
import {getVercelOidcToken} from '@vercel/oidc'

const GATEWAY='https://ai-gateway.vercel.sh/v1/chat/completions'
const MODELS=['openai/gpt-5.4-nano','google/gemini-3.5-flash-lite','openai/gpt-5.4']

const demoCandidates=[
 {name:'Martina R.',match:94,role:'Vendedora · caja y atención',evidence:['3 años de retail','caja y POS','disponibilidad fines de semana'],open:['validar objetivos comerciales'],reference:'92% volvería a trabajar · 3 referencias verificadas'},
 {name:'Nicolás G.',match:87,role:'Atención al cliente · POS',evidence:['2 años de atención','manejo de POS','buena disponibilidad'],open:['confirmar sábados'],reference:'Sin señal suficiente todavía'},
 {name:'Camila P.',match:82,role:'Ventas · retail',evidence:['experiencia comercial','venta presencial'],open:['confirmar traslado'],reference:'96% volvería a trabajar · 2 referencias verificadas'},
 {name:'Lucas F.',match:78,role:'Comercial junior',evidence:['seguimiento de objetivos','buena comunicación'],open:['menor experiencia directa'],reference:'Sin señal suficiente todavía'},
]

const system=`Sos el asistente móvil de Postulá Mejor Empresas para un dueño o responsable que necesita contratar rápido desde el teléfono.
Respondé siempre en español rioplatense, breve, práctico y fácil de leer en una pantalla chica.
Trabajás sólo con el contexto de candidatos recibido en este prompt. Nunca inventes CV, experiencia, referencias ni datos personales.
Podés resumir, comparar evidencia relacionada con el puesto, preparar preguntas de entrevista y explicar por qué un candidato aparece arriba.
No tomes decisiones de contratación. No uses edad, género, foto, origen, salud, religión, orientación sexual, discapacidad ni ninguna característica sensible.
La señal de referencias laborales es información auxiliar y nunca debe usarse para descartar automáticamente. Si la mencionás, recordá que debe ser verificable, visible para la persona y apelable.
Si te preguntan 'a quién llamo primero', respondé con 2 o 3 opciones y razones concretas, dejando claro qué falta validar.
Máximo 140 palabras salvo que el usuario pida detalle.`

function fallback(message:string){const q=message.toLowerCase();if(/mejor|primero|llamo|entrevist/.test(q))return`Yo empezaría por Martina R. (94%) y después Nicolás G. (87%). Martina reúne caja, retail y disponibilidad; falta validar objetivos comerciales. Nicolás tiene atención y POS; falta confirmar sábados. Si querés, te preparo 3 preguntas para cada uno.`;if(/referencia|recomendar|cumpl|puntual/.test(q))return`La señal de referencias puede servir como contexto, pero no la usaría para descartar automáticamente. En esta demo, Martina tiene 92% “volvería a trabajar” con 3 referencias verificadas y Camila 96% con 2. La persona debería poder ver el dato y pedir revisión.`;if(/resumen|cu[aá]ntos|postul/.test(q))return`En esta búsqueda demo hay 186 postulaciones, 12 personas en shortlist y 4 listas para entrevista. Puedo ayudarte a reducir la shortlist, comparar candidatos o preparar preguntas.`;return`Puedo ayudarte con la shortlist, comparar perfiles, preparar entrevistas o resumir qué falta validar. Probá: “¿a quién llamo primero?” o “compará Martina y Nicolás”.`}

export async function POST(req:NextRequest){
  const body=await req.json().catch(()=>({}))
  const message=String(body?.message||'').trim().slice(0,1200)
  if(!message)return NextResponse.json({ok:false,error:'Escribí o dictá una pregunta.'},{status:400})
  let key=process.env.AI_GATEWAY_API_KEY||process.env.VERCEL_OIDC_TOKEN
  if(!key){try{key=await getVercelOidcToken()}catch{}}
  if(!key)return NextResponse.json({ok:true,answer:fallback(message),model:'preview-fallback'})
  const context=`Candidatos demo de la búsqueda Vendedor/a de salón:\n${demoCandidates.map(c=>`- ${c.name}: match orientativo ${c.match}%. Rol: ${c.role}. Evidencia: ${c.evidence.join(', ')}. Falta validar: ${c.open.join(', ')}. Referencias: ${c.reference}.`).join('\n')}`
  let last=''
  for(const model of MODELS){
    try{
      const r=await fetch(GATEWAY,{method:'POST',headers:{Authorization:`Bearer ${key}`,'Content-Type':'application/json'},body:JSON.stringify({model,messages:[{role:'system',content:system},{role:'system',content:context},{role:'user',content:message}],temperature:.18,max_tokens:320}),cache:'no-store'})
      const data=await r.json().catch(()=>({}))
      if(r.ok){const answer=String(data?.choices?.[0]?.message?.content||'').trim();if(answer)return NextResponse.json({ok:true,answer,model})}
      last=String(data?.error?.message||data?.error||`AI ${r.status}`)
    }catch(e){last=e instanceof Error?e.message:String(e)}
  }
  return NextResponse.json({ok:true,answer:fallback(message),model:'preview-fallback',note:last||undefined})
}
