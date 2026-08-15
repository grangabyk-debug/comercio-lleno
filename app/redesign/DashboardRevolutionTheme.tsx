const css=`
main[class*="shell"]{--bg:#f7f5f8;--surface:#fff;--surface2:#fbf9fc;--line:#e8e2eb;--text:#1b171e;--muted:#807785;--green:#6d36d8;--green2:#ff641d;--navy:#111014;--shadow:0 12px 36px rgba(34,20,42,.06);background:radial-gradient(circle at 78% 4%,rgba(109,54,216,.055),transparent 25%),#f7f5f8!important;color:#1b171e!important;font-family:"Avenir Next","Segoe UI Variable",Inter,ui-sans-serif,system-ui,sans-serif!important}
main[class*="shell"]>header[class*="topbar"]{height:72px!important;background:rgba(255,255,255,.92)!important;border-bottom:1px solid #e8e2eb!important;color:#211b25!important;box-shadow:0 8px 30px rgba(32,20,39,.035)!important;backdrop-filter:blur(22px)!important;position:sticky!important;top:0!important;padding-inline:22px!important}
main[class*="shell"]>header[class*="topbar"]:before{content:"";position:absolute;left:0;right:0;top:0;height:3px;background:linear-gradient(90deg,#ff641d 0 38%,#6d36d8 38% 78%,#111014 78% 100%)}
main[class*="shell"]>header[class*="topbar"] [class*="brandWrap"]{min-width:190px!important}
main[class*="shell"]>header[class*="topbar"] [class*="headerRight"]{gap:8px!important}
main[class*="shell"]>header[class*="topbar"] [class*="headerButton"]{min-height:38px!important;background:linear-gradient(145deg,#fff,#f8f5fa)!important;border:1px solid #e5dfe8!important;color:#4f4754!important;border-radius:13px!important;box-shadow:inset 0 1px 0 #fff!important;padding-inline:12px!important;font-weight:850!important}
main[class*="shell"]>header[class*="topbar"] [class*="headerButton"]:hover{background:#f4eef9!important;border-color:#d9cbe6!important;color:#6433bb!important;transform:translateY(-1px)!important}
main[class*="shell"]>header[class*="topbar"] [class*="status"]{min-height:38px!important;border-radius:13px!important;padding-inline:11px!important;font-weight:850!important}
main[class*="shell"]>header[class*="topbar"] [class*="versionPill"]{min-height:38px!important;background:#f2edf6!important;border-color:#e3d9e9!important;color:#756b7b!important;border-radius:13px!important}
main[class*="shell"]>div[class*="layout"]{grid-template-columns:224px minmax(0,1fr)!important}
main[class*="shell"]>div[class*="layout"]>aside[class*="sidebar"]{top:72px!important;height:calc(100vh - 72px)!important;background:linear-gradient(180deg,#111014 0%,#151118 58%,#0d0b0f 100%)!important;border-right:0!important;color:#fff!important;padding:20px 12px 54px!important;box-shadow:14px 0 34px rgba(19,12,22,.055)!important;gap:6px!important}
main[class*="shell"]>div[class*="layout"]>aside[class*="sidebar"]:before{content:"";position:absolute;inset:0;pointer-events:none;opacity:.16;background-image:radial-gradient(circle at 22% 14%,rgba(255,255,255,.28) 0 1px,transparent 1.5px);background-size:20px 20px;mask-image:linear-gradient(#000,transparent 72%)}
main[class*="shell"]>div[class*="layout"]>aside[class*="sidebar"]>*{position:relative;z-index:1}
main[class*="shell"]>div[class*="layout"]>aside[class*="sidebar"] [class*="navLabel"]{color:#766d7c!important;font-size:7px!important;letter-spacing:.18em!important;padding:4px 10px 9px!important}
main[class*="shell"]>div[class*="layout"]>aside[class*="sidebar"] [class*="navButton"]{color:#b9afbf!important;border-radius:15px!important;font-size:10.5px!important;font-weight:800!important;min-height:50px!important;padding:8px 9px!important;position:relative!important;background:transparent!important}
main[class*="shell"]>div[class*="layout"]>aside[class*="sidebar"] [class*="navButton"]:hover{background:rgba(255,255,255,.055)!important;color:#fff!important}
main[class*="shell"]>div[class*="layout"]>aside[class*="sidebar"] [class*="navActive"]{background:linear-gradient(135deg,rgba(109,54,216,.34),rgba(109,54,216,.17))!important;color:#fff!important;box-shadow:inset 0 0 0 1px rgba(143,98,239,.2),0 10px 24px rgba(0,0,0,.14)!important}
main[class*="shell"]>div[class*="layout"]>aside[class*="sidebar"] [class*="navActive"] span{background:#6d36d8!important;color:#fff!important;border-color:#7c49dc!important}
main[class*="shell"]>div[class*="layout"]>aside[class*="sidebar"] [class*="saleNav"]{color:#fff!important;background:linear-gradient(135deg,#ff641d,#ec5110)!important;box-shadow:0 12px 25px rgba(255,100,29,.18)!important}
main[class*="shell"]>div[class*="layout"]>aside[class*="sidebar"] [class*="saleNav"] span{background:rgba(255,255,255,.14)!important;color:#fff!important;border-color:rgba(255,255,255,.12)!important}
main[class*="shell"]>div[class*="layout"]>aside[class*="sidebar"] [class*="sidebarBottom"]{margin-top:auto!important;background:linear-gradient(145deg,rgba(255,255,255,.065),rgba(255,255,255,.028))!important;border:1px solid rgba(255,255,255,.075)!important;border-radius:17px!important;color:#fff!important;padding:12px!important}
main[class*="shell"]>div[class*="layout"]>aside[class*="sidebar"] [class*="sidebarBottom"] b{color:#fff!important}
main[class*="shell"]>div[class*="layout"]>aside[class*="sidebar"] [class*="sidebarBottom"] span{color:#a988ed!important}
main[class*="shell"]>div[class*="layout"]>aside[class*="sidebar"] [class*="sidebarBottom"] small{color:#817887!important}
main[class*="shell"]>div[class*="layout"]>section[class*="content"]{background:transparent!important;padding:28px 30px 94px!important;max-width:1600px!important}
main[class*="shell"] [class*="pageHead"]{margin-bottom:20px!important;padding:0 2px!important}
main[class*="shell"] [class*="pageHead"] h1{font-family:"Avenir Next","Segoe UI Variable",Inter,sans-serif!important;font-size:31px!important;font-weight:830!important;letter-spacing:-1.35px!important;color:#1b171e!important}
main[class*="shell"] [class*="pageHead"] p{color:#817887!important}
main[class*="shell"] [class*="eyebrow"]{color:#ff641d!important;letter-spacing:.16em!important}
main[class*="shell"] [class*="primary"]{background:linear-gradient(135deg,#ff641d,#ed5311)!important;border-color:#ec5514!important;border-radius:14px!important;box-shadow:0 10px 22px rgba(255,100,29,.18)!important}
main[class*="shell"] [class*="secondary"]{background:linear-gradient(145deg,#fff,#faf8fb)!important;border-color:#e4dde7!important;border-radius:14px!important;box-shadow:inset 0 1px 0 #fff!important}
main[class*="shell"] [class*="danger"]{border-radius:14px!important}
main[class*="shell"] [class*="linkButton"]{color:#6d36d8!important}
main[class*="shell"] [class*="kpi"],main[class*="shell"] [class*="panel"],main[class*="shell"] [class*="settingCard"],main[class*="shell"] [class*="counterCard"],main[class*="shell"] [class*="reportCard"],main[class*="shell"] [class*="table"],main[class*="shell"] [class*="searchCard"],main[class*="shell"] [class*="saleCard"],main[class*="shell"] [class*="productList"]{border-radius:20px!important;box-shadow:0 12px 34px rgba(34,20,42,.045)!important;border-color:#e7e1ea!important;background:#fff!important}
main[class*="shell"] [class*="kpi"]{padding:18px!important}
main[class*="shell"] [class*="kpiAccent"]{border-top:1px solid #e7e1ea!important;border-left:4px solid #ff641d!important}
main[class*="shell"] [class*="settingCard"] button[class*="switch"]{box-shadow:none!important}
main[class*="shell"] [class*="searchBox"],main[class*="shell"] [class*="searchSlim"]{border-radius:14px!important;border-color:#e3dce7!important;background:#fbf9fc!important}
main[class*="shell"] [class*="searchBox"]:focus-within,main[class*="shell"] [class*="searchSlim"]:focus-within{border-color:#b9a1e4!important;box-shadow:0 0 0 3px rgba(109,54,216,.08)!important}
main[class*="shell"] [class*="charge"]{background:linear-gradient(135deg,#ff641d,#e95312)!important;border-radius:15px!important;box-shadow:0 10px 24px rgba(255,100,29,.18)!important}
main[class*="shell"] [class*="paymentSelected"]{background:#f2ebff!important;border-color:#bda6ea!important;color:#5a2daf!important}
main[class*="shell"] [class*="roundIcon"],main[class*="shell"] [class*="shortcut"]>span{background:#f1eaff!important;color:#6d36d8!important}
main[class*="shell"] [class*="shortcut"]{border-radius:17px!important;background:linear-gradient(145deg,#fff,#faf8fb)!important;border-color:#e7e1ea!important}
main[class*="shell"] [class*="tableRow"][class*="tableHead"]{background:#faf8fb!important}
main[class*="shell"] [class*="bottomBar"],main[class*="shell"] [class*="statusBar"]{background:#111014!important;color:#f7f2f8!important;border-color:#2e2532!important}
main[class*="shell"] input,main[class*="shell"] select,main[class*="shell"] textarea{accent-color:#6d36d8}
main[class*="shell"][class*="dark"]{--bg:#100d12;--surface:#19151c;--surface2:#211b25;--line:#342c39;--text:#f7f2f8;--muted:#a79caa;background:radial-gradient(circle at 78% 4%,rgba(109,54,216,.09),transparent 25%),#100d12!important;color:#f7f2f8!important}
main[class*="shell"][class*="dark"]>header[class*="topbar"]{background:rgba(23,18,27,.94)!important;border-bottom-color:#342c39!important;color:#fff!important}
main[class*="shell"][class*="dark"]>header[class*="topbar"] [class*="headerButton"],main[class*="shell"][class*="dark"]>header[class*="topbar"] [class*="versionPill"]{background:#211b25!important;border-color:#3b3141!important;color:#d8cedd!important;box-shadow:none!important}
main[class*="shell"][class*="dark"]>div[class*="layout"]>aside[class*="sidebar"]{background:linear-gradient(180deg,#0b090c,#110d13)!important}
main[class*="shell"][class*="dark"]>div[class*="layout"]>section[class*="content"]{background:transparent!important}
main[class*="shell"][class*="dark"] [class*="pageHead"] h1{color:#f7f2f8!important}
main[class*="shell"][class*="dark"] [class*="pageHead"] p{color:#aaa0ae!important}
main[class*="shell"][class*="dark"] [class*="kpi"],main[class*="shell"][class*="dark"] [class*="panel"],main[class*="shell"][class*="dark"] [class*="settingCard"],main[class*="shell"][class*="dark"] [class*="counterCard"],main[class*="shell"][class*="dark"] [class*="reportCard"],main[class*="shell"][class*="dark"] [class*="table"],main[class*="shell"][class*="dark"] [class*="searchCard"],main[class*="shell"][class*="dark"] [class*="saleCard"],main[class*="shell"][class*="dark"] [class*="productList"]{background:#19151c!important;border-color:#342c39!important;color:#f7f2f8!important;box-shadow:0 14px 36px rgba(0,0,0,.18)!important}
main[class*="shell"][class*="dark"] [class*="secondary"]{background:#211b25!important;border-color:#423747!important;color:#e9dfee!important;box-shadow:none!important}
main[class*="shell"][class*="dark"] [class*="searchBox"],main[class*="shell"][class*="dark"] [class*="searchSlim"]{background:#211b25!important;border-color:#3b3141!important;color:#f7f2f8!important}
main[class*="shell"][class*="dark"] [class*="shortcut"]{background:linear-gradient(145deg,#1a151d,#211b25)!important;border-color:#392f3f!important;color:#f7f2f8!important}
main[class*="shell"][class*="dark"] [class*="roundIcon"],main[class*="shell"][class*="dark"] [class*="shortcut"]>span{background:#2b2035!important;color:#b99aef!important}
main[class*="shell"][class*="dark"] [class*="tableRow"][class*="tableHead"]{background:#211b25!important;color:#cfc4d4!important}
main[class*="shell"][class*="dark"] [class*="paymentSelected"]{background:#2b2038!important;border-color:#6d4aa3!important;color:#d7c0ff!important}
main[class*="shell"][class*="dark"] input,main[class*="shell"][class*="dark"] select,main[class*="shell"][class*="dark"] textarea{background:#211b25!important;color:#f7f2f8!important;border-color:#3d3343!important}
main[class*="shell"][class*="dark"] input::placeholder,main[class*="shell"][class*="dark"] textarea::placeholder{color:#887d8d!important}
@media(max-width:1150px) and (min-width:768px){main[class*="shell"]>div[class*="layout"]{grid-template-columns:82px minmax(0,1fr)!important}main[class*="shell"]>div[class*="layout"]>aside[class*="sidebar"]{padding-inline:8px!important}main[class*="shell"]>div[class*="layout"]>aside[class*="sidebar"] [class*="navButton"]{justify-content:center!important;padding-inline:6px!important}}
@media(max-width:920px){main[class*="shell"]>header[class*="topbar"]{height:64px!important;padding-inline:14px!important}main[class*="shell"]>div[class*="layout"]{grid-template-columns:1fr!important}main[class*="shell"]>div[class*="layout"]>aside[class*="sidebar"]{top:64px!important}main[class*="shell"]>div[class*="layout"]>section[class*="content"]{padding:20px 16px 86px!important}}
`

export default function DashboardRevolutionTheme(){return <style dangerouslySetInnerHTML={{__html:css}}/>}
