'use client'

import { useEffect } from 'react'

export default function DarkModeBridge(){
  useEffect(()=>{
    const apply=()=>{
      const main=document.querySelector('main[class*="shell"]')
      const dark=Boolean(main&&Array.from(main.classList).some(name=>name.toLowerCase().includes('dark')))
      document.documentElement.dataset.theme=dark?'dark':'light'
    }
    apply()
    const observer=new MutationObserver(apply)
    const attach=()=>{
      const main=document.querySelector('main[class*="shell"]')
      if(main)observer.observe(main,{attributes:true,attributeFilter:['class']})
    }
    attach()
    const timer=window.setTimeout(()=>{apply();attach()},80)
    return()=>{window.clearTimeout(timer);observer.disconnect();delete document.documentElement.dataset.theme}
  },[])
  return null
}
