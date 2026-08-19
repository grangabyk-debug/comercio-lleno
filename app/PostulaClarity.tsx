'use client'

import { useEffect } from 'react'

const CLARITY_PROJECT_ID='y4kvvky3gc'
const POSTULA_HOSTS=new Set(['postulamejor.com','www.postulamejor.com'])

function maskPrivatePostulaContent(){
  const selectors=[
    '#resultado',
    '[data-orientation-result]',
    '[class*="__resumeWrap"]',
    '[class*="__resume "]',
    '[class*="__detail"]',
    '[class*="__accountBox"]',
  ]
  for(const selector of selectors){
    document.querySelectorAll<HTMLElement>(selector).forEach(el=>el.setAttribute('data-clarity-mask','true'))
  }
}

export default function PostulaClarity(){
  useEffect(()=>{
    if(!POSTULA_HOSTS.has(window.location.hostname))return

    maskPrivatePostulaContent()
    const observer=new MutationObserver(()=>maskPrivatePostulaContent())
    observer.observe(document.documentElement,{childList:true,subtree:true})

    const w=window as Window & {clarity?:((...args:unknown[])=>void)&{q?:unknown[][]}}
    if(!w.clarity){
      const clarity=((...args:unknown[])=>{(clarity.q=clarity.q||[]).push(args)}) as ((...args:unknown[])=>void)&{q?:unknown[][]}
      w.clarity=clarity
    }

    if(!document.querySelector(`script[data-postula-clarity="${CLARITY_PROJECT_ID}"]`)){
      const script=document.createElement('script')
      script.async=true
      script.src=`https://www.clarity.ms/tag/${CLARITY_PROJECT_ID}`
      script.dataset.postulaClarity=CLARITY_PROJECT_ID
      const first=document.getElementsByTagName('script')[0]
      if(first?.parentNode)first.parentNode.insertBefore(script,first)
      else document.head.appendChild(script)
    }

    return()=>observer.disconnect()
  },[])

  return null
}
