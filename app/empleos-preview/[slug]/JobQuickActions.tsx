'use client'

import Link from 'next/link'
import {useState} from 'react'

export default function JobQuickActions({slug,title,company,external}:{slug:string;title:string;company:string;external:boolean}){
 const [copied,setCopied]=useState(false)
 async function share(){
  const url=`https://postulamejor.com/empleos/${slug}`
  const text=`${title} · ${company}`
  try{
   if(navigator.share){await navigator.share({title:text,text,url});return}
   await navigator.clipboard.writeText(url);setCopied(true);setTimeout(()=>setCopied(false),1800)
  }catch{}
 }
 return <div className={`pm-job-quick-actions ${external?'external':''}`}>
  {!external&&<Link href={`/postular/${slug}?rapida=1`} className="pm-job-quick-primary">Postulación rápida</Link>}
  <button type="button" className="pm-job-share" onClick={()=>void share()}><span aria-hidden="true">↗</span>{copied?'Enlace copiado':'Compartir'}</button>
 </div>
}
