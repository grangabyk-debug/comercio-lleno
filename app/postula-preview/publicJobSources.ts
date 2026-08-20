import type {PreviewJob} from './jobs'

const ARGENTINA_HINTS=['argentina','buenos aires','caba','capital federal','rosario','cordoba','córdoba','mendoza','mar del plata','la plata','tucuman','tucumán','salta','neuquen','neuquén','santa fe','bariloche']

type LeverSource={site:string;company:string;locations:string[]}
const leverSources:LeverSource[]=[
  {site:'despegar',company:'Despegar',locations:['Buenos Aires']},
  {site:'emilabs',company:'Emi Labs',locations:['Buenos Aires','Provincia de Buenos Aires']},
  {site:'RyzLabs',company:'RYZ Labs',locations:['Buenos Aires']},
  {site:'getwingapp',company:'Wing Assistant',locations:['Argentina','Buenos Aires']},
  {site:'assist-world',company:'Assist World',locations:['Argentina']},
  {site:'1840&Company',company:'1840 & Company',locations:['Buenos Aires, Buenos Aires','Argentina']},
  {site:'weloglobal',company:'Welo Global',locations:['Argentina']},
  {site:'eleks',company:'ELEKS',locations:['Argentina']},
  {site:'celaralabs',company:'Celara',locations:['Buenos Aires']},
  {site:'aleph',company:'Aleph',locations:['Buenos Aires, Argentina']},
  {site:'dlocal',company:'dLocal',locations:['Buenos Aires']},
  {site:'binance',company:'Binance',locations:['Argentina, Buenos Aires']},
  {site:'handoff',company:'Handoff',locations:['Buenos Aires']},
]

const greenhouseSources=[
  {board:'monks',company:'Monks'},
  {board:'hogarthworldwide',company:'Hogarth Worldwide'},
  {board:'appsflyer',company:'AppsFlyer'},
]

type LeverPosting={id:string;text:string;hostedUrl?:string;applyUrl?:string;categories?:{location?:string;commitment?:string;team?:string;department?:string;allLocations?:string[]};workplaceType?:string;createdAt?:number}
type GreenhousePosting={id:number;title:string;updated_at?:string;absolute_url:string;location?:{name?:string};departments?:{name:string}[];offices?:{name?:string;location?:string}[]}

