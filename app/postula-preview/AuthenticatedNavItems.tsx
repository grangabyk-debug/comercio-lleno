'use client'

import Link from 'next/link'
import {useEffect,useState} from 'react'
import {cvAuthClient} from '../cv-ia/cvAuth'
import MessageLauncher from './MessageLauncher'

export default function AuthenticatedNavItems({audience='candidate',calendarClassName=''}:{audience?:'candidate'|'employer';calendarClassName?:string}){
 const [logged,setLogged]=useState(false)
 useEffect(()=>{
  let alive=true
  const client=cvAuthClient()
  const sync=(session:any)=>{if(alive)setLogged(Boolean(session))}
  client.auth.getSession().then(({data})=>sync(data.session)).catch(()=>sync(null))
  const {data:listener}=client.auth.onAuthStateChange((_event,session)=>sync(session))
  return()=>{alive=false;listener.subscription.unsubscribe()}
 },[])
 if(!logged)return null
 if(audience==='employer')return <Link href="/empresas/calendario" className={calendarClassName}>Calendario</Link>
 return <><MessageLauncher/><Link href="/calendario">Calendario</Link></>
}
