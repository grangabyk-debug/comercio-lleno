const css=`
main[class*="loginScreen"]{background:linear-gradient(160deg,#17121c 0%,#24172d 58%,#4a2543 100%)!important}
main[class*="loginScreen"] [class*="loginCard"]{border-radius:18px!important;border:1px solid rgba(255,255,255,.13)!important;box-shadow:0 28px 80px rgba(0,0,0,.3)!important}
main[class*="loginScreen"] [class*="logo"]{background:#ff641d!important;border-radius:9px!important}
main[class*="loginScreen"] [class*="previewTag"]{background:#f2ebff!important;color:#6d36d8!important;border-radius:6px!important}
main[class*="loginScreen"] [class*="loginButton"]{background:#ff641d!important;border-radius:9px!important;box-shadow:none!important}
main[class*="app"]{background:#ece8ef!important;color:#211a24!important;font-family:"Avenir Next","Segoe UI Variable",Inter,ui-sans-serif,system-ui,sans-serif!important}
main[class*="app"] [class*="phoneShell"]{background:#fbf9fc!important;box-shadow:0 0 60px rgba(37,22,45,.1)!important}
main[class*="app"] [class*="topbar"]{height:64px!important;background:rgba(255,255,255,.98)!important;border-bottom:1px solid #e5dfe8!important;color:#211a24!important;backdrop-filter:blur(18px)!important;position:sticky!important}
main[class*="app"] [class*="topbar"]:before{content:"";position:absolute;left:0;right:0;top:0;height:2px;background:linear-gradient(90deg,#ff641d 0 40%,#6d36d8 40% 100%)}
main[class*="app"] [class*="brandBlock"] b{font-size:15px!important;color:#211a24!important;letter-spacing:-.25px!important}
main[class*="app"] [class*="brandBlock"] span{color:#8a818d!important}
main[class*="app"] [class*="logoSmall"]{background:#ff641d!important;border-radius:9px!important;box-shadow:none!important}
main[class*="app"] [class*="settingsButton"]{background:#fff!important;border-color:#e1d9e4!important;color:#5f5663!important;border-radius:9px!important}
main[class*="app"] [class*="planStrip"]{height:29px!important;background:#f3eef8!important;border-bottom:1px solid #e6deeb!important}
main[class*="app"] [class*="planStrip"] span{color:#6d36d8!important;letter-spacing:.13em!important}
main[class*="app"] [class*="content"]{padding:15px 13px 26px!important}
main[class*="app"] [class*="greeting"]{padding:10px 3px 16px!important}
main[class*="app"] [class*="greeting"]>div:first-child>span{color:#ff641d!important}
main[class*="app"] [class*="greeting"] h1{font-size:38px!important;color:#2a202e!important;letter-spacing:-.06em!important}
main[class*="app"] [class*="autoCash"]{background:#fff!important;border-color:#e3dde6!important;color:#4c4350!important;border-radius:10px!important;box-shadow:none!important}
main[class*="app"] [class*="autoCash"] i{background:#6d36d8!important}
main[class*="app"] [class*="saleHero"]{min-height:88px!important;grid-template-columns:52px 1fr 18px!important;border-radius:14px!important;background:#ff641d!important;box-shadow:0 13px 28px rgba(255,100,29,.2)!important}
main[class*="app"] [class*="saleHero"] [class*="plus"]{background:rgba(255,255,255,.16)!important;border-radius:10px!important;width:50px!important;height:50px!important}
main[class*="app"] [class*="saleHero"] b{font-size:18px!important}
main[class*="app"] [class*="bigGrid"]{gap:9px!important}
main[class*="app"] [class*="bigAction"]{min-height:118px!important;border-radius:11px!important;border-color:#e4dee7!important;box-shadow:none!important}
main[class*="app"] [class*="bigAction"]:first-child{background:#f3edfb!important;border-color:#e0d5f0!important}
main[class*="app"] [class*="bigAction"]:first-child [class*="actionIcon"]{background:#6d36d8!important;color:#fff!important;border-radius:8px!important}
main[class*="app"] [class*="bigAction"]:nth-child(2){background:#fff!important}
main[class*="app"] [class*="bigAction"]:nth-child(2) [class*="actionIcon"]{background:#fff0e7!important;color:#ff641d!important;border-radius:8px!important}
main[class*="app"] [class*="summaryCard"],main[class*="app"] [class*="settingsCard"]{border-radius:11px!important;border-color:#e4dee7!important;box-shadow:none!important}
main[class*="app"] [class*="cardHead"] span,main[class*="app"] [class*="settingInfo"]>span{color:#6d36d8!important}
main[class*="app"] [class*="cardHead"] button{color:#ff641d!important}
main[class*="app"] [class*="sectionHead"] span{color:#ff641d!important}
main[class*="app"] [class*="sectionHead"] h2{font-size:23px!important;color:#251c2a!important;letter-spacing:-.5px!important}
main[class*="app"] [class*="sectionHead"]>button{border-radius:9px!important;box-shadow:none!important}
main[class*="app"] [class*="cartCount"],main[class*="app"] [class*="countBubble"],main[class*="app"] [class*="autoMini"],main[class*="app"] [class*="settingsMini"]{background:#f2ebff!important;color:#6d36d8!important;border-radius:8px!important}
main[class*="app"] [class*="searchBox"]{border-radius:9px!important;border-color:#ddd5e1!important;box-shadow:none!important}
main[class*="app"] [class*="productItem"],main[class*="app"] [class*="catalogRow"]{border-radius:9px!important;border-color:#e5dfe7!important}
main[class*="app"] [class*="productItem"]>span{background:#fff0e7!important;color:#ff641d!important;border-radius:7px!important}
main[class*="app"] [class*="createProductButton"]{background:#6d36d8!important;color:#fff!important;border-color:#6d36d8!important;box-shadow:none!important;border-radius:9px!important}
main[class*="app"] [class*="cartCard"]{border-radius:11px!important;border-color:#dfd8e2!important}
main[class*="app"] [class*="paymentActive"]{border-color:#a98cdd!important;background:#f2ebff!important;color:#5b2fb0!important}
main[class*="app"] [class*="invoiceButton"],main[class*="app"] [class*="saveProduct"]{background:#ff641d!important;box-shadow:none!important;border-radius:9px!important}
main[class*="app"] [class*="cashHero"]{background:#17121c!important;border-radius:12px!important}
main[class*="app"] [class*="cashHero"] h2{color:#fff!important}
main[class*="app"] [class*="switchOn"]{background:#6d36d8!important}
main[class*="app"] [class*="bottomNav"]{height:74px!important;background:rgba(255,255,255,.98)!important;border-top:1px solid #dfd8e2!important;box-shadow:0 -9px 26px rgba(38,22,46,.08)!important;padding:6px 7px max(6px,env(safe-area-inset-bottom))!important}
main[class*="app"] [class*="bottomNav"] button{color:#817885!important;border-radius:9px!important}
main[class*="app"] [class*="bottomNav"] [class*="navActive"]{background:#f3edfb!important;color:#6d36d8!important}
main[class*="app"] [class*="bottomNav"] button:nth-child(2){background:#ff641d!important;color:#fff!important;margin:-13px 3px 4px!important;box-shadow:0 9px 20px rgba(255,100,29,.22)!important;border-radius:12px!important}
main[class*="app"] [class*="bottomNav"] button:nth-child(2) span{font-size:22px!important}
main[class*="app"] [class*="bottomNav"] [class*="logoutNav"]{color:#a85b60!important}
main[class*="app"] [class*="toast"]{background:#6d36d8!important;color:#fff!important;border-radius:8px!important}
main[class*="app"] [class*="modalCard"]{border-radius:16px 16px 0 0!important;border-top:3px solid #ff641d!important}
[class*="overlay"]{background:#f1edf3!important;color:#211a24!important;font-family:"Avenir Next","Segoe UI Variable",Inter,ui-sans-serif,system-ui,sans-serif!important}
[class*="overlay"] [class*="shell"]{background:#fbf9fc!important;box-shadow:0 0 55px rgba(37,22,45,.1)!important}
[class*="overlay"] [class*="header"]{background:#fff!important;border-color:#e4dee7!important;color:#211a24!important;height:64px!important}
[class*="overlay"] [class*="header"]:before{content:"";position:absolute;left:0;right:0;top:0;height:2px;background:linear-gradient(90deg,#ff641d,#6d36d8)}
[class*="overlay"] [class*="header"] span{color:#8b828e!important}
[class*="overlay"] [class*="header"] [class*="back"],[class*="overlay"] [class*="header"] [class*="close"]{background:#fff!important;border-color:#e0d9e3!important;color:#5d5461!important;border-radius:9px!important}
[class*="overlay"] [class*="hero"]{background:#fff!important;border-color:#e2dbe5!important;border-radius:11px!important;box-shadow:none!important;border-left:3px solid #6d36d8!important}
[class*="overlay"] [class*="hero"] i{background:#fff0e7!important;color:#d95114!important;border-radius:6px!important}
[class*="overlay"] [class*="menu"]{gap:6px!important}
[class*="overlay"] [class*="menuItem"]{border-radius:9px!important;border-color:#e4dee7!important;box-shadow:none!important;padding:11px!important}
[class*="overlay"] [class*="menuIcon"]{background:#f2ebff!important;color:#6d36d8!important;border-radius:8px!important}
[class*="overlay"] [class*="card"]{border-radius:11px!important;border-color:#e3dde6!important;box-shadow:none!important}
[class*="overlay"] [class*="fields"] input,[class*="overlay"] [class*="field"] input,[class*="overlay"] [class*="newBranch"] input{border-radius:8px!important}
[class*="overlay"] [class*="subCard"],[class*="overlay"] [class*="lines"],[class*="overlay"] [class*="newBranch"]{border-radius:9px!important}
[class*="overlay"] [class*="primary"]{background:#ff641d!important;box-shadow:none!important;border-radius:8px!important}
[class*="overlay"] [class*="secondary"]{color:#6d36d8!important;border-radius:8px!important}
[class*="overlay"] [class*="switchOn"]{background:#6d36d8!important}
[class*="overlay"] [class*="selected"]{border-color:#9d7bd8!important;background:#f2ebff!important;color:#5b2fb0!important}
@media(max-width:380px){main[class*="app"] [class*="greeting"] h1{font-size:34px!important}main[class*="app"] [class*="saleHero"]{min-height:84px!important}}
`

export default function MobileRevolutionTheme(){return <style dangerouslySetInnerHTML={{__html:css}}/>}
