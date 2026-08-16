const css=`
html[data-cl-mobile-theme="dark"] body{background:#0d0b10!important;color:#f5f0f6!important}
html[data-cl-mobile-theme="dark"] main[class*="app"]{background:#0d0b10!important;color:#f4eef6!important}
html[data-cl-mobile-theme="dark"] main[class*="app"] [class*="phoneShell"]{background:#151219!important;box-shadow:0 0 60px rgba(0,0,0,.34)!important}
html[data-cl-mobile-theme="dark"] main[class*="app"] [class*="topbar"]{background:rgba(23,18,28,.98)!important;border-bottom-color:#342b38!important;color:#f4eef6!important}
html[data-cl-mobile-theme="dark"] main[class*="app"] [class*="brandBlock"] b{color:#fff!important}
html[data-cl-mobile-theme="dark"] main[class*="app"] [class*="brandBlock"] span{color:#aaa0ad!important}
html[data-cl-mobile-theme="dark"] main[class*="app"] [class*="settingsButton"]{background:#211a24!important;border-color:#403445!important;color:#eee6f0!important}
html[data-cl-mobile-theme="dark"] main[class*="app"] [class*="content"]{color:#f1ebf3!important}
html[data-cl-mobile-theme="dark"] main[class*="app"] [class*="content"] h1,
html[data-cl-mobile-theme="dark"] main[class*="app"] [class*="content"] h2,
html[data-cl-mobile-theme="dark"] main[class*="app"] [class*="content"] h3,
html[data-cl-mobile-theme="dark"] main[class*="app"] [class*="content"] b,
html[data-cl-mobile-theme="dark"] main[class*="app"] [class*="content"] strong,
html[data-cl-mobile-theme="dark"] main[class*="app"] [class*="content"] label{color:#f8f3f9!important}
html[data-cl-mobile-theme="dark"] main[class*="app"] [class*="greeting"] h1{color:#fff!important}
html[data-cl-mobile-theme="dark"] main[class*="app"] [class*="greeting"] p{color:#c2b9c5!important}
html[data-cl-mobile-theme="dark"] main[class*="app"] [class*="autoCash"]{background:#211a24!important;border-color:#3d3241!important;color:#eee7f0!important}
html[data-cl-mobile-theme="dark"] main[class*="app"] [class*="autoCash"] span,
html[data-cl-mobile-theme="dark"] main[class*="app"] [class*="autoCash"] b{color:#f0e9f2!important}
html[data-cl-mobile-theme="dark"] main[class*="app"] [class*="bigAction"]{background:#1d1821!important;border-color:#352c39!important;color:#f4eef6!important}
html[data-cl-mobile-theme="dark"] main[class*="app"] [class*="bigAction"]:first-child{background:#261d30!important;border-color:#49385a!important}
html[data-cl-mobile-theme="dark"] main[class*="app"] [class*="bigAction"]:nth-child(2){background:#1d1821!important}
html[data-cl-mobile-theme="dark"] main[class*="app"] [class*="bigAction"] b{color:#fff!important}
html[data-cl-mobile-theme="dark"] main[class*="app"] [class*="bigAction"] small{color:#c2b8c5!important}
html[data-cl-mobile-theme="dark"] main[class*="app"] [class*="summaryCard"],
html[data-cl-mobile-theme="dark"] main[class*="app"] [class*="settingsCard"],
html[data-cl-mobile-theme="dark"] main[class*="app"] [class*="cartCard"]{background:#1c171f!important;border-color:#352c39!important;color:#f2ecf4!important}
html[data-cl-mobile-theme="dark"] main[class*="app"] [class*="cardHead"] b,
html[data-cl-mobile-theme="dark"] main[class*="app"] [class*="summaryRow"] b,
html[data-cl-mobile-theme="dark"] main[class*="app"] [class*="saleHistory"] b,
html[data-cl-mobile-theme="dark"] main[class*="app"] [class*="saleHistory"] strong,
html[data-cl-mobile-theme="dark"] main[class*="app"] [class*="settingRow"] b,
html[data-cl-mobile-theme="dark"] main[class*="app"] [class*="settingStatus"] b,
html[data-cl-mobile-theme="dark"] main[class*="app"] [class*="settingInfo"] b,
html[data-cl-mobile-theme="dark"] main[class*="app"] [class*="cartTitle"] b,
html[data-cl-mobile-theme="dark"] main[class*="app"] [class*="cartName"] b,
html[data-cl-mobile-theme="dark"] main[class*="app"] [class*="cartLine"] strong,
html[data-cl-mobile-theme="dark"] main[class*="app"] [class*="totalRow"] b{color:#fff!important}
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
html[data-cl-mobile-theme="dark"] main[class*="app"] [class*="cartName"] small{color:#beb5c1!important}
html[data-cl-mobile-theme="dark"] main[class*="app"] [class*="sectionHead"] h2{color:#fff!important}
html[data-cl-mobile-theme="dark"] main[class*="app"] [class*="sectionHead"]>button{background:#211a24!important;border-color:#3b3140!important;color:#f2ebf4!important}
html[data-cl-mobile-theme="dark"] main[class*="app"] [class*="searchBox"]{background:#1d1821!important;border-color:#3a3040!important;color:#f4eef6!important}
html[data-cl-mobile-theme="dark"] main[class*="app"] [class*="searchBox"] input{color:#f7f2f8!important}
html[data-cl-mobile-theme="dark"] main[class*="app"] [class*="searchBox"] input::placeholder{color:#9d93a2!important}
html[data-cl-mobile-theme="dark"] main[class*="app"] [class*="productItem"],
html[data-cl-mobile-theme="dark"] main[class*="app"] [class*="catalogRow"]{background:#1d1821!important;border-color:#352c39!important;color:#f4eef6!important}
html[data-cl-mobile-theme="dark"] main[class*="app"] [class*="productItem"] b,
html[data-cl-mobile-theme="dark"] main[class*="app"] [class*="productItem"] strong,
html[data-cl-mobile-theme="dark"] main[class*="app"] [class*="catalogRow"] b,
html[data-cl-mobile-theme="dark"] main[class*="app"] [class*="catalogRow"] strong{color:#fff!important}
html[data-cl-mobile-theme="dark"] main[class*="app"] [class*="productItem"] small,
html[data-cl-mobile-theme="dark"] main[class*="app"] [class*="catalogRow"] small{color:#beb5c1!important}
html[data-cl-mobile-theme="dark"] main[class*="app"] [class*="empty"],
html[data-cl-mobile-theme="dark"] main[class*="app"] [class*="emptyCart"],
html[data-cl-mobile-theme="dark"] main[class*="app"] [class*="emptyInline"],
html[data-cl-mobile-theme="dark"] main[class*="app"] [class*="emptyState"]{color:#bdb4c0!important}
html[data-cl-mobile-theme="dark"] main[class*="app"] [class*="emptyState"]{background:#1b161e!important;border-color:#403545!important}
html[data-cl-mobile-theme="dark"] main[class*="app"] [class*="paymentGrid"] button{background:#211a24!important;border-color:#3b3140!important;color:#ddd4df!important}
html[data-cl-mobile-theme="dark"] main[class*="app"] [class*="paymentGrid"] [class*="paymentActive"]{background:#322443!important;border-color:#7755a0!important;color:#f0e5ff!important}
html[data-cl-mobile-theme="dark"] main[class*="app"] [class*="qty"] button{background:#211a24!important;border-color:#3b3140!important;color:#f2ebf4!important}
html[data-cl-mobile-theme="dark"] main[class*="app"] [class*="switch"]{background:#47404a!important}
html[data-cl-mobile-theme="dark"] main[class*="app"] [class*="switchOn"]{background:#6d36d8!important}
html[data-cl-mobile-theme="dark"] main[class*="app"] [class*="bottomNav"]{background:rgba(23,18,28,.98)!important;border-top-color:#382e3d!important;box-shadow:0 -10px 28px rgba(0,0,0,.28)!important}
html[data-cl-mobile-theme="dark"] main[class*="app"] [class*="bottomNav"] button{color:#c9c0cc!important}
html[data-cl-mobile-theme="dark"] main[class*="app"] [class*="bottomNav"] button b{color:inherit!important}
html[data-cl-mobile-theme="dark"] main[class*="app"] [class*="bottomNav"] [class*="navActive"]{background:#2b2134!important;color:#d2b7ff!important}
html[data-cl-mobile-theme="dark"] main[class*="app"] [class*="modalBackdrop"]{background:rgba(0,0,0,.66)!important}
html[data-cl-mobile-theme="dark"] main[class*="app"] [class*="modalCard"]{background:#1b171e!important;color:#f5eff6!important;border-color:#3b3140!important}
html[data-cl-mobile-theme="dark"] main[class*="app"] [class*="modalCard"] h3,
html[data-cl-mobile-theme="dark"] main[class*="app"] [class*="modalCard"] label,
html[data-cl-mobile-theme="dark"] main[class*="app"] [class*="modalCard"] b,
html[data-cl-mobile-theme="dark"] main[class*="app"] [class*="modalCard"] strong{color:#fff!important}
html[data-cl-mobile-theme="dark"] main[class*="app"] [class*="modalHead"]>button{background:#241e28!important;border-color:#413646!important;color:#f1eaf3!important}
html[data-cl-mobile-theme="dark"] main[class*="app"] [class*="modalCard"] input,
html[data-cl-mobile-theme="dark"] main[class*="app"] [class*="modalCard"] select,
html[data-cl-mobile-theme="dark"] main[class*="app"] [class*="modalCard"] textarea{background:#211b25!important;border-color:#413646!important;color:#fff!important}
html[data-cl-mobile-theme="dark"] main[class*="app"] [class*="demoNote"]{color:#aaa0ad!important}

/* Header móvil: que la marca no pierda la palabra Comercio sobre fondo oscuro. */
@media(max-width:760px){
  html[data-cl-mobile-theme="dark"] main[class*="app"] header[class*="topbar"]{background:rgba(23,18,28,.98)!important;border-bottom-color:#342b38!important}
  html[data-cl-mobile-theme="dark"] main[class*="app"] header[class*="topbar"] [class*="brandBlock"]:before{background:linear-gradient(90deg,#f7f2f8 0 48%,#9a68ff 48% 77%,#ff7b3d 77% 100%)!important;-webkit-background-clip:text!important;background-clip:text!important;color:transparent!important}
  html[data-cl-mobile-theme="dark"] main[class*="app"] header[class*="topbar"] [class*="settingsButton"]{background:#28212c!important;border-color:#443848!important;color:#f3edf5!important;box-shadow:0 10px 24px rgba(0,0,0,.22),inset 0 1px 0 rgba(255,255,255,.06)!important}
}

/* Configuración y overlays: contraste alto y consistente en toda la experiencia. */
html[data-cl-mobile-theme="dark"] [class*="overlay"]{background:#0f0c12!important;color:#f4eef6!important}
html[data-cl-mobile-theme="dark"] [class*="overlay"] [class*="shell"]{background:#17131b!important;box-shadow:0 0 55px rgba(0,0,0,.34)!important}
html[data-cl-mobile-theme="dark"] [class*="overlay"] [class*="header"]{background:#1d1821!important;border-color:#382f3d!important;color:#fff!important}
html[data-cl-mobile-theme="dark"] [class*="overlay"] [class*="header"] h1{color:#fff!important}
html[data-cl-mobile-theme="dark"] [class*="overlay"] [class*="header"] span{color:#c2b8c5!important}
html[data-cl-mobile-theme="dark"] [class*="overlay"] [class*="header"] [class*="back"],
html[data-cl-mobile-theme="dark"] [class*="overlay"] [class*="header"] [class*="close"]{background:#251f29!important;border-color:#433748!important;color:#f1eaf3!important}
html[data-cl-mobile-theme="dark"] [class*="overlay"] [class*="hero"],
html[data-cl-mobile-theme="dark"] [class*="overlay"] [class*="menuItem"],
html[data-cl-mobile-theme="dark"] [class*="overlay"] [class*="card"],
html[data-cl-mobile-theme="dark"] [class*="overlay"] [class*="subCard"],
html[data-cl-mobile-theme="dark"] [class*="overlay"] [class*="lines"],
html[data-cl-mobile-theme="dark"] [class*="overlay"] [class*="newBranch"]{background:#1d1821!important;border-color:#382f3d!important;color:#f3edf5!important}
html[data-cl-mobile-theme="dark"] [class*="overlay"] [class*="hero"] b,
html[data-cl-mobile-theme="dark"] [class*="overlay"] [class*="menuItem"] b,
html[data-cl-mobile-theme="dark"] [class*="overlay"] [class*="card"] h2,
html[data-cl-mobile-theme="dark"] [class*="overlay"] [class*="card"] h3,
html[data-cl-mobile-theme="dark"] [class*="overlay"] [class*="subCard"] b,
html[data-cl-mobile-theme="dark"] [class*="overlay"] [class*="row"]>span,
html[data-cl-mobile-theme="dark"] [class*="overlay"] [class*="row"] b,
html[data-cl-mobile-theme="dark"] [class*="overlay"] [class*="lines"] b,
html[data-cl-mobile-theme="dark"] [class*="overlay"] [class*="metrics"] b,
html[data-cl-mobile-theme="dark"] [class*="overlay"] [class*="switchRow"] b,
html[data-cl-mobile-theme="dark"] [class*="overlay"] label{color:#fff!important}
html[data-cl-mobile-theme="dark"] [class*="overlay"] [class*="hero"] span,
html[data-cl-mobile-theme="dark"] [class*="overlay"] [class*="menuItem"] small,
html[data-cl-mobile-theme="dark"] [class*="overlay"] [class*="card"]>p,
html[data-cl-mobile-theme="dark"] [class*="overlay"] [class*="switchRow"] small,
html[data-cl-mobile-theme="dark"] [class*="overlay"] [class*="subCard"]>small,
html[data-cl-mobile-theme="dark"] [class*="overlay"] [class*="row"] small,
html[data-cl-mobile-theme="dark"] [class*="overlay"] [class*="lines"] span,
html[data-cl-mobile-theme="dark"] [class*="overlay"] [class*="metrics"] span,
html[data-cl-mobile-theme="dark"] [class*="overlay"] [class*="info"],
html[data-cl-mobile-theme="dark"] [class*="overlay"] [class*="readOnly"],
html[data-cl-mobile-theme="dark"] [class*="overlay"] [class*="loading"]{color:#beb5c1!important}
html[data-cl-mobile-theme="dark"] [class*="overlay"] [class*="menuItem"]>strong{color:#b9afbd!important}
html[data-cl-mobile-theme="dark"] [class*="overlay"] [class*="menuIcon"]{background:#141117!important;color:#f4eef6!important}
html[data-cl-mobile-theme="dark"] [class*="overlay"] [class*="readOnly"],
html[data-cl-mobile-theme="dark"] [class*="overlay"] [class*="info"]{background:#18141c!important;border-color:#342c38!important}
html[data-cl-mobile-theme="dark"] [class*="overlay"] input,
html[data-cl-mobile-theme="dark"] [class*="overlay"] select,
html[data-cl-mobile-theme="dark"] [class*="overlay"] textarea{background:#241e28!important;border-color:#433748!important;color:#fff!important}
html[data-cl-mobile-theme="dark"] [class*="overlay"] input::placeholder,
html[data-cl-mobile-theme="dark"] [class*="overlay"] textarea::placeholder{color:#918795!important}
html[data-cl-mobile-theme="dark"] [class*="overlay"] [class*="choice"] button,
html[data-cl-mobile-theme="dark"] [class*="overlay"] [class*="options"] button,
html[data-cl-mobile-theme="dark"] [class*="overlay"] [class*="actionGrid"] button{background:#251f29!important;border-color:#433748!important;color:#e4dce7!important}
html[data-cl-mobile-theme="dark"] [class*="overlay"] [class*="options"] button b{color:#fff!important}
html[data-cl-mobile-theme="dark"] [class*="overlay"] [class*="options"] button small{color:#beb5c1!important}
html[data-cl-mobile-theme="dark"] [class*="overlay"] [class*="secondary"]{background:#251f29!important;border-color:#433748!important;color:#d3baff!important}
html[data-cl-mobile-theme="dark"] [class*="overlay"] [class*="selected"]{background:#322443!important;border-color:#7655a0!important;color:#f0e6ff!important}
html[data-cl-mobile-theme="dark"] [class*="overlay"] [class*="statusHero"] b,
html[data-cl-mobile-theme="dark"] [class*="overlay"] [class*="statusHero"] small{color:inherit!important}
html[data-cl-mobile-theme="dark"] [class*="overlay"] [class*="good"]{background:#15251d!important;border-color:#31513f!important;color:#7fe1aa!important}
html[data-cl-mobile-theme="dark"] [class*="overlay"] [class*="bad"]{background:#2a181a!important;border-color:#573338!important;color:#ff9d91!important}
`

export default function MobileDarkTheme(){return <style dangerouslySetInnerHTML={{__html:css}}/>}
