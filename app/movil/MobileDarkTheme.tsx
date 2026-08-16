const css=`
html[data-cl-mobile-theme="dark"] body{background:#0d0b10!important;color:#f5f0f6!important}
html[data-cl-mobile-theme="dark"] main[class*="app"]{background:#0d0b10!important;color:#f4eef6!important}
html[data-cl-mobile-theme="dark"] main[class*="app"] [class*="phoneShell"]{background:#151219!important;box-shadow:0 0 60px rgba(0,0,0,.34)!important}
html[data-cl-mobile-theme="dark"] main[class*="app"] [class*="topbar"]{background:rgba(23,18,28,.98)!important;border-bottom-color:#342b38!important;color:#f4eef6!important}
html[data-cl-mobile-theme="dark"] main[class*="app"] [class*="brandBlock"] b{color:#fff!important}
html[data-cl-mobile-theme="dark"] main[class*="app"] [class*="brandBlock"] span{color:#aaa0ad!important}
html[data-cl-mobile-theme="dark"] main[class*="app"] [class*="settingsButton"]{background:#211a24!important;border-color:#403445!important;color:#eee6f0!important}
html[data-cl-mobile-theme="dark"] main[class*="app"] [class*="content"]{color:#f1ebf3!important}
html[data-cl-mobile-theme="dark"] main[class*="app"] [class*="greeting"] h1{color:#fff!important}
html[data-cl-mobile-theme="dark"] main[class*="app"] [class*="greeting"] p{color:#aaa1ac!important}
html[data-cl-mobile-theme="dark"] main[class*="app"] [class*="autoCash"]{background:#211a24!important;border-color:#3d3241!important;color:#eee7f0!important}
html[data-cl-mobile-theme="dark"] main[class*="app"] [class*="bigAction"]{background:#1d1821!important;border-color:#352c39!important;color:#f4eef6!important}
html[data-cl-mobile-theme="dark"] main[class*="app"] [class*="bigAction"]:first-child{background:#261d30!important;border-color:#49385a!important}
html[data-cl-mobile-theme="dark"] main[class*="app"] [class*="bigAction"]:nth-child(2){background:#1d1821!important}
html[data-cl-mobile-theme="dark"] main[class*="app"] [class*="bigAction"] small{color:#a79eaa!important}
html[data-cl-mobile-theme="dark"] main[class*="app"] [class*="summaryCard"],
html[data-cl-mobile-theme="dark"] main[class*="app"] [class*="settingsCard"],
html[data-cl-mobile-theme="dark"] main[class*="app"] [class*="cartCard"]{background:#1c171f!important;border-color:#352c39!important;color:#f2ecf4!important}
html[data-cl-mobile-theme="dark"] main[class*="app"] [class*="summaryRow"],
html[data-cl-mobile-theme="dark"] main[class*="app"] [class*="saleHistory"],
html[data-cl-mobile-theme="dark"] main[class*="app"] [class*="settingStatus"],
html[data-cl-mobile-theme="dark"] main[class*="app"] [class*="cartTitle"],
html[data-cl-mobile-theme="dark"] main[class*="app"] [class*="cartLine"],
html[data-cl-mobile-theme="dark"] main[class*="app"] [class*="totalRow"]{border-color:#2d2631!important;background:transparent!important}
html[data-cl-mobile-theme="dark"] main[class*="app"] [class*="summaryRow"] span,
html[data-cl-mobile-theme="dark"] main[class*="app"] [class*="saleHistory"] small,
html[data-cl-mobile-theme="dark"] main[class*="app"] [class*="settingRow"] p,
html[data-cl-mobile-theme="dark"] main[class*="app"] [class*="settingStatus"] span,
html[data-cl-mobile-theme="dark"] main[class*="app"] [class*="settingInfo"] p,
html[data-cl-mobile-theme="dark"] main[class*="app"] [class*="cartName"] small{color:#aaa1ac!important}
html[data-cl-mobile-theme="dark"] main[class*="app"] [class*="sectionHead"] h2{color:#fff!important}
html[data-cl-mobile-theme="dark"] main[class*="app"] [class*="sectionHead"]>button{background:#211a24!important;border-color:#3b3140!important;color:#f2ebf4!important}
html[data-cl-mobile-theme="dark"] main[class*="app"] [class*="searchBox"]{background:#1d1821!important;border-color:#3a3040!important;color:#f4eef6!important}
html[data-cl-mobile-theme="dark"] main[class*="app"] [class*="searchBox"] input{color:#f7f2f8!important}
html[data-cl-mobile-theme="dark"] main[class*="app"] [class*="searchBox"] input::placeholder{color:#827987!important}
html[data-cl-mobile-theme="dark"] main[class*="app"] [class*="productItem"],
html[data-cl-mobile-theme="dark"] main[class*="app"] [class*="catalogRow"]{background:#1d1821!important;border-color:#352c39!important;color:#f4eef6!important}
html[data-cl-mobile-theme="dark"] main[class*="app"] [class*="productItem"] small,
html[data-cl-mobile-theme="dark"] main[class*="app"] [class*="catalogRow"] small{color:#a79eaa!important}
html[data-cl-mobile-theme="dark"] main[class*="app"] [class*="empty"],
html[data-cl-mobile-theme="dark"] main[class*="app"] [class*="emptyCart"],
html[data-cl-mobile-theme="dark"] main[class*="app"] [class*="emptyInline"],
html[data-cl-mobile-theme="dark"] main[class*="app"] [class*="emptyState"]{color:#aaa1ac!important}
html[data-cl-mobile-theme="dark"] main[class*="app"] [class*="emptyState"]{background:#1b161e!important;border-color:#403545!important}
html[data-cl-mobile-theme="dark"] main[class*="app"] [class*="paymentGrid"] button{background:#211a24!important;border-color:#3b3140!important;color:#cfc6d2!important}
html[data-cl-mobile-theme="dark"] main[class*="app"] [class*="paymentGrid"] [class*="paymentActive"]{background:#322443!important;border-color:#7755a0!important;color:#e4d3ff!important}
html[data-cl-mobile-theme="dark"] main[class*="app"] [class*="qty"] button{background:#211a24!important;border-color:#3b3140!important;color:#f2ebf4!important}
html[data-cl-mobile-theme="dark"] main[class*="app"] [class*="switch"]{background:#47404a!important}
html[data-cl-mobile-theme="dark"] main[class*="app"] [class*="switchOn"]{background:#6d36d8!important}
html[data-cl-mobile-theme="dark"] main[class*="app"] [class*="bottomNav"]{background:rgba(23,18,28,.98)!important;border-top-color:#382e3d!important;box-shadow:0 -10px 28px rgba(0,0,0,.28)!important}
html[data-cl-mobile-theme="dark"] main[class*="app"] [class*="bottomNav"] button{color:#a69dab!important}
html[data-cl-mobile-theme="dark"] main[class*="app"] [class*="bottomNav"] [class*="navActive"]{background:#2b2134!important;color:#bb92ff!important}
html[data-cl-mobile-theme="dark"] main[class*="app"] [class*="modalBackdrop"]{background:rgba(0,0,0,.66)!important}
html[data-cl-mobile-theme="dark"] main[class*="app"] [class*="modalCard"]{background:#1b171e!important;color:#f5eff6!important;border-color:#3b3140!important}
html[data-cl-mobile-theme="dark"] main[class*="app"] [class*="modalHead"]>button{background:#241e28!important;border-color:#413646!important;color:#f1eaf3!important}
html[data-cl-mobile-theme="dark"] main[class*="app"] [class*="modalCard"] input,
html[data-cl-mobile-theme="dark"] main[class*="app"] [class*="modalCard"] select,
html[data-cl-mobile-theme="dark"] main[class*="app"] [class*="modalCard"] textarea{background:#211b25!important;border-color:#413646!important;color:#fff!important}
html[data-cl-mobile-theme="dark"] main[class*="app"] [class*="demoNote"]{color:#9f96a2!important}
html[data-cl-mobile-theme="dark"] [class*="overlay"]{background:#0f0c12!important;color:#f4eef6!important}
html[data-cl-mobile-theme="dark"] [class*="overlay"] [class*="shell"]{background:#17131b!important;box-shadow:0 0 55px rgba(0,0,0,.34)!important}
html[data-cl-mobile-theme="dark"] [class*="overlay"] [class*="header"]{background:#1d1821!important;border-color:#382f3d!important;color:#fff!important}
html[data-cl-mobile-theme="dark"] [class*="overlay"] [class*="header"] span{color:#aaa0ad!important}
html[data-cl-mobile-theme="dark"] [class*="overlay"] [class*="header"] [class*="back"],
html[data-cl-mobile-theme="dark"] [class*="overlay"] [class*="header"] [class*="close"]{background:#251f29!important;border-color:#433748!important;color:#f1eaf3!important}
html[data-cl-mobile-theme="dark"] [class*="overlay"] [class*="hero"],
html[data-cl-mobile-theme="dark"] [class*="overlay"] [class*="menuItem"],
html[data-cl-mobile-theme="dark"] [class*="overlay"] [class*="card"],
html[data-cl-mobile-theme="dark"] [class*="overlay"] [class*="subCard"],
html[data-cl-mobile-theme="dark"] [class*="overlay"] [class*="lines"],
html[data-cl-mobile-theme="dark"] [class*="overlay"] [class*="newBranch"]{background:#1d1821!important;border-color:#382f3d!important;color:#f3edf5!important}
html[data-cl-mobile-theme="dark"] [class*="overlay"] input,
html[data-cl-mobile-theme="dark"] [class*="overlay"] select,
html[data-cl-mobile-theme="dark"] [class*="overlay"] textarea{background:#241e28!important;border-color:#433748!important;color:#fff!important}
html[data-cl-mobile-theme="dark"] [class*="overlay"] [class*="secondary"]{background:#251f29!important;border-color:#433748!important;color:#c7a8ff!important}
html[data-cl-mobile-theme="dark"] [class*="overlay"] [class*="selected"]{background:#322443!important;border-color:#7655a0!important;color:#e6d6ff!important}
`

export default function MobileDarkTheme(){return <style dangerouslySetInnerHTML={{__html:css}}/>}
