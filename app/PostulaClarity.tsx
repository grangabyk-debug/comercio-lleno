'use client'

import {useEffect} from 'react'
import {usePathname} from 'next/navigation'

const companies=[
  {name:'Coca-Cola FEMSA',logo:'https://coca-colafemsa.com/favicon.ico'},
  {name:'Despegar',logo:'https://www.despegar.com/favicon.ico'},
  {name:'PedidosYa',logo:'https://www.pedidosya.com/favicon.ico'},
  {name:'EY',logo:'https://www.ey.com/favicon.ico'},
  {name:'Emi Labs',logo:'https://www.emilabs.ai/favicon.ico'},
  {name:'Cencosud',logo:'https://www.cencosud.com/favicon.ico'},
]

const css=`
.pm7-stories{display:none!important}
.pm44-company-strip{position:relative;z-index:5;margin-top:-76px;background:transparent;font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
.pm44-company-strip-inner{width:min(1180px,calc(100% - 36px));margin:0 auto;padding:17px 18px 14px;border:1px solid #ececf1;border-radius:24px;background:rgba(255,255,255,.97);box-shadow:0 22px 60px rgba(43,46,72,.09);display:grid;grid-template-columns:190px minmax(0,1fr) auto;gap:12px 20px;align-items:center}
.pm44-company-strip-copy span,.pm44-company-strip-copy b{display:block}.pm44-company-strip-copy span{color:#8b8f99;font-size:7px;font-weight:950;letter-spacing:.12em;text-transform:uppercase}.pm44-company-strip-copy b{margin-top:4px;color:#171820;font-size:11px;line-height:1.3}
.pm44-company-list{display:flex;align-items:center;justify-content:space-between;gap:10px;min-width:0;overflow-x:auto;scrollbar-width:none;padding:2px}.pm44-company-list::-webkit-scrollbar{display:none}
.pm44-company-item{flex:0 0 auto;min-width:112px;height:58px;padding:7px 10px;border:1px solid #e8eaee;border-radius:15px;background:#fff;display:flex;align-items:center;justify-content:center;gap:8px;text-decoration:none;color:#1b2028;transition:transform .18s ease,border-color .18s ease,box-shadow .18s ease}
.pm44-company-item:hover{transform:translateY(-2px);border-color:#d7dbe1;box-shadow:0 10px 24px rgba(30,42,53,.08)}
.pm44-company-logo{width:32px;height:32px;flex:0 0 32px;border-radius:10px;background:#fff;border:1px solid #edf0f2;display:grid;place-items:center;overflow:hidden}.pm44-company-logo img{width:23px;height:23px;object-fit:contain}.pm44-company-logo b{display:none;align-items:center;justify-content:center;width:100%;height:100%;font-size:8px;letter-spacing:.02em;color:#283743}.pm44-company-item>span{font-size:8px;font-weight:900;line-height:1.15;white-space:nowrap}
.pm44-company-more{font-size:8px;font-weight:900;color:#4a4f5b;text-decoration:none;white-space:nowrap}
.pm44-company-note{grid-column:1/-1;margin:0;padding-top:2px;border-top:1px solid #f0f1f4;color:#8a9099;font-size:7.5px;line-height:1.45}.pm44-company-note b{color:#69717c;font-weight:900}
@media(max-width:900px){.pm44-company-strip-inner{grid-template-columns:160px minmax(0,1fr);}.pm44-company-more{display:none}.pm44-company-list{justify-content:flex-start}.pm44-company-note{grid-column:1/-1}}
@media(max-width:760px){.pm44-company-strip{margin-top:-54px}.pm44-company-strip-inner{width:min(100% - 24px,620px);grid-template-columns:1fr;gap:10px;padding:14px 14px 12px;border-radius:20px}.pm44-company-strip-copy b{font-size:11px}.pm44-company-list{margin-right:-14px;padding-right:14px}.pm44-company-item{min-width:118px;height:54px;border-radius:14px}.pm44-company-note{grid-column:auto;font-size:7px}}
`

function initials(name:string){return name.split(/\s+/).filter(Boolean).slice(0,2).map(x=>x[0]).join('').toUpperCase()}

export default function PostulaClarity(){
  const pathname=usePathname()
  useEffect(()=>{
    const host=location.hostname.toLowerCase()
    if(host!=='postulamejor.com'&&host!=='www.postulamejor.com'&&!host.includes('vercel.app'))return
    const id='pm44-company-strip'
    document.getElementById(id)?.remove()

    let cancelled=false,tries=0
    const mount=()=>{
      if(cancelled)return
      const oldRail=document.querySelector('.pm7-stories')
      const hero=document.querySelector('.pm7-hero')
      if(!oldRail&&!hero){if(tries++<180)requestAnimationFrame(mount);return}
      if(!oldRail)return

      const section=document.createElement('section');section.id=id;section.className='pm44-company-strip';section.setAttribute('aria-label','Empresas con oportunidades visibles')
      const inner=document.createElement('div');inner.className='pm44-company-strip-inner'
      const copy=document.createElement('div');copy.className='pm44-company-strip-copy';copy.innerHTML='<span>EMPRESAS CON AVISOS</span><b>Oportunidades publicadas en nuestro catálogo</b>'
      const list=document.createElement('div');list.className='pm44-company-list'
      companies.forEach(company=>{
        const link=document.createElement('a');link.className='pm44-company-item';link.href='/empleos';link.title=`Ver oportunidades de ${company.name}`
        const logo=document.createElement('span');logo.className='pm44-company-logo'
        const img=document.createElement('img');img.src=company.logo;img.alt='';img.loading='lazy';img.referrerPolicy='no-referrer'
        const fallback=document.createElement('b');fallback.textContent=initials(company.name)
        img.addEventListener('error',()=>{img.style.display='none';fallback.style.display='flex'})
        logo.append(img,fallback)
        const name=document.createElement('span');name.textContent=company.name
        link.append(logo,name);list.appendChild(link)
      })
      const more=document.createElement('a');more.className='pm44-company-more';more.href='/empleos';more.textContent='Ver empleos →'
      const note=document.createElement('p');note.className='pm44-company-note';note.innerHTML='<b>Aclaración:</b> estas marcas aparecen porque existen avisos laborales públicos vinculados a ellas dentro del catálogo. Esto no implica relación comercial, representación, patrocinio, afiliación ni vínculo laboral con Postulá Mejor.'
      inner.append(copy,list,more,note);section.appendChild(inner)
      oldRail.replaceWith(section)
    }
    requestAnimationFrame(mount)
    return()=>{cancelled=true;document.getElementById(id)?.remove()}
  },[pathname])
  return <style id="pm44-company-strip-style">{css}</style>
}
