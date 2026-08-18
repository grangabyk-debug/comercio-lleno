'use client'

import { useEffect } from 'react'

export default function MobileSaleUiFix(){
  useEffect(()=>{
    let cancelled=false

    const sync=()=>{
      if(cancelled)return
      const invoice=(document.querySelector('button[data-mobile-checkout-kind="invoice"]')||document.querySelector('button[class*="invoiceButton"]')) as HTMLButtonElement|null
      const saleOnly=document.querySelector('button[data-mobile-checkout-kind="sale"]') as HTMLButtonElement|null
      const saleActive=Boolean(invoice)

      if(invoice){
        invoice.style.setProperty('display','inline-flex','important')
        invoice.style.setProperty('align-items','center','important')
        invoice.style.setProperty('justify-content','center','important')
        invoice.style.setProperty('box-sizing','border-box','important')
        invoice.style.setProperty('width','calc(50% - 20px)','important')
        invoice.style.setProperty('margin','0 5px 8px 14px','important')
        invoice.style.setProperty('vertical-align','top','important')
      }
      if(saleOnly){
        saleOnly.style.setProperty('display','inline-flex','important')
        saleOnly.style.setProperty('align-items','center','important')
        saleOnly.style.setProperty('justify-content','center','important')
        saleOnly.style.setProperty('box-sizing','border-box','important')
        saleOnly.style.setProperty('width','calc(50% - 20px)','important')
        saleOnly.style.setProperty('margin','0 14px 8px 5px','important')
        saleOnly.style.setProperty('vertical-align','top','important')
      }

      const floatingTools=Array.from(document.querySelectorAll('button[aria-label="Escanear producto"],button[aria-label="Abrir asistente IA"]')) as HTMLButtonElement[]
      floatingTools.forEach(button=>{
        if(saleActive){
          button.dataset.hiddenDuringSale='1'
          button.style.setProperty('display','none','important')
          button.style.setProperty('pointer-events','none','important')
        }else if(button.dataset.hiddenDuringSale==='1'){
          delete button.dataset.hiddenDuringSale
          button.style.removeProperty('display')
          button.style.removeProperty('pointer-events')
        }
      })
    }

    sync()
    const observer=new MutationObserver(sync)
    observer.observe(document.body,{childList:true,subtree:true,characterData:true})
    const timer=window.setInterval(sync,500)
    return()=>{cancelled=true;observer.disconnect();window.clearInterval(timer)}
  },[])

  return null
}