function cleanTitle(value:string){return value.replace(/\s+/g,' ').replace(/\s*[\[(]?copy(?:\s*\d+)?[\])]?\s*$/i,'').trim()}
function slugify(value:string){return cleanTitle(value).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,92)}
function isArgentina(location:string){const l=location.toLowerCase();return ARGENTINA_HINTS.some(x=>l.includes(x))||(/latin america|latam/.test(l)&&/remote|remoto/.test(l))}
function inferMode(location:string,workplace=''){const t=`${location} ${workplace}`.toLowerCase();if(/remote|remoto/.test(t))return 'Remoto' as const;if(/hybrid|hibrid|híbrido/.test(t))return 'Híbrido' as const;return 'Presencial' as const}
function cleanLocation(value:string){
  const raw=value.replace(/\s+/g,' ').trim()
  const parts=raw.split('·').map(x=>x.trim()).filter(Boolean)
  if(parts.length<=3)return raw
  const ba=parts.find(x=>/buenos aires|caba|capital federal/i.test(x))
  const ar=parts.find(x=>/^argentina$/i.test(x)||/argentina[, ]/i.test(x))
  const anchor=ba||ar
  return anchor?`${anchor} · otras ubicaciones disponibles`:raw
}
function inferArea(title:string,team=''){
  const name=cleanTitle(title).toLowerCase()
  const context=`${name} ${team}`.toLowerCase()
  if(/patient coordinator|patient support|patient care|medical practice|medical assistant/.test(name))return 'Salud y Servicios'
  if(/non-linguistic quality control/.test(name))return 'Otros rubros'
  if(/linguist|translation|translator|localization|language specialist|interpret|idioma/.test(name)&&!/non-linguistic/.test(name))return 'Idiomas y Traducción'
  if(/compliance|legal|counsel|lawyer|abogad/.test(name))return 'Legal y Compliance'
  if(/finance|financial|accounting|accountant|contab|audit|tax|tesorer|controller/.test(name))return 'Administración y Finanzas'
  if(/test manager|quality assurance|visual quality|software quality|\bqa\b/.test(name))return 'Tecnología'
  if(/technology talent pool|technolog|engineer|developer|software|data engineer|data scientist|cloud|security|devops|technical|machine learning|\bai\b|artificial intelligence/.test(name))return 'Tecnología'
  if(/product owner|product manager|product designer|product lead|\bproduct\b|\bux\b|\bui\b|designer|diseñ|retoucher|imaging|art director|creative director|3d generalist/.test(name))return 'Producto y Diseño'
  if(/key account|account specialist|sales|venta|account executive|business development|commercial|outreach|cold caller|appointment setter|closer/.test(name))return 'Ventas y Comercial'
  if(/customer|support|soporte|atenci[oó]n|help desk|customer success|receptionist/.test(name))return 'Atención al cliente'
  if(/marketing|growth|brand|content|media|seo|social|copywriter|ads quality|community manager|paid social|traffic coordinator|digital asset/.test(name))return 'Marketing y Comunicación'
  if(/purchasing|procurement|buyer|supply|logistic|warehouse|almac[eé]n|operation|operaci/.test(name))return 'Operaciones y Logística'
  if(/assistant|administrative|virtual assistant|data entry|office|secretar/.test(name))return 'Administración y Asistencia'
  if(/recruit|recruiter|talent acquisition|people partner|human resources|\bhr\b|recursos humanos/.test(name))return 'Recursos Humanos'
  if(/travel|viajes|turismo|hotel|lodging/.test(name))return 'Turismo y Hotelería'
  if(/health|medical|scribe|healthcare/.test(name))return 'Salud y Servicios'
  if(/compliance|legal|counsel|abogad/.test(context))return 'Legal y Compliance'
  if(/finance|accounting|audit|tax|tesorer|controller/.test(context))return 'Administración y Finanzas'
  if(/test|quality assurance|engineer|developer|software|cloud|security|devops|\bqa\b|technical|technology/.test(context))return 'Tecnología'
  if(/sales|venta|account executive|business development|commercial|outreach|key account/.test(context))return 'Ventas y Comercial'
  if(/customer|support|soporte|atenci[oó]n|help desk/.test(context))return 'Atención al cliente'
  if(/marketing|growth|brand|content|media|seo|social/.test(context))return 'Marketing y Comunicación'
  if(/people|human|recruit|talent acquisition|\bhr\b|recursos humanos/.test(context))return 'Recursos Humanos'
  if(/product|producto|ux|design|diseñ|retoucher|imaging|art director/.test(context))return 'Producto y Diseño'
  if(/operation|operaci|supply|logistic|warehouse|almac[eé]n|purchasing|procurement/.test(context))return 'Operaciones y Logística'
  if(/translation|linguistic|language|localization|interpret/.test(context)&&!/non-linguistic/.test(context))return 'Idiomas y Traducción'
  if(/travel|viajes|turismo|hotel|lodging/.test(context))return 'Turismo y Hotelería'
  if(/health|medical|scribe|healthcare|patient/.test(context))return 'Salud y Servicios'
  return 'Otros rubros'
}
function prettySchedule(value=''){
  const v=value.trim()
  if(!v)return 'A confirmar'
  if(/part[ -]?time/i.test(v))return 'Part time'
  if(/full[ -]?time/i.test(v))return 'Full time'
  if(/intern|pasant/i.test(v))return 'Pasantía'
  if(/contract|consultant/i.test(v))return 'Contrato'
  if(/freelance/i.test(v))return 'Freelance'
  return 'A confirmar'
}
function neutralSummary(company:string,title:string,area:string){return `${company} publicó una oportunidad para ${title}. La clasificamos en ${area} para facilitar la búsqueda. Revisá requisitos, condiciones y vigencia en la fuente oficial antes de postularte.`}
function priority(job:PreviewJob){return /buenos aires|caba|capital federal/i.test(job.location)?3:/argentina/i.test(job.location)?2:job.mode==='Remoto'?1:0}
function uniqueText(values:Array<string|null|undefined>){const seen=new Set<string>();return values.map(v=>(v||'').trim()).filter(v=>{if(!v)return false;const key=v.toLocaleLowerCase('es');if(seen.has(key))return false;seen.add(key);return true})}
function duplicateKey(job:PreviewJob){return [job.company,job.title,job.location,job.mode,job.schedule].map(slugify).join('|')}
function argentinaPlace(location:string){const l=location.toLowerCase();if(/buenos aires|caba|capital federal/.test(l))return 'buenos-aires';if(/argentina/.test(l))return 'argentina';return slugify(location)}
function rolePlaceKey(job:PreviewJob){return [job.company,job.title,job.mode,argentinaPlace(job.location)].map(slugify).join('|')}
function foreignBasedMismatch(title:string,location:string){
  const t=title.toLowerCase(),l=location.toLowerCase()
  if(!/argentina|buenos aires|caba|capital federal/.test(l))return false
  return /(chile|mexico|méxico|colombia|brazil|brasil|peru|perú|uruguay)[ -]based/.test(t)||/based in (chile|mexico|méxico|colombia|brazil|brasil|peru|perú|uruguay)/.test(t)
}

