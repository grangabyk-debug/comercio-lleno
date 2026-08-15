const css=`
/* Escala de legibilidad pensada para mostrador y usuarios mayores. */
main[class*="shell"]{font-size:17px!important}
main[class*="shell"] small{font-size:14px!important;line-height:1.45!important;font-weight:700!important}
main[class*="shell"] p{font-size:15px!important;line-height:1.5!important}
main[class*="shell"] label{font-size:15px!important;line-height:1.4!important;font-weight:800!important}
main[class*="shell"] input,main[class*="shell"] select,main[class*="shell"] textarea{font-size:15px!important;font-weight:700!important}
main[class*="shell"] button{font-size:14.5px!important;font-weight:900!important;line-height:1.12!important}
main[class*="shell"] th,main[class*="shell"] td{font-size:14px!important;line-height:1.45!important}
main[class*="shell"] [class*="navButton"],main[class*="shell"] [class*="managementButton"]{font-size:15px!important;font-weight:900!important}
main[class*="shell"] [class*="mainLabel"],main[class*="shell"] [class*="managementLabel"]{font-size:15.5px!important;font-weight:900!important}
main[class*="shell"] [class*="eyebrow"],main[class*="shell"] [class*="cardKicker"],main[class*="shell"] [class*="checkoutLabel"]{font-size:11.5px!important;font-weight:950!important}
main[class*="shell"] [class*="pageHead"] p{font-size:15px!important;font-weight:700!important}
main[class*="shell"] [class*="panelTitle"] b{font-size:15.5px!important;font-weight:900!important}
main[class*="shell"] [class*="panelTitle"] small{font-size:13px!important}
main[class*="shell"] [class*="recentRow"] b,main[class*="shell"] [class*="productInfo"] b,main[class*="shell"] [class*="cartName"] b{font-size:14px!important;font-weight:900!important}
main[class*="shell"] [class*="recentRow"] small,main[class*="shell"] [class*="productInfo"] small,main[class*="shell"] [class*="cartName"] small{font-size:12.5px!important}
main[class*="shell"] [class*="tableRow"]{font-size:13.5px!important}
main[class*="shell"] [class*="tableHead"]{font-size:12px!important;font-weight:900!important}
main[class*="shell"] [class*="kpi"]>span,main[class*="shell"] [class*="cashStat"]>span{font-size:13px!important;font-weight:800!important}
main[class*="shell"] [class*="cashStat"] strong{font-size:22px!important}
main[class*="shell"] [class*="status"],main[class*="shell"] [class*="headerButton"],main[class*="shell"] [class*="versionPill"]{font-size:12.5px!important}

/* Caja diaria: controles con texto grande y áreas de toque amplias. */
main[class*="shell"] [class*="movementBar"]{gap:11px!important;margin-bottom:17px!important}
main[class*="shell"] [class*="movementButton"]{min-height:50px!important;padding:14px 19px!important;border-radius:14px!important;font-size:15px!important;box-shadow:0 7px 18px rgba(31,20,37,.06)!important}
main[class*="shell"] [class*="actions"] [class*="open"],main[class*="shell"] [class*="actions"] [class*="close"]{min-height:50px!important;padding:13px 19px!important;border-radius:14px!important;font-size:15px!important}
main[class*="shell"] [class*="counterMini"]{padding:20px!important;gap:16px!important;border-radius:20px!important}
main[class*="shell"] [class*="counterMini"] [class*="bill"]{width:58px!important;height:47px!important;font-size:28px!important;border-radius:12px!important}
main[class*="shell"] [class*="counterMini"] b{font-size:16px!important;line-height:1.25!important}
main[class*="shell"] [class*="counterMini"] small{font-size:13px!important;line-height:1.4!important;margin-top:5px!important}
main[class*="shell"] [class*="counterMini"] [class*="use"]{min-height:46px!important;padding:12px 19px!important;font-size:14.5px!important;border-radius:12px!important}
main[class*="shell"] [class*="historyTitle"]{padding:18px 18px 12px!important}
main[class*="shell"] [class*="historyTitle"] b{font-size:17px!important}
main[class*="shell"] [class*="historyTitle"] small{font-size:13px!important;line-height:1.4!important;margin-top:5px!important}
main[class*="shell"] [class*="filtersCompact"]{gap:9px!important;padding:0 16px 14px!important}
main[class*="shell"] [class*="filtersCompact"] input{min-height:46px!important;padding:10px 12px!important;font-size:14px!important;border-radius:11px!important}
main[class*="shell"] [class*="filtersCompact"] [class*="use"]{min-height:46px!important;padding:10px 15px!important;font-size:14px!important;border-radius:11px!important}
main[class*="shell"] [class*="dayRow"]{padding:14px 16px!important;min-height:64px!important}
main[class*="shell"] [class*="dayRow"] b{font-size:14px!important}
main[class*="shell"] [class*="dayRow"] small{font-size:12px!important;margin-top:4px!important}
main[class*="shell"] [class*="dayRow"]>strong{font-size:24px!important}

/* Arqueo rápido: modal legible sin volverlo gigante ni romper la grilla. */
main[class*="shell"] [class*="counterDialog"]{width:min(820px,96vw)!important;padding:24px!important;border-radius:24px!important}
main[class*="shell"] [class*="counterDialog"] [class*="cardHead"] span{font-size:10.5px!important}
main[class*="shell"] [class*="counterDialog"] [class*="cardHead"] h2{font-size:27px!important;line-height:1.08!important;margin:7px 0!important}
main[class*="shell"] [class*="counterDialog"] [class*="cardHead"] p{font-size:15px!important}
main[class*="shell"] [class*="counterHero"]{padding:18px 20px!important;border-radius:18px!important}
main[class*="shell"] [class*="counterHero"] span{font-size:12px!important}
main[class*="shell"] [class*="counterHero"] strong{font-size:36px!important}
main[class*="shell"] [class*="billLarge"]{width:76px!important;height:54px!important;font-size:33px!important;border-radius:13px!important}
main[class*="shell"] [class*="denoms"]{gap:11px!important;margin-top:15px!important}
main[class*="shell"] [class*="denom"]{grid-template-columns:112px 20px 88px 1fr!important;gap:10px!important;padding:12px 13px!important;min-height:58px!important;border-radius:13px!important;font-size:14px!important}
main[class*="shell"] [class*="denom"] b{font-size:14px!important}
main[class*="shell"] [class*="denom"] input{min-height:42px!important;padding:9px 10px!important;font-size:15px!important;border-radius:10px!important}
main[class*="shell"] [class*="counterFoot"]{gap:10px!important;margin:15px 0!important}
main[class*="shell"] [class*="counterFoot"]>div{padding:13px!important;border-radius:13px!important}
main[class*="shell"] [class*="counterFoot"] span{font-size:11.5px!important}
main[class*="shell"] [class*="counterFoot"] b{font-size:16px!important;margin-top:5px!important}
main[class*="shell"] [class*="modalActions"]{gap:10px!important}
main[class*="shell"] [class*="modalActions"] button{min-height:46px!important;padding:12px 17px!important;font-size:14.5px!important;border-radius:12px!important}

@media(max-width:920px){
  main[class*="shell"]{font-size:16px!important}
  main[class*="shell"] small{font-size:13px!important}
  main[class*="shell"] p,main[class*="shell"] label,main[class*="shell"] input,main[class*="shell"] select,main[class*="shell"] textarea{font-size:14px!important}
  main[class*="shell"] button{font-size:14px!important}
}
@media(max-width:700px){
  main[class*="shell"] [class*="counterDialog"]{padding:18px!important}
  main[class*="shell"] [class*="denom"]{grid-template-columns:96px 16px 80px 1fr!important}
}
`

export default function AccessibilityScale(){return <style dangerouslySetInnerHTML={{__html:css}}/>}
