'use client'

import { useEffect } from 'react'

const PENDING_FISCAL_RE = /pendiente de facturaci[oó]n/i

export default function TransientFiscalNoticeRuntime(){
  useEffect(()=>{
    const scheduled=new WeakSet<Element>()
    const timers=new Set<number>()

    const scan=()=>{
      document.querySelectorAll('[class*="notice"]').forEach(node=>{
        if(scheduled.has(node))return
        const text=(node.textContent||'').trim()
        if(!PENDING_FISCAL_RE.test(text))return
        scheduled.add(node)
        const timer=window.setTimeout(()=>{
          if(!node.isConnected)return
          const close=node.querySelector('button') as HTMLButtonElement|null
          if(close)close.click()
          else (node as HTMLElement).style.display='none'
        },5200)
        timers.add(timer)
      })
    }

    scan()
    const observer=new MutationObserver(scan)
    observer.observe(document.body,{childList:true,subtree:true,characterData:true})
    return()=>{
      observer.disconnect()
      timers.forEach(timer=>window.clearTimeout(timer))
    }
  },[])
  return null
}
