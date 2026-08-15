const css=`
@media(max-width:760px){
  .cl-trial-v2 main[class*="page"]{
    min-height:100dvh!important;
    padding:12px 9px 28px!important;
    overflow:visible!important;
    background:
      radial-gradient(circle at 8% 0%,rgba(255,100,29,.18),transparent 28%),
      radial-gradient(circle at 92% 8%,rgba(109,54,216,.22),transparent 32%),
      linear-gradient(160deg,#17121c 0%,#24172d 58%,#321c35 100%)!important;
  }
  .cl-trial-v2 main[class*="page"]:before{opacity:.08!important}

  .cl-trial-v2 header[class*="top"]{
    max-width:520px!important;
    margin:0 auto 12px!important;
    min-height:58px!important;
    padding:8px 8px 8px 10px!important;
    border-radius:18px!important;
    border:1px solid rgba(255,255,255,.13)!important;
    background:linear-gradient(135deg,rgba(24,18,29,.76),rgba(49,33,57,.68))!important;
    backdrop-filter:blur(22px) saturate(1.16)!important;
    box-shadow:0 14px 34px rgba(0,0,0,.18),inset 0 1px 0 rgba(255,255,255,.08)!important;
  }
  .cl-trial-v2 header[class*="top"] a[class*="brand"]{
    display:inline-flex!important;
    align-items:center!important;
    min-width:0!important;
    transform:scale(.80)!important;
    transform-origin:left center!important;
  }
  .cl-trial-v2 header[class*="top"] a[class*="login"]{
    display:flex!important;
    align-items:center!important;
    justify-content:center!important;
    min-height:40px!important;
    padding:0 12px!important;
    white-space:nowrap!important;
    border-radius:12px!important;
    border:1px solid rgba(255,255,255,.15)!important;
    background:rgba(255,255,255,.09)!important;
    color:#fff!important;
    font-size:10px!important;
    font-weight:900!important;
    box-shadow:inset 0 1px 0 rgba(255,255,255,.08)!important;
    backdrop-filter:blur(14px)!important;
  }

  .cl-trial-v2 section[class*="layout"]{
    max-width:520px!important;
    margin:0 auto!important;
    display:grid!important;
    grid-template-columns:1fr!important;
    gap:12px!important;
  }

  .cl-trial-v2 div[class*="copy"]{
    position:relative!important;
    isolation:isolate!important;
    min-height:0!important;
    height:auto!important;
    margin:0!important;
    padding:22px 17px 17px!important;
    overflow:hidden!important;
    border-radius:26px!important;
    border:1px solid rgba(255,255,255,.15)!important;
    background-image:
      linear-gradient(180deg,rgba(10,7,13,.22) 0%,rgba(13,8,16,.50) 42%,rgba(14,9,17,.92) 100%),
      url('https://images.pexels.com/photos/12935045/pexels-photo-12935045.jpeg?auto=compress&cs=tinysrgb&w=1200')!important;
    background-size:cover!important;
    background-position:center 44%!important;
    box-shadow:0 26px 68px rgba(0,0,0,.28),inset 0 1px 0 rgba(255,255,255,.10)!important;
    color:#fff!important;
  }
  .cl-trial-v2 div[class*="copy"]:before{
    content:""!important;
    position:absolute!important;
    inset:0!important;
    z-index:0!important;
    pointer-events:none!important;
    opacity:1!important;
    background:
      radial-gradient(circle at 90% 8%,rgba(111,53,221,.28),transparent 30%),
      radial-gradient(circle at 8% 85%,rgba(255,100,29,.20),transparent 28%)!important;
  }
  .cl-trial-v2 div[class*="copy"]>*{position:relative!important;z-index:1!important}
  .cl-trial-v2 div[class*="eyebrow"]{
    display:inline-flex!important;
    align-items:center!important;
    min-height:29px!important;
    width:max-content!important;
    padding:0 10px!important;
    border-radius:999px!important;
    background:rgba(255,255,255,.11)!important;
    border:1px solid rgba(255,255,255,.18)!important;
    color:#ffb18d!important;
    font-size:9px!important;
    font-weight:950!important;
    letter-spacing:.14em!important;
    backdrop-filter:blur(14px)!important;
  }
  .cl-trial-v2 div[class*="copy"] h1{
    max-width:335px!important;
    margin:14px 0 11px!important;
    font-size:37px!important;
    line-height:.95!important;
    letter-spacing:-2px!important;
    color:#fff!important;
    text-shadow:0 4px 22px rgba(0,0,0,.32)!important;
  }
  .cl-trial-v2 div[class*="copy"]>p{
    max-width:360px!important;
    margin:0!important;
    font-size:13px!important;
    line-height:1.48!important;
    font-weight:650!important;
    color:rgba(255,255,255,.88)!important;
    text-shadow:0 2px 12px rgba(0,0,0,.22)!important;
  }

  .cl-trial-v2 div[class*="benefits"]{
    display:grid!important;
    gap:8px!important;
    margin-top:16px!important;
  }
  .cl-trial-v2 div[class*="benefit"]{
    min-height:50px!important;
    box-sizing:border-box!important;
    padding:8px 10px!important;
    border-radius:16px!important;
    background:linear-gradient(135deg,rgba(28,21,33,.72),rgba(46,34,52,.58))!important;
    border:1px solid rgba(255,255,255,.12)!important;
    color:#fff!important;
    font-size:11px!important;
    font-weight:820!important;
    backdrop-filter:blur(18px) saturate(1.14)!important;
    box-shadow:0 8px 20px rgba(0,0,0,.11),inset 0 1px 0 rgba(255,255,255,.07)!important;
  }
  .cl-trial-v2 div[class*="benefit"] i{
    width:31px!important;
    height:31px!important;
    flex:0 0 31px!important;
    border:0!important;
    border-radius:11px!important;
    background:linear-gradient(135deg,#ff641d,#ff8844)!important;
    color:#fff!important;
    box-shadow:0 8px 18px rgba(255,100,29,.24)!important;
  }

  .cl-trial-v2 div[class*="price"]{
    margin-top:13px!important;
    padding:15px 16px!important;
    border-radius:18px!important;
    border:1px solid rgba(255,255,255,.14)!important;
    background:linear-gradient(135deg,rgba(24,17,29,.84),rgba(52,34,62,.78))!important;
    backdrop-filter:blur(20px)!important;
    box-shadow:0 14px 32px rgba(0,0,0,.18),inset 0 1px 0 rgba(255,255,255,.07)!important;
  }
  .cl-trial-v2 div[class*="price"] del{font-size:14px!important;color:#d1c5d4!important}
  .cl-trial-v2 div[class*="price"] b{display:inline-block!important;font-size:29px!important;letter-spacing:-1.1px!important;color:#fff!important}
  .cl-trial-v2 div[class*="price"] span{display:inline!important;margin-left:5px!important;font-size:9.5px!important;line-height:1.35!important;color:#e8dfea!important}
  .cl-trial-v2 div[class*="price"] small{font-size:9.5px!important;line-height:1.42!important;color:#d4c8d7!important}

  .cl-trial-v2 div[class*="card"]{
    margin:0!important;
    padding:20px 16px 18px!important;
    border-radius:26px!important;
    border:1px solid rgba(255,255,255,.70)!important;
    background:
      radial-gradient(circle at 95% 0%,rgba(109,54,216,.07),transparent 24%),
      radial-gradient(circle at 3% 100%,rgba(255,100,29,.055),transparent 25%),
      linear-gradient(160deg,rgba(255,255,255,.98),rgba(249,246,251,.96))!important;
    box-shadow:0 24px 64px rgba(0,0,0,.23),inset 0 1px 0 rgba(255,255,255,.98)!important;
    backdrop-filter:blur(24px) saturate(1.12)!important;
  }
  .cl-trial-v2 div[class*="card"]>div:first-child{margin-bottom:12px!important}
  .cl-trial-v2 div[class*="progressBars"]{gap:6px!important;margin-bottom:14px!important}
  .cl-trial-v2 div[class*="progressBars"] span{height:7px!important;border-radius:999px!important;background:#e8e0eb!important}
  .cl-trial-v2 div[class*="progressBars"] span[data-active="true"]{
    background:linear-gradient(90deg,#ff641d,#7839e4)!important;
    box-shadow:0 4px 12px rgba(109,54,216,.14)!important;
  }
  .cl-trial-v2 div[class*="card"] h2{font-size:29px!important;line-height:1!important;letter-spacing:-1.15px!important;margin:14px 0 8px!important;color:#211924!important}
  .cl-trial-v2 div[class*="card"]>p{font-size:12.5px!important;line-height:1.46!important;margin-bottom:18px!important;color:#706674!important}

  .cl-trial-v2 form[class*="form"],.cl-trial-v2 div[class*="form"]{gap:13px!important}
  .cl-trial-v2 label[class*="label"]{gap:7px!important;font-size:12px!important;font-weight:900!important;color:#4d4250!important}
  .cl-trial-v2 input[class*="input"],.cl-trial-v2 select[class*="input"]{
    min-height:50px!important;
    padding:0 13px!important;
    border-radius:14px!important;
    border:1px solid #ddd3e1!important;
    background:rgba(255,255,255,.91)!important;
    color:#211a24!important;
    font-size:14px!important;
    box-shadow:inset 0 1px 0 rgba(255,255,255,.98),0 7px 18px rgba(53,34,63,.035)!important;
  }
  .cl-trial-v2 input[class*="input"]:focus,.cl-trial-v2 select[class*="input"]:focus{
    border-color:#8b63de!important;
    box-shadow:0 0 0 4px rgba(109,54,216,.09)!important;
  }
  .cl-trial-v2 div[class*="phoneField"]{min-height:50px!important;border-radius:14px!important;border-color:#ddd3e1!important;background:rgba(255,255,255,.91)!important}
  .cl-trial-v2 div[class*="phoneField"] span{background:#f2edf6!important;color:#4f3a58!important}
  .cl-trial-v2 div[class*="challenge"]{padding:12px!important;border-radius:15px!important;background:rgba(247,243,249,.88)!important;border-color:#e1d8e5!important}

  .cl-trial-v2 button[class*="button"]{
    min-height:55px!important;
    border-radius:16px!important;
    font-size:14px!important;
    font-weight:950!important;
    background:linear-gradient(100deg,#7538e6 0%,#8b3bd2 48%,#ff641d 100%)!important;
    box-shadow:0 14px 28px rgba(104,49,153,.19),inset 0 1px 0 rgba(255,255,255,.18)!important;
  }
  .cl-trial-v2 button[class*="secondaryButton"]{min-height:50px!important;border-radius:14px!important}
  .cl-trial-v2 button[class*="optionalAdd"]{border-radius:16px!important}
  .cl-trial-v2 div[class*="security"]{border-radius:15px!important;background:linear-gradient(135deg,#fff2ea,#f1eaff)!important}
}
@media(max-width:390px){
  .cl-trial-v2 main[class*="page"]{padding-left:7px!important;padding-right:7px!important}
  .cl-trial-v2 div[class*="copy"]{padding:20px 15px 16px!important;border-radius:23px!important}
  .cl-trial-v2 div[class*="copy"] h1{font-size:34px!important}
  .cl-trial-v2 div[class*="card"]{padding:18px 14px 17px!important;border-radius:23px!important}
}
`

export default function TrialMobileFixV2(){return <style dangerouslySetInnerHTML={{__html:css}}/>}
