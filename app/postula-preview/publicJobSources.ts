import type {PreviewJob} from './jobs'

const ARGENTINA_HINTS=['argentina','buenos aires','caba','capital federal','rosario','cordoba','córdoba','mendoza','mar del plata','la plata','tucuman','tucumán','salta','neuquen','neuquén','santa fe','bariloche']

const leverSources=[
  {site:'despegar',company:'Despegar'},
  {site:'emilabs',company:'Emi Labs'},
  {site:'RyzLabs',company:'RYZ Labs'},
  {site:'getwingapp',company:'Wing Assistant'},
  {site:'celaralabs',company:'Celara'},
  {site:'aleph',company:'Aleph'},
  {site:'dlocal',company:'dLocal'},
  {site:'binance',company:'Binance'},
  {site:'handoff',company:'Handoff'},
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
function inferArea(title:string,team=''){const t=`${title} ${team}`.toLowerCase();if(/sales|venta|account executive|business development|commercial/.test(t))return 'Ventas y Comercial';if(/customer|support|soporte|atenci[oó]n/.test(t))return 'Atención al cliente';if(/marketing|growth|brand|content|media/.test(t))return 'Marketing y Comunicación';if(/finance|finanzas|accounting|contab|audit|tax|tesorer/.test(t))return 'Administración y Finanzas';if(/people|human|recruit|talent|hr\b|recursos humanos/.test(t))return 'Recursos Humanos';if(/product|producto|ux|design|diseñ/.test(t))return 'Producto y Diseño';if(/engineer|developer|software|data|cloud|security|devops|qa\b|technical/.test(t))return 'Tecnología';if(/operation|operaci|supply|logistic|warehouse|almac[eé]n/.test(t))return 'Operaciones y Logística';if(/legal|compliance|abogad/.test(t))return 'Legal y Compliance';if(/travel|viajes|turismo|hotel/.test(t))return 'Turismo y Hotelería';return 'Otros rubros'}
function prettySchedule(value=''){const v=value.trim();if(!v)return 'A confirmar';if(/part/i.test(v))return 'Part time';if(/intern/i.test(v))return 'Pasantía';if(/contract/i.test(v))return 'Contrato';return /full/i.test(v)?'Full time':v}
function neutralSummary(company:string,title:string,area:string){return `${company} publicó una oportunidad para ${title}. La clasificamos en ${area} para facilitar la búsqueda. Revisá requisitos, condiciones y vigencia en la fuente oficial antes de postularte.`}

async function fetchLever(site:string,company:string):Promise<PreviewJob[]>{
  try{
    const res=await fetch(`https://api.lever.co/v0/postings/${encodeURIComponent(site)}?mode=json`,{next:{revalidate:21600}})
    if(!res.ok)return []
    const rows=await res.json() as LeverPosting[]
    return rows.filter(row=>{const loc=[row.categories?.location,...(row.categories?.allLocations||[])].filter(Boolean).join(' · ');return isArgentina(loc)}).map(row=>{
      const location=[row.categories?.location,...(row.categories?.allLocations||[])].filter(Boolean).join(' · ')||'Argentina'
      const area=inferArea(row.text,`${row.categories?.team||''} ${row.categories?.department||''}`)
      const sourceUrl=row.hostedUrl||row.applyUrl||`https://jobs.lever.co/${site}/${row.id}`
      return {slug:`lever-${slugify(company)}-${slugify(row.text)}-${row.id.slice(0,8)}`,title:row.text,company,location,mode:inferMode(location,row.workplaceType),schedule:prettySchedule(row.categories?.commitment),area,source:'Fuente oficial · Lever',sourceUrl,checkedAt:new Date().toISOString().slice(0,10),summary:neutralSummary(company,row.text,area),requirements:['Revisar requisitos completos en la publicación oficial','Confirmar modalidad, horario y ubicación antes de enviar','Validar que la búsqueda continúe abierta'],tags:[area,row.categories?.team||'',row.categories?.commitment||''].filter(Boolean),external:true}
    })
  }catch{return []}
}

async function fetchGreenhouse(board:string,company:string):Promise<PreviewJob[]>{
  try{
    const res=await fetch(`https://boards-api.greenhouse.io/v1/boards/${encodeURIComponent(board)}/jobs?content=true`,{next:{revalidate:21600}})
    if(!res.ok)return []
    const payload=await res.json() as {jobs?:GreenhousePosting[]}
    return (payload.jobs||[]).filter(row=>{const loc=[row.location?.name,...(row.offices||[]).flatMap(o=>[o.name,o.location])].filter(Boolean).join(' · ');return isArgentina(loc)}).map(row=>{
      const location=[row.location?.name,...(row.offices||[]).flatMap(o=>[o.location])].filter(Boolean).join(' · ')||'Argentina'
      const team=(row.departments||[]).map(d=>d.name).join(' · ')
      const area=inferArea(row.title,team)
      return {slug:`gh-${slugify(company)}-${slugify(row.title)}-${row.id}`,title:row.title,company,location,mode:inferMode(location),schedule:'A confirmar',area,source:'Fuente oficial · Greenhouse',sourceUrl:row.absolute_url,checkedAt:new Date().toISOString().slice(0,10),summary:neutralSummary(company,row.title,area),requirements:['Revisar requisitos completos en la publicación oficial','Confirmar modalidad, horario y ubicación antes de enviar','Validar que la búsqueda continúe abierta'],tags:[area,...(row.departments||[]).slice(0,2).map(d=>d.name)].filter(Boolean),external:true}
    })
  }catch{return []}
}

function buenosAiresFirst(a:PreviewJob,b:PreviewJob){const score=(j:PreviewJob)=>/buenos aires|caba|capital federal/i.test(j.location)?3:/argentina/i.test(j.location)?2:j.mode==='Remoto'?1:0;return score(b)-score(a)||a.company.localeCompare(b.company)||a.title.localeCompare(b.title)}

export async function discoverPublicJobs(){
  const settled=await Promise.allSettled([
    ...leverSources.map(s=>fetchLever(s.site,s.company)),
    ...greenhouseSources.map(s=>fetchGreenhouse(s.board,s.company)),
  ])
  const all=settled.flatMap(r=>r.status==='fulfilled'?r.value:[])
  const seen=new Set<string>()
  return all.filter(job=>{const key=job.sourceUrl.toLowerCase();if(seen.has(key))return false;seen.add(key);return true}).sort(buenosAiresFirst).slice(0,140)
}
