'use client'

import { useEffect } from 'react'

const CLARITY_PROJECT_ID='y4kvvky3gc'
const POSTULA_HOSTS=new Set(['postulamejor.com','www.postulamejor.com'])

export default function PostulaClarity(){
  useEffect(()=>{
    if(!POSTULA_HOSTS.has(window.location.hostname))return
    if(document.querySelector(`script[data-postula-clarity="${CLARITY_PROJECT_ID}"]`))return

    const w=window as Window & {clarity?:((...args:unknown[])=>void)&{q?:unknown[][]}}
    if(!w.clarity){
      const clarity=((...args:unknown[])=>{(clarity.q=clarity.q||[]).push(args)}) as ((...args:unknown[])=>void)&{q?:unknown[][]}
      w.clarity=clarity
    }

    const script=document.createElement('script')
    script.async=true
    script.src=`https://www.clarity.ms/tag/${CLARITY_PROJECT_ID}`
    script.dataset.postulaClarity=CLARITY_PROJECT_ID
    const first=document.getElementsByTagName('script')[0]
    if(first?.parentNode)first.parentNode.insertBefore(script,first)
    else document.head.appendChild(script)
  },[])

  return null
}
