'use client'

import Link from 'next/link'
import {useEffect,useState} from 'react'
import {cvAuthClient} from '../cv-ia/cvAuth'

export default function AccountNavLink({audience,className}:{audience:'candidate'|'employer';className?:string}){
 const [href,setHref]=useState(audience==='candidate'?'/login':'/empresas/login')
 useEffect(()=>{let alive=true;(async()=>{const {data}=await cvAuthClient().auth.getSession();if(!alive||!data.session)return;setHref(audience==='candidate'?'/mi-cuenta':'/empresas/panel')})().catch(()=>{});return()=>{alive=false}},[audience])
 return <Link href={href} className={className}>Mi cuenta</Link>
}
