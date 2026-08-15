const css=`
main[class*="loginScreen"]{background:radial-gradient(circle at 85% 5%,rgba(109,54,216,.22),transparent 34%),linear-gradient(160deg,#17121c 0%,#24172d 52%,#3a1e34 100%)!important}
main[class*="loginScreen"] [class*="loginCard"]{border-radius:22px!important;border:1px solid rgba(255,255,255,.12)!important;box-shadow:0 30px 80px rgba(0,0,0,.32)!important}
main[class*="loginScreen"] [class*="logo"]{background:linear-gradient(145deg,#ff641d,#6d36d8)!important}
main[class*="loginScreen"] [class*="previewTag"]{background:#f2ebff!important;color:#6d36d8!important}
main[class*="loginScreen"] [class*="loginButton"]{background:#ff641d!important;box-shadow:0 12px 28px rgba(255,100,29,.25)!important}
main[class*="app"]{background:#eee9f1!important;color:#1c1720!important}
main[class*="app"] [class*="phoneShell"]{background:#fbf9fc!important;box-shadow:0 0 70px rgba(37,22,45,.14)!important}
main[class*="app"] [class*="topbar"]{height:68px!important;background:rgba(23,18,28,.98)!important;border-bottom:1px solid #34283b!important;color:#fff!important;backdrop-filter:blur(18px)!important}
main[class*="app"] [class*="brandBlock"] b{font-size:15px!important;color:#fff!important}
main[class*="app"] [class*="brandBlock"] span{color:#aca1b2!important}
main[class*="app"] [class*="logoSmall"]{background:linear-gradient(145deg,#ff641d,#6d36d8)!important;border-radius:11px!important;box-shadow:0 8px 20px rgba(109,54,216,.24)!important}
main[class*="app"] [class*="settingsButton"]{background:#281e2e!important;border-color:#3d3044!important;color:#fff!important}
main[class*="app"] [class*="planStrip"]{height:31px!important;background:#6d36d8!important;border:0!important}
main[class*="app"] [class*="planStrip"] span{color:#fff!important;letter-spacing:.13em!important}
main[class*="app"] [class*="content"]{padding:15px 13px 26px!important}
main[class*="app"] [class*="greeting"]{padding:11px 3px 16px!important}
main[class*="app"] [class*="greeting"]>div:first-child>span{color:#ff641d!important}
main[class*="app"] [class*="greeting"] h1{font-size:39px!important;color:#31213b!important;letter-spacing:-.06em!important}
main[class*="app"] [class*="autoCash"]{background:#17121c!important;border-color:#17121c!important;color:#fff!important;border-radius:11px!important}
main[class*="app"] [class*="autoCash"] i{background:#6d36d8!important}
main[class*="app"] [class*="saleHero"]{min-height:92px!important;grid-template-columns:54px 1fr 18px!important;border-radius:17px!important;background:#ff641d!important;box-shadow:0 16px 32px rgba(255,100,29,.27)!important}
main[class*="app"] [class*="saleHero"] [class*="plus"]{background:rgba(255,255,255,.17)!important;border-radius:13px!important}
main[class*="app"] [class*="saleHero"] b{font-size:18px!important}
main[class*="app"] [class*="bigGrid"]{gap:9px!important}
main[class*="app"] [class*="bigAction"]{min-height:124px!important;border-radius:14px!important;border-color:#e3dce6!important;box-shadow:none!important}
main[class*="app"] [class*="bigAction"]:first-child{background:#f2ebff!important;border-color:#ded1f2!important}
main[class*="app"] [class*="bigAction"]:first-child [class*="actionIcon"]{background:#6d36d8!important;color:#fff!important}
main[class*="app"] [class*="bigAction"]:nth-child(2) [class*="actionIcon"]{background:#fff0e7!important;color:#ff641d!important}
main[class*="app"] [class*="summaryCard"],main[class*="app"] [class*="settingsCard"]{border-radius:14px!important;border-color:#e3dde6!important;box-shadow:none!important}
main[class*="app"] [class*="cardHead"] span,main[class*="app"] [class*="settingInfo"]>span{color:#6d36d8!important}
main[class*="app"] [class*="cardHead"] button{color:#ff641d!important}
main[class*="app"] [class*="sectionHead"] span{color:#ff641d!important}
main[class*="app"] [class*="sectionHead"] h2{font-size:23px!important;color:#251c2a!important}
main[class*="app"] [class*="cartCount"],main[class*="app"] [class*="countBubble"],main[class*="app"] [class*="autoMini"],main[class*="app"] [class*="settingsMini"]{background:#f2ebff!important;color:#6d36d8!important}
main[class*="app"] [class*="searchBox"]{border-radius:12px!important;border-color:#ddd4e1!important;box-shadow:none!important}
main[class*="app"] [class*="productItem"],main[class*="app"] [class*="catalogRow"]{border-radius:11px!important;border-color:#e5dfe7!important}
main[class*="app"] [class*="productItem"]>span{background:#fff0e7!important;color:#ff641d!important}
main[class*="app"] [class*="createProductButton"]{background:#6d36d8!important;color:#fff!important;border-color:#6d36d8!important;box-shadow:none!important}
main[class*="app"] [class*="cartCard"]{border-radius:14px!important;border-color:#dfd8e2!important}
main[class*="app"] [class*="paymentActive"]{border-color:#6d36d8!important;background:#f2ebff!important;color:#5b2fb0!important}
main[class*="app"] [class*="invoiceButton"],main[class*="app"] [class*="saveProduct"]{background:#ff641d!important;box-shadow:0 10px 24px rgba(255,100,29,.2)!important}
main[class*="app"] [class*="cashHero"]{background:linear-gradient(135deg,#17121c 0%,#3d2447 68%,#6d36d8 100%)!important;border-radius:16px!important}
main[class*="app"] [class*="cashHero"] h2{color:#fff!important}
main[class*="app"] [class*="switchOn"]{background:#6d36d8!important}
main[class*="app"] [class*="bottomNav"]{height:76px!important;background:rgba(23,18,28,.98)!important;border-top:1px solid #3a2d42!important;box-shadow:0 -10px 28px rgba(23,18,28,.16)!important;padding:6px 7px max(6px,env(safe-area-inset-bottom))!important}
main[class*="app"] [class*="bottomNav"] button{color:#9f93a6!important;border-radius:11px!important}
main[class*="app"] [class*="bottomNav"] [class*="navActive"]{background:#2a2030!important;color:#fff!important}
main[class*="app"] [class*="bottomNav"] button:nth-child(2){background:#ff641d!important;color:#fff!important;margin:-15px 3px 4px!important;box-shadow:0 10px 22px rgba(255,100,29,.27)!important;border-radius:15px!important}
main[class*="app"] [class*="bottomNav"] button:nth-child(2) span{font-size:22px!important}
main[class*="app"] [class*="bottomNav"] [class*="logoutNav"]{color:#d79fa1!important}
main[class*="app"] [class*="toast"]{background:#6d36d8!important;color:#fff!important}
main[class*="app"] [class*="modalCard"]{border-radius:20px!important;border-top:4px solid #ff641d!important}
[class*="overlay"] [class*="shell"]{background:#fbf9fc!important}
[class*="overlay"] [class*="header"]{background:#17121c!important;border-color:#34283b!important;color:#fff!important}
[class*="overlay"] [class*="header"] span{color:#b2a7b8!important}
[class*="overlay"] [class*="header"] [class*="back"],[class*="overlay"] [class*="header"] [class*="close"]{background:#281e2e!important;border-color:#3d3044!important;color:#fff!important}
[class*="overlay"] [class*="hero"]{background:linear-gradient(135deg,#f2ebff,#fff0e7)!important;border-color:#e0d5e5!important}
[class*="overlay"] [class*="menuIcon"]{background:#f2ebff!important;color:#6d36d8!important}
[class*="overlay"] [class*="primary"]{background:#ff641d!important;box-shadow:0 9px 20px rgba(255,100,29,.18)!important}
[class*="overlay"] [class*="secondary"]{color:#6d36d8!important}
[class*="overlay"] [class*="switchOn"]{background:#6d36d8!important}
[class*="overlay"] [class*="selected"]{border-color:#6d36d8!important;background:#f2ebff!important;color:#5b2fb0!important}
@media(max-width:380px){main[class*="app"] [class*="greeting"] h1{font-size:35px!important}main[class*="app"] [class*="saleHero"]{min-height:86px!important}}
`

export default function MobileRevolutionTheme(){return <style dangerouslySetInnerHTML={{__html:css}}/>}
