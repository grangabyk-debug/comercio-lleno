'use client'

import {useEffect,useState} from 'react'
import {cvAuthClient} from '../cv-ia/cvAuth'
import CandidateDashboard from './CandidateDashboard'

export default function CandidateActivationGate({jobCount=0}:{jobCount?:number}){
 const [ready,setReady]=useState(false)
 useEffect(()=>{cvAuthClient().auth.getSession().finally(()=>setReady(true))},[])
 if(!ready)return <section className="pm34-loading"><b>Preparando tu cuenta…</b></section>
 return <CandidateDashboard jobCount={jobCount}/>
}
