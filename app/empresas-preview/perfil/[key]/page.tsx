import Link from 'next/link'
import {notFound} from 'next/navigation'
import styles from '../../../postula-preview/platform.module.css'
import {PlatformHeader,PlatformFooter,MobileNav} from '../../../postula-preview/PlatformChrome'
import {getJobCatalog} from '../../../postula-preview/jobs'
import {getPublicCompanyById,publicCompanyLogo,publicCompanyNameKey} from '../../../postula-preview/publicCompany'
import '../../../postula-preview/premium-v5.css'
import '../../../postula-preview/premium-v6.css'
import '../../../postula-preview/premium-v7.css'
import '../../../postula-preview/inner-v5.css'
import '../../company-public-v43.css'

export const revalidate=300
export const dynamicParams=true

async function resolveCompany(key:string){
 const jobs=await getJobCatalog()
 const profile=await getPublicCompanyById(key)
 if(profile){const related=jobs.filter(j=>!j.confidential&&j.company.trim().toLowerCase()===profile.name.trim().toLowerCase());return{profile,name:profile.name,logo:publicCompanyLogo(profile)||related[0]?.logoUrl||'',jobs:related,external:false}}
 if(!key.startsWith('nombre-'))return null
 const related=jobs.filter(j=>!j.confidential&&publicCompanyNameKey(j.company)===key)
 if(!related.length)return null
 return{profile:null,name:related[0].company,logo:related[0].logoUrl||'',jobs:related,external:true}
}

export async function generateMetadata({params}:{params:Promise<{key:string}>}){
 const {key}=await params;const company=await resolveCompany(key)
 if(!company)return{title:{absolute:'Empresa | Postulá Mejor'},robots:{index:false,follow:true}}
 return{title:{absolute:`${company.name} | Empleos en Postulá Mejor`},description:`Conocé la información pública de ${company.name} y revisá sus oportunidades laborales activas.`,alternates:{canonical:`https://postulamejor.com/empresas/perfil/${key}`},robots:{index:true,follow:true}}
}

export default async function PublicCompanyPage({params}:{params:Promise<{key:string}>}){
 const {key}=await params;const company=await resolveCompany(key);if(!company)notFound()
 const p=company.profile,location=[p?.city,p?.province].filter(Boolean).join(' · ')
 return <main className={`${styles.page} pm7-page pm43-company-page`}>
  <PlatformHeader/>
  <section className="pm43-company-hero"><div className="pm43-company-hero-inner"><div className="pm43-company-logo">{company.logo?<img src={company.logo} alt=""/>:<span>{company.name.slice(0,2).toUpperCase()}</span>}</div><div className="pm43-company-title"><span>{p?.verification_status==='verified'?'EMPRESA VERIFICADA':p?'EMPRESA CON VALIDACIÓN BÁSICA':'PERFIL DE EMPRESA'}</span><h1>{company.name}</h1><p>{p?.description||`Explorá las oportunidades laborales que encontramos activas para ${company.name}.`}</p><div>{p?.industry&&<b>{p.industry}</b>}{location&&<b>{location}</b>}<b>{company.jobs.length} {company.jobs.length===1?'oportunidad activa':'oportunidades activas'}</b></div></div></div></section>
  <section className="pm43-company-content"><aside className="pm43-company-about"><span>INFORMACIÓN PÚBLICA</span><h2>Sobre la empresa</h2>{p?<><dl>{p.industry&&<><dt>Rubro</dt><dd>{p.industry}</dd></>}{location&&<><dt>Ubicación</dt><dd>{location}</dd></>}<dt>Validación</dt><dd>{p.verification_status==='verified'?'Empresa verificada':'Validación básica completada'}</dd></dl>{p.website&&<a href={/^https?:\/\//i.test(p.website)?p.website:`https://${p.website}`} target="_blank" rel="noopener noreferrer">Sitio web de la empresa ↗</a>}<small>Mostramos únicamente datos que la empresa puede hacer públicos. Datos fiscales, teléfonos privados y accesos de cuenta no se exponen.</small></>:<><p>Esta empresa aparece porque tiene oportunidades revisadas en el catálogo público. Cuando la empresa publica directamente en Postulá Mejor, su perfil puede incluir información adicional validada.</p><small>Las ofertas externas conservan su fuente original y pueden cambiar o cerrar en el sitio de origen.</small></>}</aside><div className="pm43-company-jobs"><div className="pm43-company-jobs-head"><div><span>OPORTUNIDADES</span><h2>Trabajos publicados por {company.name}</h2></div><Link href="/empleos">Ver todos los empleos</Link></div>{company.jobs.length?<div className="pm43-company-job-grid">{company.jobs.map(job=><Link href={`/empleos/${job.slug}`} key={job.slug}><div className="pm43-company-job-top"><small>{job.area}</small><i>{job.external?'FUENTE EXTERNA':'EN POSTULÁ MEJOR'}</i></div><h3>{job.title}</h3><p>{job.summary}</p><div><span>{job.location}</span><span>{job.mode}</span><span>{job.schedule}</span></div><b>Ver oportunidad →</b></Link>)}</div>:<div className="pm43-company-nojobs">Esta empresa no tiene búsquedas activas en este momento.</div>}</div></section>
  <PlatformFooter/><MobileNav active="empleos"/>
 </main>
}
