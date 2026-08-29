'use client'

import Link from 'next/link'
import {useEffect,useState} from 'react'
import {cvAuthClient} from '../cv-ia/cvAuth'
import MessageLauncher from './MessageLauncher'

export default function AuthenticatedNavItems({audience='candidate',calendarClassName=''}:{audience?:'candidate'|'employer';calendarClassName?:string}){
 const [visible,setVisible]=useState(false)
 useEffect(()=>{
  let alive=true
  const client=cvAuthClient()
  const sync=async(session:any)=>{
   if(!alive)return
   if(!session){setVisible(false);return}
   if(audience==='candidate'){setVisible(true);return}
   const {data,error}=await client.from('pm_company_members').select('company_id').eq('user_id',session.user.id).eq('status','active').limit(1)
   if(alive)setVisible(!error&&Boolean(data?.length))
  }
  client.auth.getSession().then(({data})=>void sync(data.session)).catch(()=>{if(alive)setVisible(false)})
  const {data:listener}=client.auth.onAuthStateChange((_event,session)=>void sync(session))
  return()=>{alive=false;listener.subscription.unsubscribe()}
 },[audience])
 if(!visible)return null
 if(audience==='employer')return <Link href="/empresas/calendario" prefetch={false} className={calendarClassName}>Calendario</Link>
 return <><MessageLauncher/><Link href="/calendario" prefetch={false}>Calendario</Link></>
}
