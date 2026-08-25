import type {PreviewJob} from './jobs'

type LeverPosting={id:string;text:string;hostedUrl?:string;applyUrl?:string;categories?:{location?:string;commitment?:string;team?:string;department?:string;allLocations?:string[]};workplaceType?:string}
type GreenhousePosting={id:number;title:string;absolute_url:string;location?:{name?:string};departments?:{name:string}[]}
type LeverSource={site:string;company:string;locations:string[]}

const leverSources:LeverSource[]=[
 {site:'despegar',company:'Despegar',locations:['Buenos Aires']},
 {site:'emilabs',company:'Emi Labs',locations:['Buenos Aires','Provincia de Buenos Aires']},
 {site:'RyzLabs',company:'RYZ Labs',locations:['Buenos Aires','Argentina']},
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
 {site:'tryjeeves',company:'Jeeves',locations:['Argentina']},
 {site:'yuno',company:'Yuno',locations:['Buenos Aires','Argentina']},
 {site:'bluelightconsulting',company:'Bluelight Consulting',locations:['Buenos Aires Province, Argentina','Argentina']},
 {site:'redbee',company:'redbee',locations:['Buenos Aires','Argentina']},
]
const greenhouseSources=[
 ['monks','Monks'],
 ['hogarthworldwide','Hogarth Worldwide'],
 ['appsflyer','AppsFlyer'],
 ['santex','Santex'],
 ['oliverargentina','OLIVER Agency Argentina'],
 ['invgate','InvGate'],
 ['gympass','Wellhub'],
 ['sofitechsolutions','SoFi Tech Solutions'],
 ['growetalents','Growe Talents'],
 ['utt','UniTriTeam'],
] as const
const arHints=/argentina|buenos aires|caba|capital federal|cordoba|córdoba|rosario|mendoza|mar del plata|la plata|tucuman|tucumán|salta|neuquen|neuquén|santa fe|bariloche|pilar|tigre|san isidro|quilmes|avellaneda|vicente lopez|vicente lópez/i
function clean(v:string){return v.replace(/\s+/g,' ').replace(/\s*[\[(]?copy(?:\s*\d+)?[\])]?\s*$/i,'').trim()}
function slug(v:string){return clean(v).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,82)}
function mode(location:string,workplace=''):'Presencial'|'Híbrido'|'Remoto'{const v=`${location} ${workplace}`.toLowerCase();if(/remote|remoto/.test(v))return'Remoto';if(/hybrid|hibrid|híbrido/.test(v))return'Híbrido';return'Presencial'}
function schedule(v=''){if(/part[ -]?time/i.test(v))return'Part time';if(/full[ -]?time/i.test(v))return'Full time';if(/intern|pasant/i.test(v))return'Pasantía';if(/contract|consultant/i.test(v))return'Contrato';if(/freelance/i.test(v))return'Freelance';return'A confirmar'}
function area(title:string,team=''){const t=`${title} ${team}`.toLowerCase();if(/cocin|chef|barista|gastronom|camarer|mozo|pasteler|panader/.test(t))return'Gastronomía';if(/sales|venta|commercial|account executive|business development|store|retail/.test(t))return'Ventas y Comercial';if(/customer|support|soporte|atenci[oó]n|reception/.test(t))return'Atención al cliente';if(/warehouse|logistic|operation|operaci|supply|procurement|purchasing|almac[eé]n/.test(t))return'Operaciones y Logística';if(/administrative|assistant|office|secretar|data entry/.test(t))return'Administración y Asistencia';if(/finance|accounting|accountant|audit|tax|controller|contab/.test(t))return'Administración y Finanzas';if(/hotel|travel|tourism|turismo|viajes/.test(t))return'Turismo y Hotelería';if(/marketing|growth|brand|content|media|seo|social|copywriter/.test(t))return'Marketing y Comunicación';if(/recruit|talent|human resources|\bhr\b|people partner/.test(t))return'Recursos Humanos';if(/product|designer|design|\bux\b|\bui\b/.test(t))return'Producto y Diseño';if(/developer|software|engineer|data|cloud|security|devops|technical|technology|\bqa\b/.test(t))return'Tecnología';if(/legal|counsel|compliance|lawyer/.test(t))return'Legal y Compliance';if(/medical|health|patient|clinical/.test(t))return'Salud y Servicios';return'Otros rubros'}
function isAR(location:string){return arHints.test(location)||(/latin america|latam/i.test(location)&&/remote|remoto/i.test(location))}
function unique(values:(string|undefined)[]){return Array.from(new Set(values.map(x=>(x||'').trim()).filter(Boolean)))}
function summary(company:string,title:string,a:string){return `${company} mantiene publicada una oportunidad para ${title}. La mostramos dentro de ${a}; revisá condiciones, requisitos y vigencia en la fuente original antes de postularte.`}

