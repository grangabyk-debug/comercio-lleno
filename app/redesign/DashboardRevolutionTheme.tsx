const css=`
main[class*="shell"]{--bg:#f6f3f7;--surface:#fff;--surface2:#faf8fb;--line:#e7e1e9;--text:#201923;--muted:#7c7480;--green:#6d36d8;--green2:#ff641d;--navy:#17121c;--shadow:0 8px 28px rgba(36,23,43,.055);background:#f6f3f7!important;font-family:"Avenir Next","Segoe UI Variable",Inter,ui-sans-serif,system-ui,sans-serif!important}
main[class*="shell"]>header[class*="topbar"]{height:66px!important;background:rgba(255,255,255,.97)!important;border-bottom:1px solid #e8e2ea!important;color:#211a24!important;box-shadow:none!important;backdrop-filter:blur(18px)!important;position:sticky!important;top:0!important}
main[class*="shell"]>header[class*="topbar"]:before{content:"";position:absolute;left:0;right:0;top:0;height:2px;background:linear-gradient(90deg,#ff641d 0 33%,#ffb229 33% 52%,#6d36d8 52% 100%)}
main[class*="shell"]>header[class*="topbar"] [class*="brandMark"]{background:#ff641d!important;border-radius:9px!important;box-shadow:none!important}
main[class*="shell"]>header[class*="topbar"] [class*="brand"]{color:#211a24!important;font-size:18px!important;letter-spacing:-.7px!important}
main[class*="shell"]>header[class*="topbar"] [class*="brand"] span{color:#6d36d8!important}
main[class*="shell"]>header[class*="topbar"] [class*="tenant"]{color:#8a828e!important}
main[class*="shell"]>header[class*="topbar"] [class*="headerButton"]{background:#fff!important;border-color:#e3dce6!important;color:#4d4552!important;border-radius:8px!important;box-shadow:none!important}
main[class*="shell"]>header[class*="topbar"] [class*="headerButton"]:hover{background:#f7f3f8!important;color:#6d36d8!important}
main[class*="shell"]>header[class*="topbar"] [class*="versionPill"]{background:#f3eef6!important;border-color:#e6ddeb!important;color:#756c7a!important;border-radius:999px!important}
main[class*="shell"]>div[class*="layout"]{grid-template-columns:210px minmax(0,1fr)!important}
main[class*="shell"]>div[class*="layout"]>aside[class*="sidebar"]{top:66px!important;height:calc(100vh - 66px)!important;background:#fff!important;border-right:1px solid #e8e2ea!important;color:#241d27!important;padding:18px 11px 50px!important;box-shadow:none!important}
main[class*="shell"]>div[class*="layout"]>aside[class*="sidebar"] [class*="navLabel"]{color:#aaa1ad!important;font-size:7px!important;letter-spacing:.16em!important}
main[class*="shell"]>div[class*="layout"]>aside[class*="sidebar"] [class*="navButton"],main[class*="shell"]>div[class*="layout"]>aside[class*="sidebar"] [class*="managementButton"]{color:#706873!important;border-radius:7px!important;font-size:10.5px!important;font-weight:720!important;min-height:42px!important;position:relative!important}
main[class*="shell"]>div[class*="layout"]>aside[class*="sidebar"] [class*="navButton"]:hover,main[class*="shell"]>div[class*="layout"]>aside[class*="sidebar"] [class*="managementButton"]:hover{background:#faf7fb!important;color:#241d27!important}
main[class*="shell"]>div[class*="layout"]>aside[class*="sidebar"] [class*="navActive"]{background:#fff5ef!important;color:#c84c14!important;box-shadow:inset 3px 0 0 #ff641d!important}
main[class*="shell"]>div[class*="layout"]>aside[class*="sidebar"] [class*="navActive"] span{background:#ffe6d8!important;color:#e35312!important}
main[class*="shell"]>div[class*="layout"]>aside[class*="sidebar"] [class*="flyout"]{background:#fff!important;border-color:#e3dce6!important;box-shadow:0 20px 55px rgba(35,22,42,.16)!important;border-radius:12px!important}
main[class*="shell"]>div[class*="layout"]>aside[class*="sidebar"] [class*="managementItem"]{color:#615966!important}
main[class*="shell"]>div[class*="layout"]>aside[class*="sidebar"] [class*="managementItem"]:hover{background:#f7f2fb!important;color:#6d36d8!important}
main[class*="shell"]>div[class*="layout"]>aside[class*="sidebar"] [class*="sidebarBottom"]{background:#faf8fb!important;border-color:#e7e1e9!important;border-radius:9px!important}
main[class*="shell"]>div[class*="layout"]>aside[class*="sidebar"] [class*="sidebarBottom"] b{color:#241d27!important}
main[class*="shell"]>div[class*="layout"]>aside[class*="sidebar"] [class*="sidebarBottom"] span{color:#6d36d8!important}
main[class*="shell"]>div[class*="layout"]>section[class*="content"]{background:#f6f3f7!important;padding-top:26px!important}
main[class*="shell"] [class*="pageHead"]{margin-bottom:20px!important}
main[class*="shell"] [class*="pageHead"] h1{font-family:"Avenir Next","Segoe UI Variable",Inter,sans-serif!important;font-size:30px!important;font-weight:760!important;letter-spacing:-1.35px!important}
main[class*="shell"] [class*="eyebrow"]{color:#ff641d!important;letter-spacing:.15em!important}
main[class*="shell"] [class*="primary"]{background:#ff641d!important;border-color:#ff641d!important;border-radius:8px!important;box-shadow:0 8px 18px rgba(255,100,29,.16)!important}
main[class*="shell"] [class*="secondary"]{border-radius:8px!important;box-shadow:none!important}
main[class*="shell"] [class*="linkButton"]{color:#6d36d8!important}
main[class*="shell"] [class*="kpi"],main[class*="shell"] [class*="panel"],main[class*="shell"] [class*="settingCard"],main[class*="shell"] [class*="counterCard"],main[class*="shell"] [class*="reportCard"],main[class*="shell"] [class*="table"]{border-radius:10px!important;box-shadow:none!important;border-color:#e6dfe8!important}
main[class*="shell"] [class*="kpi"]{border-top:1px solid #e6dfe8!important;padding:17px!important}
main[class*="shell"] [class*="kpiAccent"]{border-left:3px solid #ff641d!important}
main[class*="shell"] [class*="settingCard"]{background:#fff!important}
main[class*="shell"] [class*="settingCard"] button[class*="switch"]{box-shadow:none!important}
main[class*="shell"] [class*="searchCard"],main[class*="shell"] [class*="saleCard"],main[class*="shell"] [class*="productList"]{border-radius:10px!important;box-shadow:none!important}
main[class*="shell"] [class*="charge"]{background:#ff641d!important;border-radius:8px!important;box-shadow:none!important}
main[class*="shell"] [class*="paymentSelected"]{background:#f2ebff!important;border-color:#bda6ea!important;color:#5a2daf!important}
main[class*="shell"] [class*="roundIcon"],main[class*="shell"] [class*="shortcut"]>span{background:#f2ebff!important;color:#6d36d8!important}
main[class*="shell"][class*="dark"]{--bg:#120e15;--surface:#1c161f;--surface2:#241c28;--line:#3b303f;--text:#f7f1f8;--muted:#aaa0ad;background:#120e15!important}
main[class*="shell"][class*="dark"]>header[class*="topbar"]{background:#1a141e!important;border-bottom-color:#342b38!important;color:#fff!important}
main[class*="shell"][class*="dark"]>header[class*="topbar"] [class*="brand"]{color:#fff!important}
main[class*="shell"][class*="dark"]>div[class*="layout"]>aside[class*="sidebar"]{background:#19131d!important;border-right-color:#342b38!important}
main[class*="shell"][class*="dark"]>div[class*="layout"]>aside[class*="sidebar"] [class*="navButton"],main[class*="shell"][class*="dark"]>div[class*="layout"]>aside[class*="sidebar"] [class*="managementButton"]{color:#b9afbd!important}
main[class*="shell"][class*="dark"]>div[class*="layout"]>section[class*="content"]{background:#120e15!important}
@media(max-width:920px){main[class*="shell"]>header[class*="topbar"]{height:62px!important}main[class*="shell"]>div[class*="layout"]{grid-template-columns:1fr!important}main[class*="shell"]>div[class*="layout"]>aside[class*="sidebar"]{top:62px!important}}
`

export default function DashboardRevolutionTheme(){return <style dangerouslySetInnerHTML={{__html:css}}/>}
