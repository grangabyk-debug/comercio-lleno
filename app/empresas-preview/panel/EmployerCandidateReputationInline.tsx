'use client'

import {useEffect,useMemo,useState} from 'react'
import {createPortal} from 'react-dom'
import {cvAuthClient} from '../../cv-ia/cvAuth'
import EmploymentReviewPanel from '../../postula-preview/EmploymentReviewPanel'
import PublicReputationBadge from '../../postula-preview/PublicReputationBadge'
import type {PublicReputation,ReputationIndicator} from '../../postula-preview/publicReputation'

type RawRep={count?:number;average?:number|null;indicator?:string}|null
type App={id:string;status:string;candidate_snapshot?:{display_name?:string};candidate_reputation?:RawRep}
function reputation(value:RawRep):PublicReputation{const indicator=(['favorable','mixed','unfavorable'].includes(String(value?.indicator))?value?.indicator:'forming') as ReputationIndicator;return{count:Number(value?.count||0),average:value?.average==null?null:Number(value.average),indicator,label:indicator==='favorable'?'Favorable':indicator==='mixed'?'Mixto':indicator==='unfavorable'?'Desfavorable':'Indicador en formación'}}

export default function EmployerCandidateReputationInline(){
 const [apps,setApps]=useState<App[]>([]),[selected,setSelected]=useState(''),[host,setHost]=useState<HTMLElement|null>(null),[busy,setBusy]=useState(false),[notice,setNotice]=useState('')
 useEffect(()=>{let alive=true;void(async()=>{const {data}=await cvAuthClient().auth.getSession();const token=data.session?.access_token;if(!token)return;const cr=await fetch('/api/postula/company',{headers:{Authorization:`Bearer ${token}`},cache:'no-store'});const cd=await cr.json().catch(()=>({}));const companyId=cd?.memberships?.[0]?.company_id;if(!companyId||!alive)return;const ar=await fetch(`/api/postula/applications?company=${encodeURIComponent(companyId)}`,{headers:{Authorization:`Bearer ${token}`},cache:'no-store'});const ad=await ar.json().catch(()=>({}));if(ar.ok&&alive)setApps(ad.applications||[])})().catch(()=>{});return()=>{alive=false}},[])
 useEffect(()=>{
  const sync=()=>{
   const buttons=Array.from(document.querySelectorAll<HTMLButtonElement>('.pmed-candidate-list > button'))
   buttons.forEach((button,index)=>{const text=button.textContent||'';const byName=apps.find(a=>a.candidate_snapshot?.display_name&&text.includes(a.candidate_snapshot.display_name));const app=byName||apps[index];if(app)button.dataset.pmApplicationId=app.id})
   const active=buttons.find(b=>b.dataset.on==='true')||buttons[0];if(active?.dataset.pmApplicationId)setSelected(active.dataset.pmApplicationId)
   const facts=document.querySelector<HTMLElement>('.pmed-candidate-detail .pmed-detail-facts')
   if(facts){let target=facts.parentElement?.querySelector<HTMLElement>(':scope > .pm48-inline-reputation-host')||null;if(!target){target=document.createElement('div');target.className='pm48-inline-reputation-host';facts.insertAdjacentElement('afterend',target)}setHost(target)}else setHost(null)
  }
  const observer=new MutationObserver(sync);observer.observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['data-on']})
  const click=(event:MouseEvent)=>{const button=(event.target as HTMLElement|null)?.closest<HTMLButtonElement>('.pmed-candidate-list > button');if(button)setTimeout(sync,0)}
  document.addEventListener('click',click,true);const timer=setInterval(sync,900);sync()
  return()=>{observer.disconnect();document.removeEventListener('click',click,true);clearInterval(timer)}
 },[apps])
 const current=useMemo(()=>apps.find(a=>a.id===selected),[apps,selected])
 async function confirmHire(){if(!current||busy)return;if(!window.confirm('¿Confirmás que esta persona fue contratada? Esto habilita la evaluación laboral bilateral durante 10 días.'))return;setBusy(true);setNotice('');try{const {data}=await cvAuthClient().auth.getSession();const token=data.session?.access_token;if(!token)throw new Error('Iniciá sesión nuevamente.');const r=await fetch('/api/postula/applications',{method:'PATCH',headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},body:JSON.stringify({id:current.id,status:'hired'})});const d=await r.json().catch(()=>({}));if(!r.ok||!d?.ok)throw new Error(d?.error||'No pudimos confirmar la contratación.');setApps(rows=>rows.map(a=>a.id===current.id?{...a,status:'hired'}:a));setNotice('Contratación confirmada. Ya se habilitó la evaluación bilateral.')}catch(e){setNotice(e instanceof Error?e.message:'No pudimos confirmar la contratación.')}finally{setBusy(false)}}
 if(!host||!current)return null
 const rep=reputation(current.candidate_reputation||null)
 return createPortal(<section className="pm48-inline-reputation"><div className="pm48-inline-reputation-head"><div><small>REPUTACIÓN LABORAL</small><b>Historial dentro de Postulá Mejor</b></div>{rep.count>0?<PublicReputationBadge reputation={rep}/>:<span>Sin evaluaciones todavía</span>}</div>{current.status==='hired'?<EmploymentReviewPanel applicationId={current.id}/>:!['rejected','withdrawn'].includes(current.status)&&<div className="pm48-hire-action"><p>Si la incorporación ya se concretó, confirmala para habilitar la evaluación de ambas partes.</p><button type="button" disabled={busy} onClick={()=>void confirmHire()}>{busy?'Confirmando…':'Marcar como contratado/a'}</button></div>}{notice&&<p className="pm48-reputation-notice">{notice}</p>}</section>,host)
}
