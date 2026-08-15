const css=`
main[class*="shell"]{font-size:16px!important}
main[class*="shell"] small{font-size:13px!important;line-height:1.5!important;font-weight:650!important}
main[class*="shell"] p{font-size:14px!important;line-height:1.55!important}
main[class*="shell"] label{font-size:14px!important;line-height:1.45!important;font-weight:700!important}
main[class*="shell"] input,main[class*="shell"] select,main[class*="shell"] textarea{font-size:14px!important}
main[class*="shell"] button{font-size:13px!important}
main[class*="shell"] th,main[class*="shell"] td{font-size:13.5px!important;line-height:1.45!important}
main[class*="shell"] [class*="navLabel"]{font-size:9px!important;font-weight:800!important;letter-spacing:.16em!important}
main[class*="shell"] [class*="navButton"]{font-size:12.5px!important;font-weight:850!important}
main[class*="shell"] [class*="eyebrow"]{font-size:10.5px!important;font-weight:900!important}
main[class*="shell"] [class*="pageHead"] p{font-size:14.5px!important;font-weight:650!important}
main[class*="shell"] [class*="bottomStats"] span,main[class*="shell"] [class*="statusBar"] span{font-size:11.5px!important;font-weight:800!important}
main[class*="shell"] [class*="versionPill"],main[class*="shell"] [class*="status"]{font-size:11.5px!important;font-weight:850!important}
main[class*="shell"] [class*="notice"],main[class*="shell"] [class*="error"]{font-size:13.5px!important;font-weight:750!important}
main[class*="shell"] [class*="kpi"] span,main[class*="shell"] [class*="metric"] span,main[class*="shell"] [class*="shortcut"] small{font-size:12.5px!important;font-weight:750!important}
@media(max-width:920px){main[class*="shell"]{font-size:15px!important}main[class*="shell"] small{font-size:12.5px!important}main[class*="shell"] p,main[class*="shell"] label,main[class*="shell"] input,main[class*="shell"] select,main[class*="shell"] textarea{font-size:13.5px!important}}
`

export default function ReadabilityBoost(){return <style dangerouslySetInnerHTML={{__html:css}}/>}