async function fetchLever(source:LeverSource):Promise<PreviewJob[]>{
  try{
    const params=new URLSearchParams({mode:'json'})
    source.locations.forEach(location=>params.append('location',location))
    const res=await fetch(`https://api.lever.co/v0/postings/${encodeURIComponent(source.site)}?${params.toString()}`,{next:{revalidate:21600}})
    if(!res.ok)return []
    const rows=await res.json() as LeverPosting[]
    return rows.filter(row=>{const loc=uniqueText([row.categories?.location,...(row.categories?.allLocations||[])]).join(' · ');return isArgentina(loc)&&!foreignBasedMismatch(row.text,loc)}).map(row=>{
      const rawLocation=uniqueText([row.categories?.location,...(row.categories?.allLocations||[])]).join(' · ')||'Argentina'
      const title=cleanTitle(row.text)
      const area=inferArea(title,`${row.categories?.team||''} ${row.categories?.department||''}`)
      const sourceUrl=row.hostedUrl||row.applyUrl||`https://jobs.lever.co/${source.site}/${row.id}`
      const schedule=prettySchedule(row.categories?.commitment)
      return {slug:`lever-${slugify(source.company)}-${slugify(title)}-${row.id.slice(0,8)}`,title,company:source.company,location:cleanLocation(rawLocation),mode:inferMode(rawLocation,row.workplaceType),schedule,area,source:'Fuente oficial · Lever',sourceUrl,checkedAt:new Date().toISOString().slice(0,10),summary:neutralSummary(source.company,title,area),requirements:['Revisar requisitos completos en la publicación oficial','Confirmar modalidad, horario y ubicación antes de enviar','Validar que la búsqueda continúe abierta'],tags:uniqueText([area,row.categories?.team,schedule==='A confirmar'?'':schedule]),external:true}
    })
  }catch{return []}
}

async function fetchGreenhouse(board:string,company:string):Promise<PreviewJob[]>{
  try{
    const res=await fetch(`https://boards-api.greenhouse.io/v1/boards/${encodeURIComponent(board)}/jobs`,{next:{revalidate:21600}})
    if(!res.ok)return []
    const payload=await res.json() as {jobs?:GreenhousePosting[]}
    return (payload.jobs||[]).filter(row=>isArgentina(row.location?.name||'')&&!foreignBasedMismatch(row.title,row.location?.name||'')).map(row=>{
      const rawLocation=row.location?.name||'Argentina'
      const title=cleanTitle(row.title)
      const team=(row.departments||[]).map(d=>d.name).join(' · ')
      const area=inferArea(title,team)
      return {slug:`gh-${slugify(company)}-${slugify(title)}-${row.id}`,title,company,location:cleanLocation(rawLocation),mode:inferMode(rawLocation),schedule:'A confirmar',area,source:'Fuente oficial · Greenhouse',sourceUrl:row.absolute_url,checkedAt:new Date().toISOString().slice(0,10),summary:neutralSummary(company,title,area),requirements:['Revisar requisitos completos en la publicación oficial','Confirmar modalidad, horario y ubicación antes de enviar','Validar que la búsqueda continúe abierta'],tags:uniqueText([area,...(row.departments||[]).slice(0,2).map(d=>d.name)]),external:true}
    })
  }catch{return []}
}

function diversify(jobs:PreviewJob[]){
  const sorted=[...jobs].sort((a,b)=>priority(b)-priority(a)||a.company.localeCompare(b.company)||a.title.localeCompare(b.title))
  const byArea=new Map<string,PreviewJob[]>()
  for(const job of sorted){const bucket=byArea.get(job.area)||[];bucket.push(job);byArea.set(job.area,bucket)}
  const areas=[...byArea.keys()].sort((a,b)=>a.localeCompare(b))
  const out:PreviewJob[]=[]
  const companyCounts=new Map<string,number>()
  let round=0
  while(out.length<140){
    let added=false
    for(const area of areas){
      const bucket=byArea.get(area)||[]
      let picked:PreviewJob|undefined
      for(let i=round;i<bucket.length;i++){
        const candidate=bucket[i]
        const count=companyCounts.get(candidate.company)||0
        if(count<3){picked=candidate;bucket.splice(i,1);break}
      }
      if(!picked&&bucket.length)picked=bucket.shift()
      if(picked){out.push(picked);companyCounts.set(picked.company,(companyCounts.get(picked.company)||0)+1);added=true;if(out.length>=140)break}
    }
    if(!added)break
    round=0
  }
  return out
}

export async function discoverPublicJobs(){
  const settled=await Promise.allSettled([
    ...leverSources.map(fetchLever),
    ...greenhouseSources.map(s=>fetchGreenhouse(s.board,s.company)),
  ])
  const all=settled.flatMap(r=>r.status==='fulfilled'?r.value:[])
  const urls=new Set<string>()
  const semantic=new Set<string>()
  const roles=new Set<string>()
  const unique=all.filter(job=>{
    const url=job.sourceUrl.toLowerCase()
    const exact=duplicateKey(job)
    const role=rolePlaceKey(job)
    if(urls.has(url)||semantic.has(exact)||roles.has(role))return false
    urls.add(url);semantic.add(exact);roles.add(role);return true
  })
  return diversify(unique)
}
