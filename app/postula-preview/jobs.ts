import {createClient} from '@supabase/supabase-js'
import {currentJobBoost} from './publicJobBoost'

export type PreviewJob={
  slug:string;title:string;company:string;location:string;mode:'Presencial'|'Híbrido'|'Remoto';schedule:string;area:string;source:string;sourceUrl:string;checkedAt:string;summary:string;requirements:string[];tags:string[];external:boolean;internalJobId?:string;compensation?:string;confidential?:boolean;logoUrl?:string
}

export const previewJobs:PreviewJob[]=[
  {slug:'despegar-agente-ventas-tortuguitas',title:'Agente de viajes (Ventas) - Tienda TOM',company:'Despegar',location:'Buenos Aires · Tortuguitas',mode:'Presencial',schedule:'Full time',area:'Ventas y Comercial',source:'Despegar Careers / Lever',sourceUrl:'https://jobs.lever.co/despegar/77bf31a4-721a-4e86-8ba4-3036e2036b78',checkedAt:'2026-08-19',summary:'Rol comercial para asesorar clientes por canales presenciales y remotos, preparar cotizaciones y vender experiencias de viaje.',requirements:['Experiencia comercial o de atención al cliente','Disponibilidad para turnos rotativos','Orientación a resultados y buena comunicación'],tags:['Ventas','Turismo','Atención al cliente'],external:true},
  {slug:'emi-customer-support',title:'Customer Support Representative',company:'Emi Labs',location:'Provincia de Buenos Aires',mode:'Híbrido',schedule:'6 horas',area:'Atención al cliente',source:'Emi Labs Careers / Lever',sourceUrl:'https://jobs.lever.co/emilabs/260adebe-02da-4a7d-927c-ada8c36c1899',checkedAt:'2026-08-19',summary:'Posición de soporte para resolver consultas, investigar incidentes y trabajar en conjunto con equipos de producto y tecnología.',requirements:['Estudios universitarios en curso','Disponibilidad de 15 a 21 h','Comunicación y resolución de problemas'],tags:['Soporte','Part time','Tecnología'],external:true},
  {slug:'emi-technical-project-manager',title:'Technical Project Manager',company:'Emi Labs',location:'Argentina · Buenos Aires',mode:'Remoto',schedule:'Full time',area:'Tecnología',source:'Emi Labs Careers / Lever',sourceUrl:'https://jobs.lever.co/emilabs/5bb2d94a-3ac5-46cd-84bc-5a1795f38264',checkedAt:'2026-08-19',summary:'Gestión end-to-end de implementaciones técnicas, coordinación de equipos y relación con clientes durante discovery, configuración, QA y go-live.',requirements:['3 a 5+ años en project management o implementación','Capacidad para traducir negocio a soluciones técnicas','Inglés upper-intermediate'],tags:['Project Management','SaaS','Remoto'],external:true},
  {slug:'emi-product-manager',title:'Product Manager',company:'Emi Labs',location:'Provincia de Buenos Aires',mode:'Híbrido',schedule:'Full time',area:'Producto y Diseño',source:'Emi Labs Careers / Lever',sourceUrl:'https://jobs.lever.co/emilabs/63ee35db-2cda-45fd-959f-a95b3d9d6403',checkedAt:'2026-08-19',summary:'Rol de producto para definir estrategia, requisitos y ejecución de iniciativas de software junto a ingeniería, data y equipos de cara al cliente.',requirements:['5+ años de Product Management','Experiencia con productos técnicos de software','Comunicación en español e inglés'],tags:['Producto','B2B SaaS','Tecnología'],external:true},
  {slug:'ey-junior-auditoria',title:'Junior para Auditoría Externa - Base de Talentos',company:'EY',location:'Buenos Aires · CABA',mode:'Híbrido',schedule:'Full time',area:'Administración y Finanzas',source:'EY Careers',sourceUrl:'https://careers.ey.com/ey/job/Buenos-Aires-EY-Junior-para-Auditor%C3%ADa-Externa-Base-de-Talentos-CABA-1002/1399547833/',checkedAt:'2026-08-19',summary:'Convocatoria junior para incorporarse a equipos de auditoría externa y desarrollarse dentro de una firma global de servicios profesionales.',requirements:['Interés en Auditoría y servicios profesionales','Perfil analítico y colaborativo','Disponibilidad para trabajar en Buenos Aires'],tags:['Junior','Auditoría','Primeros empleos'],external:true},
]