async function lever(source:LeverSource):Promise<PreviewJob[]>{try{const params=new URLSearchParams({mode:'json'});source.locations.forEach(location=>params.append('location',location));const r=await fetch(`https://api.lever.co/v0/postings/${encodeURIComponent(source.site)}?${params.toString()}`,{next:{revalidate:21600}});if(!r.ok)return[];const rows=await r.json() as LeverPosting[];return rows.flatMap(row=>{const location=unique([row.categories?.location,...(row.categories?.allLocations||[])]).join(' · ')||'Argentina';if(!isAR(location))return[];const title=clean(row.text),a=area(title,`${row.categories?.team||''} ${row.categories?.department||''}`),sourceUrl=row.hostedUrl||row.applyUrl||`https://jobs.lever.co/${source.site}/${row.id}`;return[{slug:`overflow-lever-${slug(source.company)}-${slug(title)}-${row.id.slice(0,10)}`,title,company:source.company,location,mode:mode(location,row.workplaceType),schedule:schedule(row.categories?.commitment),area:a,source:'Fuente oficial · Lever',sourceUrl,checkedAt:new Date().toISOString().slice(0,10),summary:summary(source.company,title,a),requirements:['Revisar requisitos completos en la fuente original','Confirmar modalidad, horario y ubicación','Validar que la búsqueda continúe abierta'],tags:unique([a,row.categories?.team,row.categories?.department]),external:true}]})}catch{return[]}}
async function greenhouse(board:string,company:string):Promise<PreviewJob[]>{try{const r=await fetch(`https://boards-api.greenhouse.io/v1/boards/${encodeURIComponent(board)}/jobs`,{next:{revalidate:21600}});if(!r.ok)return[];const data=await r.json() as {jobs?:GreenhousePosting[]};return(data.jobs||[]).flatMap(row=>{const location=row.location?.name||'';if(!isAR(location))return[];const title=clean(row.title),team=(row.departments||[]).map(x=>x.name).join(' · '),a=area(title,team);return[{slug:`overflow-gh-${slug(company)}-${slug(title)}-${row.id}`,title,company,location:location||'Argentina',mode:mode(location),schedule:'A confirmar',area:a,source:'Fuente oficial · Greenhouse',sourceUrl:row.absolute_url,checkedAt:new Date().toISOString().slice(0,10),summary:summary(company,title,a),requirements:['Revisar requisitos completos en la fuente original','Confirmar modalidad, horario y ubicación','Validar que la búsqueda continúe abierta'],tags:unique([a,...(row.departments||[]).slice(0,2).map(x=>x.name)]),external:true}]})}catch{return[]}}

export async function discoverOverflowJobs(){const settled=await Promise.allSettled([...leverSources.map(lever),...greenhouseSources.map(([board,company])=>greenhouse(board,company))]);const seen=new Set<string>();return settled.flatMap(x=>x.status==='fulfilled'?x.value:[]).filter(job=>{const key=job.sourceUrl.toLowerCase();if(seen.has(key))return false;seen.add(key);return true}).slice(0,500)}
