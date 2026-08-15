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

/* Nueva venta: productos y resultados claramente visibles. */
main[class*="shell"] [class*="resultRow"]{min-height:68px!important;padding:14px 16px!important;gap:14px!important}
main[class*="shell"] [class*="resultIcon"]{width:46px!important;height:46px!important;border-radius:13px!important}
main[class*="shell"] [class*="resultInfo"] b{font-size:16px!important;font-weight:950!important}
main[class*="shell"] [class*="resultInfo"] small{font-size:12.5px!important;margin-top:4px!important}
main[class*="shell"] [class*="resultStock"]{font-size:12.5px!important;font-weight:800!important}
main[class*="shell"] [class*="resultPrice"]{font-size:17px!important;font-weight:950!important}
main[class*="shell"] [class*="cartLine"]{min-height:74px!important;padding:13px 7px!important;gap:16px!important}
main[class*="shell"] [class*="cartProduct"] b{font-size:17px!important;font-weight:950!important;line-height:1.2!important}
main[class*="shell"] [class*="cartProduct"] small{font-size:13px!important;margin-top:5px!important}
main[class*="shell"] [class*="qty"]{gap:8px!important}
main[class*="shell"] [class*="qty"] button{width:38px!important;height:38px!important;border-radius:10px!important;font-size:18px!important}
main[class*="shell"] [class*="qty"] b{font-size:15px!important;min-width:27px!important}
main[class*="shell"] [class*="lineTotal"]{font-size:17px!important;font-weight:950!important}
main[class*="shell"] [class*="cartLabel"]{font-size:11.5px!important;padding:12px 16px!important}

/* Caja diaria: controles con texto grande y áreas de toque amplias. */
main[class*="shell"] [class*="movementBar"]{gap:11px!important;margin-bottom:17px!important}
main[class*="shell"] [class*="movementButton"]{min-height:52px!important;padding:14px 20px!important;border-radius:14px!important;font-size:15.5px!important;box-shadow:0 7px 18px rgba(31,20,37,.06)!important}
main[class*="shell"] [class*="actions"] [class*="open"],main[class*="shell"] [class*="actions"] [class*="close"]{min-height:52px!important;padding:14px 20px!important;border-radius:14px!important;font-size:15.5px!important}
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

/* Arqueo rápido: se distinguen el contenedor .denoms y cada .denom para evitar colisiones. */
main[class*="shell"] [class*="counterDialog"]{width:min(860px,96vw)!important;padding:25px!important;border-radius:25px!important}
main[class*="shell"] [class*="counterDialog"] [class*="cardHead"] span{font-size:11px!important}
main[class*="shell"] [class*="counterDialog"] [class*="cardHead"] h2{font-size:29px!important;line-height:1.06!important;margin:7px 0!important}
main[class*="shell"] [class*="counterDialog"] [class*="cardHead"] p{font-size:15.5px!important}
main[class*="shell"] [class*="counterHero"]{padding:19px 21px!important;border-radius:19px!important}
main[class*="shell"] [class*="counterHero"] span{font-size:12.5px!important}
main[class*="shell"] [class*="counterHero"] strong{font-size:38px!important}
main[class*="shell"] [class*="billLarge"]{width:78px!important;height:56px!important;font-size:34px!important;border-radius:14px!important}
main[class*="shell"] [class*="counterDialog"] [class*="denoms"]{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:11px!important;margin-top:15px!important}
main[class*="shell"] [class*="counterDialog"] [class*="denoms"]>[class*="denom"]{display:grid!important;grid-template-columns:minmax(94px,112px) 18px minmax(78px,88px) minmax(80px,1fr)!important;gap:10px!important;align-items:center!important;padding:12px 13px!important;min-height:60px!important;border-radius:14px!important;font-size:14px!important;overflow:hidden!important}
main[class*="shell"] [class*="counterDialog"] [class*="denoms"]>[class*="denom"]>b:first-child{font-size:15px!important;font-weight:950!important;white-space:nowrap!important}
main[class*="shell"] [class*="counterDialog"] [class*="denoms"]>[class*="denom"]>span{font-size:14px!important;text-align:center!important}
main[class*="shell"] [class*="counterDialog"] [class*="denoms"]>[class*="denom"] input{width:100%!important;min-width:0!important;box-sizing:border-box!important;min-height:42px!important;padding:9px 10px!important;font-size:15px!important;border-radius:10px!important}
main[class*="shell"] [class*="counterDialog"] [class*="denoms"]>[class*="denom"]>b:last-child{font-size:14px!important;font-weight:950!important;text-align:right!important;white-space:nowrap!important}
main[class*="shell"] [class*="counterFoot"]{gap:10px!important;margin:15px 0!important}
main[class*="shell"] [class*="counterFoot"]>div{padding:13px!important;border-radius:13px!important}
main[class*="shell"] [class*="counterFoot"] span{font-size:11.5px!important}
main[class*="shell"] [class*="counterFoot"] b{font-size:16px!important;margin-top:5px!important}
main[class*="shell"] [class*="modalActions"]{gap:10px!important}
main[class*="shell"] [class*="modalActions"] button{min-height:48px!important;padding:12px 18px!important;font-size:15px!important;border-radius:12px!important}

@media(max-width:920px){
  main[class*="shell"]{font-size:16px!important}
  main[class*="shell"] small{font-size:13px!important}
  main[class*="shell"] p,main[class*="shell"] label,main[class*="shell"] input,main[class*="shell"] select,main[class*="shell"] textarea{font-size:14px!important}
  main[class*="shell"] button{font-size:14px!important}
  main[class*="shell"] [class*="counterDialog"] [class*="denoms"]{grid-template-columns:1fr!important}
}
@media(max-width:700px){
  main[class*="shell"] [class*="counterDialog"]{padding:18px!important}
  main[class*="shell"] [class*="counterDialog"] [class*="denoms"]>[class*="denom"]{grid-template-columns:92px 16px minmax(70px,82px) 1fr!important;padding:11px!important}
  main[class*="shell"] [class*="cartProduct"] b{font-size:16px!important}
  main[class*="shell"] [class*="lineTotal"]{font-size:16px!important}
}
`

export default function AccessibilityScale(){return <style dangerouslySetInnerHTML={{__html:css}}/>}
