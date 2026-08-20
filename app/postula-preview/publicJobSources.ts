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

function slugify(value:string){return value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,92)}
function isArgentina(location:string){const l=location.toLowerCase();return ARGENTINA_HINTS.some(x=>l.includes(x))||(/latin america|latam/.test(l)&&/remote|remoto/.test(l))}
function inferMode(location:string,workplace=''){const t=`${location} ${workplace}`.toLowerCase();if(/remote|remoto/.test(t))return 'Remoto' as const;if(/hybrid|hibrid|híbrido/.test(t))return 'Híbrido' as const;return 'Presencial' as const}
function inferArea(title:string,team=''){const t=`${title} ${team}`.toLowerCase();if(/sales|venta|account executive|business development|commercial|outreach/.test(t))return 'Ventas y Comercial';if(/customer|support|soporte|atenci[oó]n|help desk/.test(t))return 'Atención al cliente';if(/marketing|growth|brand|content|media|seo|social/.test(t))return 'Marketing y Comunicación';if(/finance|finanzas|accounting|contab|audit|tax|tesorer|controller/.test(t))return 'Administración y Finanzas';if(/assistant|administrative|virtual assistant|data entry|office/.test(t))return 'Administración y Asistencia';if(/people|human|recruit|talent|hr\b|recursos humanos/.test(t))return 'Recursos Humanos';if(/product|producto|ux|design|diseñ|retoucher|imaging/.test(t))return 'Producto y Diseño';if(/engineer|developer|software|data|cloud|security|devops|qa\b|technical/.test(t))return 'Tecnología';if(/operation|operaci|supply|logistic|warehouse|almac[eé]n/.test(t))return 'Operaciones y Logística';if(/legal|compliance|abogad/.test(t))return 'Legal y Compliance';if(/travel|viajes|turismo|hotel|lodging/.test(t))return 'Turismo y Hotelería';if(/translation|linguistic|language|localization|interpret/.test(t))return 'Idiomas y Traducción';if(/health|medical|scribe|healthcare/.test(t))return 'Salud y Servicios';return 'Otros rubros'}
function prettySchedule(value=''){const v=value.trim();if(!v)return 'A confirmar';if(/part/i.test(v))return 'Part time';if(/intern/i.test(v))return 'Pasantía';if(/contract/i.test(v))return 'Contrato';return /full/i.test(v)?'Full time':v}
function neutralSummary(company:string,title:string,area:string){return `${company} publicó una oportunidad para ${title}. La clasificamos en ${area} para facilitar la búsqueda. Revisá requisitos, condiciones y vigencia en la fuente oficial antes de postularte.`}
function priority(job:PreviewJob){return /buenos aires|caba|capital federal/i.test(job.location)?3:/argentina/i.test(job.location)?2:job.mode==='Remoto'?1:0}
function uniqueText(values:Array<string|null|undefined>){const seen=new Set<string>();return values.map(v=>(v||'').trim()).filter(v=>{if(!v)return false;const key=v.toLocaleLowerCase('es');if(seen.has(key))return false;seen.add(key);return true})}

async function fetchLever(source:LeverSource):Promise<PreviewJob[]>{
  try{
    const params=new URLSearchParams({mode:'json'})
    source.locations.forEach(location=>params.append('location',location))
    const res=await fetch(`https://api.lever.co/v0/postings/${encodeURIComponent(source.site)}?${params.toString()}`,{next:{revalidate:21600}})
    if(!res.ok)return []
    const rows=await res.json() as LeverPosting[]
    return rows.filter(row=>{const loc=uniqueText([row.categories?.location,...(row.categories?.allLocations||[])]).join(' · ');return isArgentina(loc)}).map(row=>{
      const location=uniqueText([row.categories?.location,...(row.categories?.allLocations||[])]).join(' · ')||'Argentina'
      const area=inferArea(row.text,`${row.categories?.team||''} ${row.categories?.department||''}`)
      const sourceUrl=row.hostedUrl||row.applyUrl||`https://jobs.lever.co/${source.site}/${row.id}`
      return {slug:`lever-${slugify(source.company)}-${slugify(row.text)}-${row.id.slice(0,8)}`,title:row.text,company:source.company,location,mode:inferMode(location,row.workplaceType),schedule:prettySchedule(row.categories?.commitment),area,source:'Fuente oficial · Lever',sourceUrl,checkedAt:new Date().toISOString().slice(0,10),summary:neutralSummary(source.company,row.text,area),requirements:['Revisar requisitos completos en la publicación oficial','Confirmar modalidad, horario y ubicación antes de enviar','Validar que la búsqueda continúe abierta'],tags:uniqueText([area,row.categories?.team,row.categories?.commitment]),external:true}
    })
  }catch{return []}
}

async function fetchGreenhouse(board:string,company:string):Promise<PreviewJob[]>{
  try{
    const res=await fetch(`https://boards-api.greenhouse.io/v1/boards/${encodeURIComponent(board)}/jobs`,{next:{revalidate:21600}})
    if(!res.ok)return []
    const payload=await res.json() as {jobs?:GreenhousePosting[]}
    return (payload.jobs||[]).filter(row=>isArgentina(row.location?.name||'')).map(row=>{
      const location=row.location?.name||'Argentina'
      const team=(row.departments||[]).map(d=>d.name).join(' · ')
      const area=inferArea(row.title,team)
      return {slug:`gh-${slugify(company)}-${slugify(row.title)}-${row.id}`,title:row.title,company,location,mode:inferMode(location),schedule:'A confirmar',area,source:'Fuente oficial · Greenhouse',sourceUrl:row.absolute_url,checkedAt:new Date().toISOString().slice(0,10),summary:neutralSummary(company,row.title,area),requirements:['Revisar requisitos completos en la publicación oficial','Confirmar modalidad, horario y ubicación antes de enviar','Validar que la búsqueda continúe abierta'],tags:uniqueText([area,...(row.departments||[]).slice(0,2).map(d=>d.name)]),external:true}
    })
  }catch{return []}
}

function diversify(jobs:PreviewJob[]){
  const sorted=[...jobs].sort((a,b)=>priority(b)-priority(a))
  const buckets=new Map<string,PreviewJob[]>()
  for(const job of sorted){const key=`${job.area}::${job.company}`;const bucket=buckets.get(key)||[];bucket.push(job);buckets.set(key,bucket)}
  const keys=[...buckets.keys()].sort((a,b)=>{const [aa,ac]=a.split('::');const [ba,bc]=b.split('::');return aa.localeCompare(ba)||ac.localeCompare(bc)})
  const out:PreviewJob[]=[]
  let round=0
  while(out.length<140){let added=false;for(const key of keys){const bucket=buckets.get(key)||[];const item=bucket[round];if(item){out.push(item);added=true;if(out.length>=140)break}}if(!added)break;round++}
  return out
}

export async function discoverPublicJobs(){
  const settled=await Promise.allSettled([
    ...leverSources.map(fetchLever),
    ...greenhouseSources.map(s=>fetchGreenhouse(s.board,s.company)),
  ])
  const all=settled.flatMap(r=>r.status==='fulfilled'?r.value:[])
  const seen=new Set<string>()
  const unique=all.filter(job=>{const key=job.sourceUrl.toLowerCase();if(seen.has(key))return false;seen.add(key);return true})
  return diversify(unique)
}