const brandingBucket='https://pejkycdttogpmmdntzuq.supabase.co/storage/v1/object/public/postula-branding/'
const brandDomains:Record<string,string>={
 'despegar':'https://www.despegar.com/favicon.ico',
 'ey':'https://www.ey.com/favicon.ico',
 'marriott international':'https://www.marriott.com/favicon.ico',
 'minor hotels europe & americas':'https://www.minorhotels.com/favicon.ico',
 'wyndham hotels & resorts':'https://www.wyndhamhotels.com/favicon.ico',
 'coca-cola femsa':'https://coca-colafemsa.com/favicon.ico',
 'cencosud':'https://www.cencosud.com/favicon.ico',
 'givaudan':'https://www.givaudan.com/favicon.ico',
 'emi labs':'https://www.emilabs.ai/favicon.ico'
}
function brandLogo(company:string){return brandDomains[company.trim().toLowerCase()]||''}
function normalizeMode(v:string):'Presencial'|'Híbrido'|'Remoto'{const s=v.toLowerCase();if(s.includes('remot'))return'Remoto';if(s.includes('híbr')||s.includes('hibr'))return'Híbrido';return'Presencial'}
async function nativeJobs():Promise<PreviewJob[]>{try{const db=createClient('https://pejkycdttogpmmdntzuq.supabase.co','sb_publishable_JmqxkVG1qNuCwWfqMeVgBg_-Nn32N2I',{auth:{persistSession:false,autoRefreshToken:false}});const {data,error}=await db.rpc('pm_public_job_catalog');if(error||!Array.isArray(data))return[];return data.map((r:any)=>({slug:`pm-${r.id}`,title:String(r.title),company:String(r.company_name),location:String(r.location_text||'Argentina'),mode:normalizeMode(String(r.work_mode||'')),schedule:String(r.schedule||'A confirmar'),area:String(r.area||'Otros rubros'),source:`Publicada en Postulá Mejor · ${r.employer_visibility==='confidential'?'identidad del empleador reservada':r.company_verification==='verified'?'empresa verificada':'validación básica'}`,sourceUrl:`/postular/pm-${r.id}`,checkedAt:new Date().toISOString().slice(0,10),summary:String(r.description||'').slice(0,1000),requirements:Array.isArray(r.requirements)?r.requirements.map(String):[],tags:[String(r.area||'Trabajo'),String(r.work_mode||''),r.employer_visibility==='confidential'?'Empleador reservado':''].filter(Boolean),external:false,internalJobId:String(r.id),compensation:String(r.compensation_text||''),confidential:r.employer_visibility==='confidential',logoUrl:r.company_logo_path?`${brandingBucket}${String(r.company_logo_path)}`:''}))}catch{return[]}}

export async function getJobCatalog(){
  const [{discoverPublicJobs},native]=await Promise.all([import('./publicJobSources'),nativeJobs()])
  const live=await discoverPublicJobs()
  const seen=new Set<string>()
  return [...native,...currentJobBoost,...live,...previewJobs].filter(job=>{const key=(job.internalJobId||job.sourceUrl).toLowerCase();if(seen.has(key))return false;seen.add(key);return true}).map(job=>({...job,logoUrl:job.confidential?'':job.logoUrl||brandLogo(job.company)}))
}

export function getPreviewJob(slug:string){const job=[...currentJobBoost,...previewJobs].find(job=>job.slug===slug);return job?{...job,logoUrl:job.logoUrl||brandLogo(job.company)}:undefined}
