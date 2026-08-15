'use client'

import { useEffect,useMemo,useState } from 'react'
import { createPortal } from 'react-dom'
import { readTenantSession } from '@/lib/comercio/session'
import { loadMyBranchOptions } from '@/lib/comercio/tenant-admin-api'
import { readActiveBranchId,setActiveBranch,type BranchOption } from '@/lib/comercio/branch-context'
import styles from './branch-topbar.module.css'

function findTopbarHost(){
  const buttons=Array.from(document.querySelectorAll('header button'))
  const refresh=buttons.find(button=>(button.textContent||'').trim()==='Actualizar')
  return refresh?.parentElement instanceof HTMLElement?refresh.parentElement:null
}

export default function BranchTopbarRuntime(){
  const[host,setHost]=useState<HTMLElement|null>(null)
  const[options,setOptions]=useState<BranchOption[]>([])
  const[current,setCurrent]=useState('')
  const[loading,setLoading]=useState(true)
  const session=useMemo(()=>readTenantSession(),[])

  useEffect(()=>{
    const locate=()=>setHost(findTopbarHost())
    locate()
    const observer=new MutationObserver(locate)
    observer.observe(document.body,{childList:true,subtree:true})
    return()=>observer.disconnect()
  },[])

  useEffect(()=>{
    if(!session)return
    let cancelled=false
    loadMyBranchOptions(session).then(rows=>{
      if(cancelled)return
      setOptions(rows)
      const stored=readActiveBranchId()
      const selected=rows.find(x=>x.id===stored)||rows.find(x=>x.is_primary)||rows[0]
      if(!selected){setLoading(false);return}
      setCurrent(selected.id)
      if(stored!==selected.id){
        setActiveBranch(selected,session)
        window.location.reload()
        return
      }
      setLoading(false)
    }).catch(()=>setLoading(false))
    return()=>{cancelled=true}
  },[session])

  if(!host||!session||loading||!options.length)return null
  const selected=options.find(x=>x.id===current)||options[0]
  const canSwitch=options.length>1
  const control=<div className={styles.wrap} title={canSwitch?'Cambiar sucursal operativa':'Sucursal operativa'}>
    <span className={styles.label}>Sucursal</span>
    {canSwitch?<select aria-label="Elegir sucursal" value={selected.id} onChange={e=>{
      const next=options.find(x=>x.id===e.target.value)
      if(!next)return
      setCurrent(next.id)
      setActiveBranch(next,session)
      window.location.reload()
    }}>{options.map(branch=><option value={branch.id} key={branch.id}>{branch.name}</option>)}</select>:<b>{selected.name}</b>}
    {canSwitch&&<span className={styles.chevron}>⌄</span>}
  </div>
  return createPortal(control,host)
}
