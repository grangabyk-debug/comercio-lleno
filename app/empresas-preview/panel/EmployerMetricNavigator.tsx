'use client'

import {useEffect} from 'react'
import {cvAuthClient} from '../../cv-ia/cvAuth'

type AppRow={id:string;status:string}
const css=`
.pmed-metrics article[data-pm-metric-link="1"]{cursor:pointer;transition:transform .16s ease,box-shadow .16s ease,border-color .16s ease}.pmed-metrics article[data-pm-metric-link="1"]:hover,.pmed-metrics article[data-pm-metric-link="1"]:focus-visible{transform:translateY(-2px);border-color:#b8dc38;box-shadow:0 12px 28px rgba(22,36,48,.09);outline:none}.pmed-mobile-filter-note{display:flex;align-items:center;justify-content:space-between;gap:10px;margin:10px 0 12px;padding:10px 12px;border-radius:12px;background:#eff5f8;font-size:12px;color:#536575}.pmed-mobile-filter-note button{border:0;background:#12202a;color:#fff;border-radius:9px;padding:7px 10px;font-weight:800;cursor:pointer}
@media(min-width:901px){.pmed-mobile-filter-note{display:none}}
`

export default function EmployerMetricNavigator(){
 useEffect(()=>{
  let companyId='',apps:AppRow[]=[]
  let observer:MutationObserver|null=null
  const refresh=async()=>{
   const {data}=await cvAuthClient().auth.getSession();if(!data.session)return
   const headers={Authorization:`Bearer ${data.session.access_token}`}
   if(!companyId){const cr=await fetch('/api/postula/company',{headers,cache:'no-store'}),cd=await cr.json().catch(()=>({}));companyId=String(cd?.memberships?.[0]?.company_id||'')}
   if(!companyId)return
   const ar=await fetch(`/api/postula/applications?company=${encodeURIComponent(companyId)}`,{headers,cache:'no-store'}),ad=await ar.json().catch(()=>({}));apps=(ad?.applications||[]).map((x:any)=>({id:String(x.id),status:String(x.status||'')}))
  }
  const scrollTo=(selector:string)=>window.setTimeout(()=>document.querySelector(selector)?.scrollIntoView({behavior:'smooth',block:'start'}),40)
  const setFilter=async(filter:'all'|'shortlist'|'interview')=>{
   await refresh()
   const list=document.querySelector<HTMLElement>('.pmed-candidate-list');if(!list)return
   const buttons=Array.from(list.querySelectorAll<HTMLElement>(':scope > button'))
   let firstVisible:HTMLElement|null=null,count=0
   buttons.forEach((button,index)=>{const row=apps[index];const show=filter==='all'||row?.status===filter;button.style.display=show?'':'none';if(show){count++;if(!firstVisible)firstVisible=button}})
   const heading=list.querySelector<HTMLElement>('.pmed-card-head h2');if(heading)heading.textContent=filter==='all'?`${apps.length} postulaciones`:filter==='shortlist'?`${count} en shortlist`:`${count} en entrevistas`
   let note=list.querySelector<HTMLElement>('.pmed-mobile-filter-note')
   if(filter==='all'){note?.remove()}else{
    if(!note){note=document.createElement('div');note.className='pmed-mobile-filter-note';const head=list.querySelector('.pmed-card-head');head?.insertAdjacentElement('afterend',note)}
    if(note){note.innerHTML=`<span>Mostrando ${filter==='shortlist'?'shortlist':'entrevistas'}.</span><button type="button">Ver todos</button>`;note.querySelector('button')?.addEventListener('click',()=>void setFilter('all'),{once:true})}
   }
   firstVisible?.click();scrollTo('.pmed-candidates')
  }
  const wire=()=>{
   const cards=Array.from(document.querySelectorAll<HTMLElement>('.pmed-metrics article'));if(cards.length<5)return
   const actions=[()=>void setFilter('all'),()=>void setFilter('shortlist'),()=>void setFilter('interview'),()=>scrollTo('.pmed-inbox'),()=>window.location.assign('/empresas/configuracion')]
   cards.slice(0,5).forEach((card,index)=>{
    if(card.dataset.pmMetricLink==='1')return
    card.dataset.pmMetricLink='1';card.setAttribute('role','button');card.tabIndex=0
    const run=()=>actions[index]?.()
    card.addEventListener('click',run)
    card.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();run()}})
   })
  }
  void refresh().finally(wire)
  const root=document.querySelector('.pmed-page');if(root){observer=new MutationObserver(wire);observer.observe(root,{childList:true,subtree:true})}else{const timer=window.setInterval(()=>{wire();const next=document.querySelector('.pmed-page');if(next){window.clearInterval(timer);observer=new MutationObserver(wire);observer.observe(next,{childList:true,subtree:true})}},120);return()=>{window.clearInterval(timer);observer?.disconnect()}}
  return()=>observer?.disconnect()
 },[])
 return <style>{css}</style>
}
