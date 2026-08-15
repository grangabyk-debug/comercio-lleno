const css=`
@media(max-width:760px){
  main[class*="app"] header[class*="topbar"]{
    min-height:70px!important;
    height:70px!important;
    padding:10px 14px!important;
    display:flex!important;
    align-items:center!important;
    justify-content:space-between!important;
    gap:12px!important;
    background:rgba(255,255,255,.82)!important;
    border-bottom:1px solid rgba(77,54,89,.10)!important;
    backdrop-filter:blur(24px) saturate(1.18)!important;
    box-shadow:0 10px 30px rgba(45,28,55,.07)!important;
  }
  main[class*="app"] header[class*="topbar"]:before{
    content:""!important;
    position:absolute!important;
    left:0!important;right:0!important;top:0!important;
    height:3px!important;
    background:linear-gradient(90deg,#ff641d 0 35%,#6d36d8 35% 72%,#ffb31f 72% 100%)!important;
  }
  main[class*="app"] header[class*="topbar"] [class*="brandBlock"]{
    display:flex!important;
    align-items:center!important;
    flex:1 1 auto!important;
    min-width:0!important;
    gap:0!important;
    overflow:visible!important;
  }
  main[class*="app"] header[class*="topbar"] [class*="brandBlock"]>*{
    display:none!important;
  }
  main[class*="app"] header[class*="topbar"] [class*="brandBlock"]:before{
    content:"ComercioLleno.com"!important;
    display:block!important;
    white-space:nowrap!important;
    font-family:"Arial Black","Avenir Next",Inter,ui-sans-serif,system-ui,sans-serif!important;
    font-size:22px!important;
    line-height:1!important;
    font-weight:950!important;
    letter-spacing:-.075em!important;
    background:linear-gradient(90deg,#111014 0 48%,#6429e8 48% 77%,#ff641d 77% 100%)!important;
    -webkit-background-clip:text!important;
    background-clip:text!important;
    color:transparent!important;
  }
  main[class*="app"] header[class*="topbar"] [class*="settingsButton"]{
    flex:0 0 44px!important;
    width:44px!important;
    height:44px!important;
    border-radius:14px!important;
    background:rgba(255,255,255,.76)!important;
    border:1px solid rgba(91,66,103,.13)!important;
    color:#4f4454!important;
    box-shadow:0 10px 24px rgba(43,27,52,.08),inset 0 1px 0 rgba(255,255,255,.96)!important;
    backdrop-filter:blur(16px)!important;
  }
}
@media(max-width:380px){
  main[class*="app"] header[class*="topbar"] [class*="brandBlock"]:before{font-size:19px!important}
}
`

export default function MobileBrandHeaderOverride(){return <style dangerouslySetInnerHTML={{__html:css}}/>}
