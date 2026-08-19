import {NextRequest,NextResponse} from 'next/server'

const CV_API='https://pejkycdttogpmmdntzuq.supabase.co/functions/v1/cv-ai'
const FREE=new Set(['claro-ats','editorial-porteno','moderno-simple'])
const KNOWN=new Set(['claro-ats','editorial-porteno','moderno-simple','rail-pro','executive-pro','studio-pro','signature-pro','tech-grid-pro','compact-pro','creative-pro'])

function esc(v:unknown){return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]||m))}
async function paid(token:string){if(!token)return false;try{const r=await fetch(CV_API,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'status',token}),cache:'no-store'});const d=await r.json().catch(()=>null);const s=d?.session;if(!r.ok||!s)return false;const until=s.entitlement_until?new Date(s.entitlement_until).getTime():null;return Boolean((s.plan==='pro'||s.plan==='active')&&(!until||until>Date.now()))}catch{return false}}
function layoutCss(id:string,accent:string,font:string,radius:string,density:string,sidebar:string){const gap=density==='aire'?'1.35':density==='compacto'?'.8':'1';const round=radius==='recto'?'0':radius==='redondo'?'18px':'8px';const base=`body{font-family:${esc(font)},Arial,sans-serif;color:#17202a;margin:0;background:#fff;line-height:${gap};}*{box-sizing:border-box}.page{width:190mm;margin:0 auto;padding:16mm 17mm}.top{border-bottom:3px solid ${accent};padding-bottom:8mm;display:flex;justify-content:space-between;gap:14mm}.top h1{font-size:30pt;line-height:.95;letter-spacing:-1.5pt;margin:0}.top .headline{color:${accent};font-weight:700;margin-top:3mm}.contact{text-align:right;color:#65717b;font-size:9pt}.body{display:grid;grid-template-columns:1fr;gap:8mm}.side{display:none}.main h2{font-size:10pt;text-transform:uppercase;letter-spacing:1pt;color:${accent};margin:8mm 0 3mm}.main p,.main li{font-size:9.5pt}.chips span{display:inline-block;padding:2mm 3mm;margin:1mm;border-radius:${round};background:#f0f3f5;font-size:8pt}.role{display:flex;justify-content:space-between;gap:6mm}.role small{color:#7b8790}`
 if(id==='rail-pro'||id==='creative-pro')return base+`.body{grid-template-columns:48mm 1fr;margin-left:-17mm;margin-right:-17mm}.side{display:block;background:${sidebar==='claro'?'#f1f4f6':'#132436'};color:${sidebar==='claro'?'#26313b':'#fff'};padding:12mm 8mm;min-height:220mm}.main{padding-right:17mm}.top{padding-left:48mm}.side p{font-size:8.5pt}.side h2{font-size:9pt}`
 if(id==='executive-pro')return base+`.top{background:#f3f0e9;border:0;border-left:7px solid ${accent};padding:9mm}.top h1{font-family:Georgia,serif;font-weight:500}.main h2{color:#111;border-top:1px solid #bec6cc;padding-top:3mm}`
 if(id==='studio-pro')return base+`.page{background:linear-gradient(135deg,#fff 0 72%,#f3efff 72%)}.main h2{display:inline-block;color:#fff;background:${accent};padding:2mm 3mm;border-radius:${round}}`
 if(id==='signature-pro')return base+`.top{background:#101721;color:#fff;border:0;padding:12mm}.top h1{font-family:Georgia,serif;font-weight:500}.contact{color:#d7dde1}.main h2{color:#b66b23}`
 if(id==='tech-grid-pro')return base+`.page{background-image:linear-gradient(rgba(0,164,138,.045) 1px,transparent 1px),linear-gradient(90deg,rgba(0,164,138,.045) 1px,transparent 1px);background-size:8mm 8mm}.top{background:#071b20;color:#effffb}.contact{color:#b8d3ce}.main h2{font-family:monospace}`
 if(id==='compact-pro')return base+`.page{padding:11mm 14mm}.main h2{margin-top:5mm}.main p,.main li{font-size:8.5pt}`
 if(id==='editorial-porteno')return base+`.top{border:0}.top h1{font-family:Georgia,serif;font-weight:500}.main{padding:0 8mm}.main h2{font-family:Georgia,serif;text-transform:none;color:#1c2833;border-bottom:1px solid ${accent};padding-bottom:2mm}`
 if(id==='moderno-simple')return base+`.top{background:${accent};color:#fff;border:0;border-radius:${round};padding:9mm}.contact,.top .headline{color:#eaf0ff}.main h2{background:#eef2ff;padding:2mm 3mm;border-radius:${round};display:inline-block}`
 return base
}

export async function POST(req:NextRequest){
 const body=await req.json().catch(()=>({}))
 const id=String(body?.templateId||'')
 if(!KNOWN.has(id))return NextResponse.json({ok:false,error:'Plantilla inválida.'},{status:400})
 if(!FREE.has(id)&&!await paid(String(body?.token||'')))return NextResponse.json({ok:false,error:'Esta plantilla requiere un plan Pro+ activo.'},{status:403})
 const c=body?.content||{},o=body?.custom||{}
 const accent=/^#[0-9a-f]{6}$/i.test(String(o.accent||''))?String(o.accent):'#3157ff'
 const css=layoutCss(id,accent,String(o.font||'Inter'),String(o.radius||'suave'),String(o.density||'normal'),String(o.sidebar||'oscuro'))
 const skills=String(c.skills||'').split('·').filter(Boolean).slice(0,12)
 const html=`<!doctype html><html><head><meta charset="utf-8"><title>CV ${esc(c.name)}</title><style>${css}</style></head><body><div class="page"><header class="top"><div><h1>${esc(c.name)}</h1><div class="headline">${esc(c.headline)}</div></div><div class="contact">${esc(c.email)}<br>${esc(c.phone)}<br>${esc(c.location)}</div></header><div class="body"><aside class="side"><h2>Habilidades</h2><p>${skills.map(esc).join('<br>')}</p><h2>Contacto</h2><p>${esc(c.email)}<br>${esc(c.phone)}</p></aside><main class="main"><h2>Perfil</h2><p>${esc(c.summary)}</p><h2>Experiencia</h2><div class="role"><strong>${esc(c.role)}</strong><small>${esc(c.company)} · ${esc(c.period)}</small></div><ul><li>${esc(c.bullet1)}</li><li>${esc(c.bullet2)}</li></ul><h2>Habilidades</h2><div class="chips">${skills.map(x=>`<span>${esc(x.trim())}</span>`).join('')}</div><h2>Formación</h2><p>${esc(c.education)}</p></main></div></div></body></html>`
 return new NextResponse(html,{status:200,headers:{'Content-Type':'application/msword; charset=utf-8','Content-Disposition':`attachment; filename="cv-${id}.doc"`,'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}})
}
