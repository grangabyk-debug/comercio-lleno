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

/* Gestión en modo oscuro: contraste real y estable, aunque otros estilos globales intenten aclarar los botones. */
body.comercio-dark main[class*="shell"] [class*="flyout"] button[class*="managementItem"],
main[class*="dark"] [class*="flyout"] button[class*="managementItem"]{
  background:linear-gradient(145deg,#faf8fb,#f1edf4)!important;
  border-color:#dcd4e1!important;
  color:#241d29!important;
  -webkit-text-fill-color:#241d29!important;
  text-shadow:none!important;
  opacity:1!important;
}
body.comercio-dark main[class*="shell"] [class*="flyout"] button[class*="managementItem"] *,
main[class*="dark"] [class*="flyout"] button[class*="managementItem"] *{
  color:#241d29!important;
  -webkit-text-fill-color:#241d29!important;
  opacity:1!important;
}
body.comercio-dark main[class*="shell"] [class*="flyout"] button[class*="managementItem"]>span,
main[class*="dark"] [class*="flyout"] button[class*="managementItem"]>span{
  background:#edf3f0!important;
  color:#315347!important;
  -webkit-text-fill-color:#315347!important;
  border-color:#d3e0da!important;
}
body.comercio-dark main[class*="shell"] [class*="flyout"] button[class*="managementItem"]:hover,
main[class*="dark"] [class*="flyout"] button[class*="managementItem"]:hover{
  background:#fff!important;
  border-color:#bca9d3!important;
  color:#321d4c!important;
  -webkit-text-fill-color:#321d4c!important;
}
body.comercio-dark main[class*="shell"] [class*="flyout"] button[class*="managementItemActive"],
main[class*="dark"] [class*="flyout"] button[class*="managementItemActive"]{
  background:#fff0e8!important;
  border-color:#efb996!important;
  color:#7b2f10!important;
  -webkit-text-fill-color:#7b2f10!important;
}

/* Compras en modo oscuro: títulos y descripciones de Pago total / Pago parcial siempre blancos. */
body.comercio-dark .cl-purchase-choice button,
body.comercio-dark .cl-purchase-choice button b,
body.comercio-dark .cl-purchase-choice button small,
main[class*="dark"] .cl-purchase-choice button,
main[class*="dark"] .cl-purchase-choice button b,
main[class*="dark"] .cl-purchase-choice button small{
  color:#fff!important;
  -webkit-text-fill-color:#fff!important;
  opacity:1!important;
}

/* Inicio > Contexto: más presencia visual y mejor lectura. */
main [class*="comparisonPanel"]{
  padding:28px!important;
}
main [class*="comparisonPanel"] [class*="sectionTitle"]{
  padding-bottom:19px!important;
}
main [class*="comparisonPanel"] [class*="sectionTitle"]>div>span{
  font-size:10.5px!important;
  letter-spacing:.16em!important;
}
main [class*="comparisonPanel"] [class*="sectionTitle"] h2{
  font-size:27px!important;
  line-height:1.08!important;
}
main [class*="comparisonPanel"] [class*="comparisonList"]{
  gap:11px!important;
  padding-top:17px!important;
}
main [class*="comparisonPanel"] [class*="comparisonCard"]{
  min-height:78px!important;
  padding:18px 18px!important;
  border-radius:19px!important;
  display:flex!important;
  flex-direction:column!important;
  justify-content:center!important;
}
main [class*="comparisonPanel"] [class*="comparisonCard"] span,
main [class*="comparisonPanel"] [class*="comparisonCard"] b{
  font-size:12.5px!important;
  line-height:1.25!important;
}
main [class*="comparisonPanel"] [class*="comparisonCard"] small{
  margin-top:8px!important;
  font-size:11.5px!important;
  line-height:1.35!important;
}
@media(min-width:1181px){
  main [class*="lowerGrid"]{
    grid-template-columns:minmax(0,1fr) minmax(430px,1fr)!important;
  }
}
@media(max-width:760px){
  main [class*="comparisonPanel"]{padding:20px!important}
  main [class*="comparisonPanel"] [class*="sectionTitle"] h2{font-size:23px!important}
  main [class*="comparisonPanel"] [class*="comparisonCard"]{min-height:70px!important;padding:15px!important}
}
`
