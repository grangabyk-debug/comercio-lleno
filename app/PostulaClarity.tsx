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
.pm44-company-strip{position:relative;z-index:4;background:#fff;border-top:1px solid rgba(21,31,42,.06);border-bottom:1px solid rgba(21,31,42,.08);font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
.pm44-company-strip-inner{width:min(1180px,calc(100% - 36px));margin:0 auto;padding:17px 0 15px;display:grid;grid-template-columns:auto minmax(0,1fr);gap:14px 28px;align-items:center}
.pm44-company-strip-copy{min-width:185px}.pm44-company-strip-copy span{display:block;color:#7c8893;font-size:9px;font-weight:950;letter-spacing:.12em;text-transform:uppercase;margin-bottom:3px}.pm44-company-strip-copy b{display:block;color:#17232d;font-size:13px;line-height:1.25;letter-spacing:-.01em}
.pm44-company-list{display:flex;align-items:center;gap:9px;min-width:0;overflow-x:auto;scrollbar-width:none;padding:2px 1px}.pm44-company-list::-webkit-scrollbar{display:none}
.pm44-company-item{flex:0 0 auto;min-width:132px;height:54px;padding:0 13px;border:1px solid #e7eaed;border-radius:15px;background:linear-gradient(145deg,#fff,#fafbfc);display:flex;align-items:center;gap:10px;text-decoration:none;color:#1b2832;box-shadow:0 7px 18px rgba(30,42,53,.035);transition:transform .18s ease,border-color .18s ease,box-shadow .18s ease}
.pm44-company-item:hover{transform:translateY(-2px);border-color:#d7dde2;box-shadow:0 11px 25px rgba(30,42,53,.075)}
.pm44-company-logo{width:30px;height:30px;flex:0 0 30px;border-radius:9px;background:#fff;border:1px solid #edf0f2;display:grid;place-items:center;overflow:hidden}.pm44-company-logo img{width:22px;height:22px;object-fit:contain}.pm44-company-logo b{display:none;font-size:9px;letter-spacing:.02em;color:#283743}.pm44-company-item>span{font-size:11px;font-weight:850;white-space:nowrap}
.pm44-company-note{grid-column:1/-1;margin:-2px 0 0;color:#87919a;font-size:9.5px;line-height:1.45}.pm44-company-note b{color:#697681;font-weight:850}
@media(max-width:760px){.pm44-company-strip-inner{width:min(100% - 24px,620px);grid-template-columns:1fr;gap:10px;padding:14px 0 13px}.pm44-company-strip-copy{min-width:0}.pm44-company-strip-copy b{font-size:12px}.pm44-company-list{margin-right:-12px;padding-right:12px}.pm44-company-item{min-width:124px;height:50px;border-radius:14px}.pm44-company-note{grid-column:auto;font-size:9px}}
`

function initials(name:string){return name.split(/\s+/).filter(Boolean).slice(0,2).map(x=>x[0]).join('').toUpperCase()}

export default function PostulaClarity(){
  const pathname=usePathname()
  useEffect(()=>{
    const host=location.hostname.toLowerCase()
    if(host!=='postulamejor.com'&&host!=='www.postulamejor.com'&&!host.includes('vercel.app'))return
    const id='pm44-company-strip'
    document.getElementById(id)?.remove()
    if(pathname!=='/')return

    let cancelled=false,tries=0
    const mount=()=>{
      if(cancelled)return
      const hero=document.querySelector('.pm7-hero')
      if(!hero){if(tries++<120)requestAnimationFrame(mount);return}
      if(document.getElementById(id))return

      if(!document.getElementById('pm44-company-strip-style')){
        const style=document.createElement('style');style.id='pm44-company-strip-style';style.textContent=css;document.head.appendChild(style)
      }
      const section=document.createElement('section');section.id=id;section.className='pm44-company-strip';section.setAttribute('aria-label','Empresas con oportunidades visibles')
      const inner=document.createElement('div');inner.className='pm44-company-strip-inner'
      const copy=document.createElement('div');copy.className='pm44-company-strip-copy';copy.innerHTML='<span>OPORTUNIDADES EN EL CATÁLOGO</span><b>Empresas que aparecen en avisos revisados</b>'
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
      const note=document.createElement('p');note.className='pm44-company-note';note.innerHTML='<b>Aclaración:</b> las marcas se muestran porque existen avisos laborales públicos vinculados a ellas dentro del catálogo. Esto no implica relación comercial, representación, patrocinio ni afiliación con Postulá Mejor.'
      inner.append(copy,list,note);section.appendChild(inner);hero.insertAdjacentElement('afterend',section)
    }
    requestAnimationFrame(mount)
    return()=>{cancelled=true;document.getElementById(id)?.remove()}
  },[pathname])
  return null
}
