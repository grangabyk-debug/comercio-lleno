'use client'

import { useEffect } from 'react'

export default function PreviewVisualFixes(){
  useEffect(()=>{
    const markDesignPanel=()=>{
      document.querySelectorAll('h3').forEach(h=>{
        if((h.textContent||'').trim()!=='Diseño de la interfaz')return
        const section=h.closest('section') as HTMLElement|null
        if(section)section.dataset.clDesignPanel='1'
      })
    }
    markDesignPanel()
    const observer=new MutationObserver(markDesignPanel)
    observer.observe(document.body,{childList:true,subtree:true})
    return()=>observer.disconnect()
  },[])

  return <style>{css}</style>
}

const css=`
/* Nueva venta: el estado seleccionado siempre gana a las variantes alternadas.
   Corrige especialmente Débito y Mercado Pago, que ocupan posiciones 3n+2. */
main:not([class*="dark"]) [class*="payments"] > button[class*="payment"][class*="paymentSelected"],
main:not([class*="dark"]) [class*="payments"] > button[class*="payment"][class*="paymentSelected"]:nth-child(3n+2){
  color:#fff!important;
  background:linear-gradient(135deg,#6d36d8 0%,#5120b4 72%,#3c1789 100%)!important;
  border-color:#7a48dc!important;
  box-shadow:0 10px 24px rgba(109,54,216,.25),inset 0 1px 0 rgba(255,255,255,.20)!important;
  opacity:1!important;
  -webkit-text-fill-color:#fff!important;
}
main:not([class*="dark"]) [class*="payments"] > button[class*="payment"][class*="paymentSelected"] *{
  color:#fff!important;
  -webkit-text-fill-color:#fff!important;
}

/* Configuración > Diseño: aislar el pie y la muestra de los selectores globales del tema. */
main [data-cl-design-panel="1"] [class*="preview"]{
  background:linear-gradient(135deg,#171318 0%,#261b2e 56%,#4b2591 100%)!important;
  color:#fff!important;
  border:1px solid rgba(109,54,216,.28)!important;
  box-shadow:0 15px 34px rgba(38,22,47,.12)!important;
  opacity:1!important;
}
main [data-cl-design-panel="1"] [class*="preview"] > span{color:#ff9a68!important;opacity:1!important}
main [data-cl-design-panel="1"] [class*="preview"] h4{color:#fff!important;opacity:1!important}
main [data-cl-design-panel="1"] [class*="preview"] p,
main [data-cl-design-panel="1"] [class*="preview"] small{color:#d9d0df!important;opacity:1!important}
main [data-cl-design-panel="1"] [class*="preview"] b{color:#fff!important;opacity:1!important}
main [data-cl-design-panel="1"] [class*="preview"] button{
  background:#ff641d!important;
  color:#fff!important;
  border:1px solid #ff7a3d!important;
  opacity:1!important;
  box-shadow:0 8px 18px rgba(255,100,29,.22)!important;
}
main [data-cl-design-panel="1"] [class*="actions"]{
  min-height:66px!important;
  padding-top:15px!important;
  border-top:1px solid var(--line,#e3dbe7)!important;
  opacity:1!important;
}
main [data-cl-design-panel="1"] [class*="actions"] > small{
  color:var(--text,#302733)!important;
  opacity:.82!important;
  font-size:11px!important;
}
main [data-cl-design-panel="1"] [class*="actions"] button{
  min-height:42px!important;
  padding:10px 16px!important;
  border-radius:11px!important;
  opacity:1!important;
  visibility:visible!important;
}
main [data-cl-design-panel="1"] [class*="actions"] button[class*="primary"]{
  background:linear-gradient(135deg,#6d36d8,#5120b4)!important;
  color:#fff!important;
  border:0!important;
}
main [data-cl-design-panel="1"] [class*="actions"] button[class*="primary"]:disabled{
  background:#ddd5e4!important;
  color:#766c7a!important;
  opacity:1!important;
  cursor:not-allowed!important;
}
main[class*="dark"] [data-cl-design-panel="1"] [class*="actions"] > small{color:#e4dce8!important}
main[class*="dark"] [data-cl-design-panel="1"] [class*="actions"] button[class*="primary"]:disabled{background:#332a38!important;color:#9e92a4!important}

/* Inicio oscuro: Modo Simple queda integrado al fondo, sin mancha marrón/naranja. */
main[class*="dark"] [class*="simpleLaunch"]{
  background:transparent!important;
  border:1px solid #3b3041!important;
  box-shadow:none!important;
  filter:none!important;
}
main[class*="dark"] [class*="simpleLaunch"]:after{display:none!important;background:none!important}
main[class*="dark"] [class*="simpleLaunch"] [class*="simpleTexture"]{display:none!important;background:none!important}
main[class*="dark"] [class*="simpleLaunch"] [class*="simpleIcon"]{
  background:#211a25!important;
  border-color:#46384e!important;
  box-shadow:none!important;
}
main[class*="dark"] [class*="simpleLaunch"] [class*="simpleButton"]{
  background:#211a25!important;
  color:#eee6f1!important;
  border:1px solid #44364b!important;
  box-shadow:none!important;
}
`
