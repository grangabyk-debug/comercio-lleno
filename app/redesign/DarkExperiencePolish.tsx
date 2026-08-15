'use client'

import { useEffect } from 'react'

const css=`
/* Navegación lateral: tipografía más presente + vidrio/transparencia. */
main[class*="shell"]>div[class*="layout"]>aside[class*="sidebar"] [class*="navButton"]{
  min-height:58px!important;
  padding:9px 11px!important;
  gap:11px!important;
  border:1px solid rgba(255,255,255,.075)!important;
  background:linear-gradient(145deg,rgba(255,255,255,.055),rgba(255,255,255,.018))!important;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.055),0 9px 24px rgba(0,0,0,.08)!important;
  backdrop-filter:blur(14px) saturate(1.12)!important;
  -webkit-backdrop-filter:blur(14px) saturate(1.12)!important;
}
main[class*="shell"]>div[class*="layout"]>aside[class*="sidebar"] [class*="mainLabel"]{
  font-size:15px!important;
  line-height:1.08!important;
  font-weight:900!important;
  letter-spacing:-.18px!important;
}
main[class*="shell"]>div[class*="layout"]>aside[class*="sidebar"] [class*="mainIcon"]{
  width:38px!important;
  height:38px!important;
  flex:0 0 38px!important;
  border-radius:12px!important;
  background:linear-gradient(145deg,rgba(255,255,255,.96),rgba(231,224,237,.88))!important;
  color:#34293b!important;
  box-shadow:0 7px 16px rgba(0,0,0,.16),inset 0 1px 0 rgba(255,255,255,.9)!important;
}
main[class*="shell"]>div[class*="layout"]>aside[class*="sidebar"] [class*="navButton"]:hover{
  background:linear-gradient(145deg,rgba(255,255,255,.095),rgba(109,54,216,.075))!important;
  border-color:rgba(160,123,235,.22)!important;
  transform:translateX(2px)!important;
}
main[class*="shell"]>div[class*="layout"]>aside[class*="sidebar"] [class*="navActive"]{
  background:linear-gradient(135deg,rgba(109,54,216,.48),rgba(74,31,157,.24))!important;
  border-color:rgba(177,144,244,.42)!important;
  box-shadow:0 12px 28px rgba(77,36,154,.22),inset 0 1px 0 rgba(255,255,255,.13)!important;
}
main[class*="shell"]>div[class*="layout"]>aside[class*="sidebar"] [class*="navActive"] [class*="mainIcon"]{
  background:linear-gradient(145deg,#8757e6,#6933d4)!important;
  color:#fff!important;
  box-shadow:0 8px 18px rgba(109,54,216,.34),inset 0 1px 0 rgba(255,255,255,.22)!important;
}
main[class*="shell"]>div[class*="layout"]>aside[class*="sidebar"] [class*="saleNav"]{
  background:linear-gradient(135deg,#ff641d,#e74c0d)!important;
  border-color:rgba(255,159,112,.44)!important;
  box-shadow:0 13px 28px rgba(255,100,29,.25),inset 0 1px 0 rgba(255,255,255,.18)!important;
}
main[class*="shell"]>div[class*="layout"]>aside[class*="sidebar"] [class*="saleNav"] [class*="mainIcon"]{
  background:linear-gradient(145deg,rgba(255,255,255,.24),rgba(255,255,255,.12))!important;
  color:#fff!important;
  border:1px solid rgba(255,255,255,.18)!important;
}
main[class*="shell"]>div[class*="layout"]>aside[class*="sidebar"] [class*="supportAssistant"]{
  border-color:rgba(177,144,244,.26)!important;
  background:linear-gradient(145deg,rgba(109,54,216,.10),rgba(255,255,255,.025))!important;
}
main[class*="shell"] [class*="managementButton"]{
  min-height:56px!important;
  border-radius:16px!important;
  border:1px solid rgba(255,255,255,.075)!important;
  background:linear-gradient(145deg,rgba(255,255,255,.06),rgba(255,255,255,.02))!important;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.05),0 8px 20px rgba(0,0,0,.08)!important;
  backdrop-filter:blur(14px)!important;
}
main[class*="shell"] [class*="managementLabel"]{font-size:15px!important;font-weight:900!important;letter-spacing:-.16px!important}
main[class*="shell"] [class*="managementIcon"]{width:38px!important;height:38px!important;border-radius:12px!important;background:linear-gradient(145deg,#f8f5fa,#e9e2ee)!important;color:#322738!important;box-shadow:0 7px 16px rgba(0,0,0,.14)!important}
main[class*="shell"] [class*="flyout"]{background:rgba(25,20,29,.94)!important;border:1px solid rgba(255,255,255,.09)!important;box-shadow:0 24px 60px rgba(0,0,0,.34)!important;backdrop-filter:blur(22px) saturate(1.15)!important}
main[class*="shell"] [class*="managementItem"]{font-size:13.5px!important;font-weight:850!important}

/* Asistente IA y Pedido IA+: capa oscura real, no paneles blancos. */
body.comercio-dark main[class*="shell"] [class*="aiBadge"]{background:rgba(109,54,216,.15)!important;border-color:rgba(163,126,235,.28)!important;color:#cbb5f7!important}
body.comercio-dark main[class*="shell"] [class*="chatCard"],
body.comercio-dark main[class*="shell"] [class*="aiOrder"]{
  background:linear-gradient(145deg,rgba(29,23,33,.96),rgba(22,17,25,.96))!important;
  border-color:#3a3040!important;
  color:#f7f2f8!important;
  box-shadow:0 18px 44px rgba(0,0,0,.22)!important;
}
body.comercio-dark main[class*="shell"] [class*="chatTitle"]{background:#1d1721!important;border-color:#3a3040!important}
body.comercio-dark main[class*="shell"] [class*="chatTitle"] small{color:#a99faf!important}
body.comercio-dark main[class*="shell"] [class*="messages"]{background:radial-gradient(circle at 88% 8%,rgba(109,54,216,.09),transparent 26%),#141017!important}
body.comercio-dark main[class*="shell"] [class*="bot"]{background:#241d28!important;border-color:#403548!important;color:#eee7f2!important}
body.comercio-dark main[class*="shell"] [class*="user"]{background:linear-gradient(135deg,#7843df,#5723b8)!important;color:#fff!important;box-shadow:0 7px 18px rgba(109,54,216,.20)!important}
body.comercio-dark main[class*="shell"] [class*="thinking"]{background:#241d28!important;border-color:#403548!important}
body.comercio-dark main[class*="shell"] [class*="quick"]{background:#141017!important}
body.comercio-dark main[class*="shell"] [class*="quick"] button{background:rgba(38,30,43,.90)!important;border-color:#44384b!important;color:#ddd3e2!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.035)!important}
body.comercio-dark main[class*="shell"] [class*="quick"] button:hover{border-color:#8055d5!important;color:#d5c2fb!important;background:rgba(109,54,216,.13)!important}
body.comercio-dark main[class*="shell"] [class*="form"]{background:#1d1721!important;border-color:#3a3040!important}
body.comercio-dark main[class*="shell"] [class*="form"] input{background:#151118!important;border-color:#43384a!important;color:#f7f2f8!important}
body.comercio-dark main[class*="shell"] [class*="form"] input::placeholder{color:#817687!important}
body.comercio-dark main[class*="shell"] [class*="form"] button{background:linear-gradient(135deg,#ff641d,#e94b0d)!important;box-shadow:0 8px 20px rgba(255,100,29,.20)!important}
body.comercio-dark main[class*="shell"] [class*="aiOrder"]{border-top-color:#7a45df!important}
body.comercio-dark main[class*="shell"] [class*="aiOrder"] p{color:#aba0b0!important}
body.comercio-dark main[class*="shell"] [class*="aiOrderMeta"]{background:rgba(109,54,216,.14)!important;border-color:rgba(157,118,232,.24)!important;color:#cdb8f7!important}
body.comercio-dark main[class*="shell"] [class*="aiOrderList"]{background:#171219!important;border-color:#3b3041!important}
body.comercio-dark main[class*="shell"] [class*="aiOrderRow"]{border-color:#332a38!important}
body.comercio-dark main[class*="shell"] [class*="aiOrderRow"] b{background:rgba(255,100,29,.13)!important;color:#ff8a54!important}
body.comercio-dark main[class*="shell"] [class*="aiOrderRow"] span{color:#ece5ef!important}
body.comercio-dark main[class*="shell"] [class*="aiOrderState"]{color:#aaa0ae!important}
body.comercio-dark main[class*="shell"] [class*="aiOrder"] button{background:#211a25!important;border-color:#44384b!important;color:#e9dfee!important}
body.comercio-dark main[class*="shell"] [class*="side"]>div[class*="card"]{background:linear-gradient(145deg,#20191f,#191419)!important;border-color:#513039!important;color:#f7f2f8!important;box-shadow:0 15px 35px rgba(0,0,0,.20)!important}
body.comercio-dark main[class*="shell"] [class*="side"]>div[class*="card"] p{color:#aaa0ae!important}
body.comercio-dark main[class*="shell"] [class*="side"]>div[class*="card"] small{color:#9e929f!important}
body.comercio-dark main[class*="shell"] [class*="side"] [class*="liveFlag"]{background:rgba(109,54,216,.12)!important;border-color:rgba(160,121,235,.24)!important;color:#cbb5f6!important}
body.comercio-dark main[class*="shell"] [class*="side"] [class*="launch"]{background:linear-gradient(135deg,#dc3c45,#b8232c)!important;box-shadow:0 10px 26px rgba(196,39,48,.28)!important}

/* Ayuda humana se monta en un portal: la capa oscura se aplica desde body. */
body.comercio-dark section[aria-labelledby="human-support-title"]{background:#18131b!important;border-color:#3e3344!important;color:#f7f2f8!important}
body.comercio-dark section[aria-labelledby="human-support-title"] [class*="modalHead"]{background:linear-gradient(135deg,rgba(123,37,50,.20),#1b151e 66%)!important;border-color:#46323a!important}
body.comercio-dark section[aria-labelledby="human-support-title"] [class*="modalHead"] h2{color:#f7f2f8!important}
body.comercio-dark section[aria-labelledby="human-support-title"] [class*="modalHead"] p{color:#aaa0ae!important}
body.comercio-dark section[aria-labelledby="human-support-title"] [class*="close"]{background:#241d28!important;border-color:#493d50!important;color:#e8dfea!important}
body.comercio-dark section[aria-labelledby="human-support-title"] [class*="chat"]{background:#18131b!important}
body.comercio-dark section[aria-labelledby="human-support-title"] [class*="context"] small{color:#a79dab!important}
body.comercio-dark section[aria-labelledby="human-support-title"] [class*="messages"]{background:#100d12!important;border-color:#382f3d!important}
body.comercio-dark section[aria-labelledby="human-support-title"] [class*="agent"]{background:#201b2b!important;border-color:#433b61!important;color:#d9d1f0!important}
body.comercio-dark section[aria-labelledby="human-support-title"] [class*="system"]{background:#282116!important;border-color:#51432a!important;color:#e1c98e!important}
body.comercio-dark section[aria-labelledby="human-support-title"] [class*="user"]{background:linear-gradient(135deg,#6d36d8,#4f20aa)!important}
body.comercio-dark section[aria-labelledby="human-support-title"] textarea{background:#211a25!important;border-color:#44384b!important;color:#f7f2f8!important}
body.comercio-dark section[aria-labelledby="human-support-title"] textarea::placeholder{color:#827687!important}
body.comercio-dark section[aria-labelledby="human-support-title"] [class*="form"] button{background:linear-gradient(135deg,#ff641d,#e94b0d)!important}
body.comercio-dark section[aria-labelledby="human-support-title"] [class*="secondary"]{background:#211a25!important;border-color:#44384b!important;color:#ded5e2!important}

/* Finanzas vive fuera del main del POS: detectar su overlay por la grilla de KPIs. */
body.comercio-dark div[class*="overlay"]:has(>div[class*="kpis"]){
  background:radial-gradient(circle at 86% 5%,rgba(109,54,216,.10),transparent 28%),#100d12!important;
  color:#f7f2f8!important;
}
body.comercio-dark div[class*="overlay"]:has(>div[class*="kpis"]) [class*="head"] p{color:#aaa0ae!important}
body.comercio-dark div[class*="overlay"]:has(>div[class*="kpis"]) [class*="head"]>div:first-child>span{color:#ff7b3e!important}
body.comercio-dark div[class*="overlay"]:has(>div[class*="kpis"]) [class*="headActions"] input,
body.comercio-dark div[class*="overlay"]:has(>div[class*="kpis"]) [class*="search"]{background:#211b25!important;border-color:#3e3444!important;color:#f7f2f8!important}
body.comercio-dark div[class*="overlay"]:has(>div[class*="kpis"]) [class*="add"]{background:linear-gradient(135deg,#ff641d,#e94b0d)!important;box-shadow:0 9px 22px rgba(255,100,29,.18)!important}
body.comercio-dark div[class*="overlay"]:has(>div[class*="kpis"]) [class*="close"]{background:#211b25!important;border-color:#3e3444!important;color:#e9dfee!important}
body.comercio-dark div[class*="overlay"]:has(>div[class*="kpis"]) [class*="kpis"]>div,
body.comercio-dark div[class*="overlay"]:has(>div[class*="kpis"]) [class*="panel"]{background:linear-gradient(145deg,#19151c,#171219)!important;border-color:#342c39!important;color:#f7f2f8!important;box-shadow:0 14px 36px rgba(0,0,0,.20)!important}
body.comercio-dark div[class*="overlay"]:has(>div[class*="kpis"]) [class*="kpis"] span,
body.comercio-dark div[class*="overlay"]:has(>div[class*="kpis"]) [class*="kpis"] small,
body.comercio-dark div[class*="overlay"]:has(>div[class*="kpis"]) [class*="panelHead"] small,
body.comercio-dark div[class*="overlay"]:has(>div[class*="kpis"]) [class*="insights"] span{color:#aaa0ae!important}
body.comercio-dark div[class*="overlay"]:has(>div[class*="kpis"]) [class*="chart"]{border-color:#3a303f!important}
body.comercio-dark div[class*="overlay"]:has(>div[class*="kpis"]) [class*="bars"] i:first-child,
body.comercio-dark div[class*="overlay"]:has(>div[class*="kpis"]) [class*="legend"] i:first-of-type{background:#7a45df!important}
body.comercio-dark div[class*="overlay"]:has(>div[class*="kpis"]) [class*="bars"] i:nth-child(2),
body.comercio-dark div[class*="overlay"]:has(>div[class*="kpis"]) [class*="legend"] i:nth-of-type(2){background:#ff641d!important}
body.comercio-dark div[class*="overlay"]:has(>div[class*="kpis"]) [class*="insights"]>div{background:#211b25!important;border-color:#3a303f!important}
body.comercio-dark div[class*="overlay"]:has(>div[class*="kpis"]) [class*="table"]{border-color:#3a303f!important;background:#171219!important}
body.comercio-dark div[class*="overlay"]:has(>div[class*="kpis"]) [class*="rowHead"]{background:#211b25!important;color:#aaa0ae!important}
body.comercio-dark div[class*="overlay"]:has(>div[class*="kpis"]) [class*="row"]{border-color:#302735!important;color:#e9dfee!important}
body.comercio-dark div[class*="overlay"]:has(>div[class*="kpis"]) [class*="row"] small{color:#958a9b!important}
body.comercio-dark div[class*="overlay"]:has(>div[class*="kpis"]) [class*="pending"]{background:rgba(255,100,29,.13)!important;color:#ff9a6b!important}
body.comercio-dark div[class*="overlay"]:has(>div[class*="kpis"]) [class*="paid"]{background:rgba(109,54,216,.14)!important;color:#c5acf5!important}
body.comercio-dark div[class*="overlay"]:has(>div[class*="kpis"]) [class*="trash"]{background:#2b1b20!important;color:#ef8b91!important}
body.comercio-dark div[class*="overlay"]:has(>div[class*="kpis"]) [class*="empty"]{color:#9e94a3!important}
body.comercio-dark div[class*="overlay"]:has(>div[class*="kpis"]) [class*="modal"]{background:rgba(5,4,7,.72)!important;backdrop-filter:blur(8px)!important}
body.comercio-dark div[class*="overlay"]:has(>div[class*="kpis"]) [class*="modalCard"]{background:#19151c!important;border:1px solid #3a303f!important;color:#f7f2f8!important}
body.comercio-dark div[class*="overlay"]:has(>div[class*="kpis"]) [class*="modalCard"] input,
body.comercio-dark div[class*="overlay"]:has(>div[class*="kpis"]) [class*="modalCard"] select{background:#211b25!important;border-color:#403547!important;color:#f7f2f8!important}
body.comercio-dark div[class*="overlay"]:has(>div[class*="kpis"]) [class*="modalCard"] footer>button:first-child{background:#211b25!important;border-color:#403547!important;color:#ded5e2!important}

@media(min-width:1151px){
  main[class*="shell"]>div[class*="layout"]>aside[class*="sidebar"] [class*="mainLabel"],
  main[class*="shell"] [class*="managementLabel"]{font-size:15.5px!important}
}
@media(max-width:1150px) and (min-width:768px){
  main[class*="shell"]>div[class*="layout"]>aside[class*="sidebar"] [class*="mainLabel"],main[class*="shell"] [class*="managementLabel"]{font-size:12.5px!important}
  main[class*="shell"]>div[class*="layout"]>aside[class*="sidebar"] [class*="navButton"]{min-height:54px!important;padding-inline:7px!important}
}
`

export default function DarkExperiencePolish(){
  useEffect(()=>{
    const sync=()=>{
      const shell=document.querySelector('main[class*="shell"]')
      const isDark=Boolean(shell&&String(shell.className).includes('dark'))
      document.body.classList.toggle('comercio-dark',isDark)
    }
    sync()
    const observer=new MutationObserver(sync)
    observer.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['class']})
    return()=>{observer.disconnect();document.body.classList.remove('comercio-dark')}
  },[])
  return <style dangerouslySetInnerHTML={{__html:css}}/>
}
