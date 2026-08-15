const css=`
main[class*="shell"]{--bg:#f7f4f8;--surface:#ffffff;--surface2:#fbf9fc;--line:#e5dfe8;--text:#1d1820;--muted:#7b7380;--green:#6d36d8;--green2:#ff641d;--navy:#17121c;--shadow:0 10px 30px rgba(35,23,42,.055);background:#f7f4f8!important}
main[class*="shell"]>header[class*="topbar"]{background:rgba(23,18,28,.98)!important;border-bottom:1px solid #33273a!important;color:#fff!important;box-shadow:0 8px 28px rgba(23,18,28,.1)}
main[class*="shell"]>header[class*="topbar"] [class*="brandMark"]{background:linear-gradient(145deg,#ff641d,#6d36d8)!important;box-shadow:0 8px 22px rgba(109,54,216,.28)!important}
main[class*="shell"]>header[class*="topbar"] [class*="brand"]{color:#fff!important}
main[class*="shell"]>header[class*="topbar"] [class*="brand"] span{color:#ff8d56!important}
main[class*="shell"]>header[class*="topbar"] [class*="tenant"]{color:#a99faf!important}
main[class*="shell"]>header[class*="topbar"] [class*="headerButton"]{background:#261d2b!important;border-color:#3a2d41!important;color:#eee8f1!important}
main[class*="shell"]>header[class*="topbar"] [class*="headerButton"]:hover{background:#312439!important}
main[class*="shell"]>header[class*="topbar"] [class*="versionPill"]{background:#2b2031!important;border-color:#3b2e42!important;color:#a99eaf!important}
main[class*="shell"]>div[class*="layout"]>aside[class*="sidebar"]{background:#1c1621!important;border-right:1px solid #352a3b!important;color:#fff!important}
main[class*="shell"]>div[class*="layout"]>aside[class*="sidebar"] [class*="navLabel"]{color:#766b7d!important}
main[class*="shell"]>div[class*="layout"]>aside[class*="sidebar"] [class*="navButton"]{color:#bcb1c2!important;border-radius:8px!important}
main[class*="shell"]>div[class*="layout"]>aside[class*="sidebar"] [class*="navButton"]:hover{background:#29202f!important;color:#fff!important}
main[class*="shell"]>div[class*="layout"]>aside[class*="sidebar"] [class*="navActive"]{background:#ff641d!important;color:#fff!important;box-shadow:0 8px 20px rgba(255,100,29,.18)!important}
main[class*="shell"]>div[class*="layout"]>aside[class*="sidebar"] [class*="navActive"] span{background:rgba(255,255,255,.16)!important;color:#fff!important}
main[class*="shell"]>div[class*="layout"]>aside[class*="sidebar"] [class*="managementButton"]{color:#bcb1c2!important}
main[class*="shell"]>div[class*="layout"]>aside[class*="sidebar"] [class*="managementButton"]:hover{background:#29202f!important;color:#fff!important}
main[class*="shell"]>div[class*="layout"]>aside[class*="sidebar"] [class*="flyout"]{background:#211926!important;border-color:#3b2e42!important;box-shadow:0 22px 50px rgba(0,0,0,.28)!important}
main[class*="shell"]>div[class*="layout"]>aside[class*="sidebar"] [class*="managementItem"]{color:#c8bdcd!important}
main[class*="shell"]>div[class*="layout"]>aside[class*="sidebar"] [class*="managementItem"]:hover{background:#302438!important;color:#fff!important}
main[class*="shell"]>div[class*="layout"]>aside[class*="sidebar"] [class*="sidebarBottom"]{background:#241b29!important;border-color:#382b3f!important}
main[class*="shell"]>div[class*="layout"]>aside[class*="sidebar"] [class*="sidebarBottom"] b{color:#fff!important}
main[class*="shell"]>div[class*="layout"]>aside[class*="sidebar"] [class*="sidebarBottom"] span{color:#ff8d56!important}
main[class*="shell"]>div[class*="layout"]>section[class*="content"]{background:#f7f4f8!important}
main[class*="shell"] [class*="pageHead"] h1{letter-spacing:-1.5px!important}
main[class*="shell"] [class*="eyebrow"]{color:#ff641d!important}
main[class*="shell"] [class*="primary"]{background:linear-gradient(135deg,#ff641d,#6d36d8)!important;border-color:#ff641d!important}
main[class*="shell"] [class*="linkButton"]{color:#6d36d8!important}
main[class*="shell"] [class*="kpiAccent"]{border-top-color:#ff641d!important}
main[class*="shell"] [class*="navActive"]{transition:none!important}
main[class*="shell"][class*="dark"]{--bg:#100c13;--surface:#1a141e;--surface2:#211926;--line:#392d40;--text:#f5eff8;--muted:#aa9fb0;background:#100c13!important}
main[class*="shell"][class*="dark"]>div[class*="layout"]>section[class*="content"]{background:#100c13!important}
@media(max-width:920px){main[class*="shell"]>header[class*="topbar"]{background:#17121c!important}}
`

export default function DashboardRevolutionTheme(){return <style dangerouslySetInnerHTML={{__html:css}}/>}
