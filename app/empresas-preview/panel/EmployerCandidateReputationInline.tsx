'use client'

import {useEffect,useLayoutEffect,useMemo,useState} from 'react'
import {createPortal} from 'react-dom'
import {cvAuthClient} from '../../cv-ia/cvAuth'
import EmploymentReviewPanel from '../../postula-preview/EmploymentReviewPanel'
import PublicReputationBadge from '../../postula-preview/PublicReputationBadge'
import type {PublicReputation,ReputationIndicator} from '../../postula-preview/publicReputation'

type RawRep={count?:number;average?:number|null;indicator?:string}|null
type App={id:string;status:string;candidate_snapshot?:{display_name?:string};candidate_reputation?:RawRep}
function reputation(value:RawRep):PublicReputation{const indicator=(['favorable','mixed','unfavorable'].includes(String(value?.indicator))?value?.indicator:'forming') as ReputationIndicator;return{count:Number(value?.count||0),average:value?.average==null?null:Number(value.average),indicator,label:indicator==='favorable'?'Favorable':indicator==='mixed'?'Mixto':indicator==='unfavorable'?'Desfavorable':'Indicador en formación'}}

let cachedApps:App[]|null=null

export default function EmployerCandidateReputationInline({active=true}:{active?:boolean}){
 const [apps,setApps]=useState<App[]>(cachedApps||[]),[selected,setSelected]=useState(''),[host,setHost]=useState<HTMLElement|null>(null),[loading,setLoading]=useState(!cachedApps),[busy,setBusy]=useState(false),[notice,setNotice]=useState('')
 useEffect(()=>{let alive=true;if(cachedApps){setApps(cachedApps);setLoading(false);return()=>{alive=false}}
  void(async()=>{try{const {data}=await cvAuthClient().auth.getSession();const token=data.session?.access_token;if(!token)return;const cr=await fetch('/api/postula/company',{headers:{Authorization:`Bearer ${token}`},cache:'no-store'});const cd=await cr.json().catch(()=>({}));const companyId=cd?.memberships?.[0]?.company_id;if(!companyId||!alive)return;const ar=await fetch(`/api/postula/applications?company=${encodeURIComponent(companyId)}`,{headers:{Authorization:`Bearer ${token}`},cache:'no-store'});const ad=await ar.json().catch(()=>({}));if(ar.ok&&alive){cachedApps=ad.applications||[];setApps(cachedApps||[])}}finally{if(alive)setLoading(false)}})().catch(()=>{if(alive)setLoading(false)});return()=>{alive=false}},[])
 useLayoutEffect(()=>{
  if(!active){setHost(null);return}
  const sync=()=>{
   const buttons=Array.from(document.querySelectorAll<HTMLButtonElement>('.pmed-candidate-list > button'))
   buttons.forEach((button,index)=>{const text=button.textContent||'';const byName=apps.find(a=>a.candidate_snapshot?.display_name&&text.includes(a.candidate_snapshot.display_name));const app=byName||apps[index];if(app)button.dataset.pmApplicationId=app.id})
   const activeButton=buttons.find(b=>b.dataset.on==='true')||buttons[0]
   if(activeButton?.dataset.pmApplicationId)setSelected(activeButton.dataset.pmApplicationId)
   const facts=document.querySelector<HTMLElement>('.pmed-candidate-detail .pmed-detail-facts')
   if(facts){let target=facts.parentElement?.querySelector<HTMLElement>(':scope > .pm48-inline-reputation-host')||null;if(!target){target=document.createElement('div');target.className='pm48-inline-reputation-host';facts.insertAdjacentElement('afterend',target)}setHost(target)}else setHost(null)
  }
  sync()
  const observer=new MutationObserver(sync);observer.observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['data-on']})
  const click=(event:MouseEvent)=>{const button=(event.target as HTMLElement|null)?.closest<HTMLButtonElement>('.pmed-candidate-list > button');if(!button)return;const id=button.dataset.pmApplicationId;if(id)setSelected(id);queueMicrotask(sync)}
  document.addEventListener('click',click,true)
  return()=>{observer.disconnect();document.removeEventListener('click',click,true)}
 },[active,apps])
 const current=useMemo(()=>apps.find(a=>a.id===selected)||apps[0],[apps,selected])
 async function confirmHire(){if(!current||busy)return;if(!window.confirm('¿Confirmás que esta persona fue contratada? Esto habilita la evaluación laboral bilateral durante 10 días.'))return;setBusy(true);setNotice('');try{const {data}=await cvAuthClient().auth.getSession();const token=data.session?.access_token;if(!token)throw new Error('Iniciá sesión nuevamente.');const r=await fetch('/api/postula/applications',{method:'PATCH',headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},body:JSON.stringify({id:current.id,status:'hired'})});const d=await r.json().catch(()=>({}));if(!r.ok||!d?.ok)throw new Error(d?.error||'No pudimos confirmar la contratación.');setApps(rows=>{const next=rows.map(a=>a.id===current.id?{...a,status:'hired'}:a);cachedApps=next;return next});setNotice('Contratación confirmada. Ya se habilitó la evaluación bilateral.')}catch(e){setNotice(e instanceof Error?e.message:'No pudimos confirmar la contratación.')}finally{setBusy(false)}}
 if(!active||!host)return null
 if(loading)return createPortal(<section className="pm48-inline-reputation" aria-busy="true"><div className="pm48-inline-reputation-head"><div><small>REPUTACIÓN LABORAL</small><b>Historial dentro de Postulá Mejor</b></div><span className="pm48-reputation-loading">Consultando reputación…</span></div><div className="pm48-hire-action pm48-hire-action-loading"><p>Estamos cargando el historial laboral de esta persona.</p><button type="button" disabled>Marcar como contratado/a</button></div></section>,host)
 if(!current)return null
 const rep=reputation(current.candidate_reputation||null)
 return createPortal(<section className="pm48-inline-reputation"><div className="pm48-inline-reputation-head"><div><small>REPUTACIÓN LABORAL</small><b>Historial dentro de Postulá Mejor</b></div>{rep.count>0?<PublicReputationBadge reputation={rep}/>:<span className="pm48-no-reviews">Sin evaluaciones todavía</span>}</div>{current.status==='hired'?<EmploymentReviewPanel applicationId={current.id}/>:!['rejected','withdrawn'].includes(current.status)&&<div className="pm48-hire-action"><p>Si la incorporación ya se concretó, confirmala para habilitar la evaluación de ambas partes.</p><button type="button" disabled={busy} onClick={()=>void confirmHire()}>{busy?'Confirmando…':'Marcar como contratado/a'}</button></div>}{notice&&<p className="pm48-reputation-notice">{notice}</p>}</section>,host)
}
