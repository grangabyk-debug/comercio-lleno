'use client'

import { useEffect } from 'react'

const RESPONSIVE_CSS = `
/* Ajuste general: evita que cualquier vista fuerce el ancho del viewport. */
html, body { max-width: 100%; }
main[class*="shell"] { min-width: 0 !important; max-width: 100vw !important; overflow-x: hidden !important; }
main[class*="shell"] [class*="content"] { min-width: 0; }
main[class*="shell"] img,
main[class*="shell"] svg,
main[class*="shell"] canvas { max-width: 100%; }

/* Notebook / escritorio angosto: compacta cabecera y contenido sin cambiar el zoom del usuario. */
@media (min-width: 768px) and (max-width: 1350px) {
  main[class*="shell"] > header { padding-left: 14px !important; padding-right: 14px !important; }
  main[class*="shell"] > header > div:last-of-type { gap: 4px !important; min-width: 0 !important; }
  main[class*="shell"] > header > div:last-of-type > * { padding: 7px 7px !important; font-size: 9px !important; }
  main[class*="shell"] > header > div:last-of-type > :nth-child(3) { display: none !important; }
  main[class*="shell"] > div:first-of-type > section { padding-left: 20px !important; padding-right: 20px !important; }
}

/* Cuando el lateral pasa a modo angosto, conservar sólo los íconos: nunca comprimir o cortar los textos. */
@media (min-width: 768px) and (max-width: 1150px) {
  main[class*="shell"] > div:first-of-type > aside [class*="navLabel"] { display: none !important; }
  main[class*="shell"] > div:first-of-type > aside [class*="navButton"] {
    justify-content: center !important;
    gap: 0 !important;
    min-width: 0 !important;
    min-height: 44px !important;
    padding-left: 6px !important;
    padding-right: 6px !important;
    font-size: 0 !important;
    overflow: hidden !important;
  }
  main[class*="shell"] > div:first-of-type > aside [class*="navButton"] > span {
    width: 32px !important;
    height: 32px !important;
    min-width: 32px !important;
    flex: 0 0 32px !important;
    font-size: 16px !important;
    margin: 0 !important;
  }
  main[class*="shell"] > div:first-of-type > aside [class*="sidebarBottom"] { display: none !important; }
}

@media (min-width: 768px) and (max-width: 1100px) {
  main[class*="shell"] [class*="kpis"] { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
  main[class*="shell"] [class*="gridTwo"] { grid-template-columns: minmax(0, 1fr) !important; }
  main[class*="shell"] [class*="posGrid"] { grid-template-columns: minmax(0, 1fr) !important; }
  main[class*="shell"] [class*="saleCard"] { position: static !important; top: auto !important; }
  main[class*="shell"] [class*="table"] { overflow-x: auto !important; -webkit-overflow-scrolling: touch !important; }
  main[class*="shell"] [class*="tableRow"] { min-width: 760px; }
  main[class*="shell"] [class*="pageHead"] { gap: 10px !important; }
  main[class*="shell"] [class*="pageHead"] h1 { font-size: clamp(25px, 3vw, 31px) !important; }
}

/* Pantallas bajas (notebooks 768p, ventanas no maximizadas, escalado de Windows). */
@media (min-width: 768px) and (max-height: 800px) {
  main[class*="shell"] > div:first-of-type > aside { padding-top: 10px !important; padding-bottom: 8px !important; gap: 3px !important; }
  main[class*="shell"] > div:first-of-type > aside [class*="navLabel"] { padding-top: 0 !important; padding-bottom: 4px !important; }
  main[class*="shell"] > div:first-of-type > aside [class*="navButton"] { padding-top: 8px !important; padding-bottom: 8px !important; min-height: 38px !important; }
  main[class*="shell"] > div:first-of-type > aside [class*="sidebarBottom"] { padding: 7px 9px !important; }
  main[class*="shell"] > div:first-of-type > section { padding-top: 14px !important; padding-bottom: 52px !important; }
  main[class*="shell"] [class*="pageHead"] { margin-bottom: 15px !important; }
  main[class*="shell"] [class*="productList"] { max-height: 52dvh !important; }
}

@media (min-width: 768px) and (max-height: 680px) {
  main[class*="shell"] > div:first-of-type > aside [class*="sidebarBottom"] { display: none !important; }
  main[class*="shell"] > div:first-of-type > aside [class*="navButton"] { padding-top: 6px !important; padding-bottom: 6px !important; min-height: 34px !important; }
  main[class*="shell"] > div:first-of-type > section { padding-top: 10px !important; }
  main[class*="shell"] [class*="pageHead"] { margin-bottom: 11px !important; }
  main[class*="shell"] [class*="pageHead"] h1 { margin-top: 2px !important; margin-bottom: 2px !important; }
}

/* POS en notebooks: mantiene carrito y cobro lado a lado y hace que TODO el cobro entre
   en la altura real disponible. No estira la página hacia abajo ni pisa la barra inferior. */
@media (min-width: 1051px) and (max-height: 840px) {
  main[class*="shell"] [class*="workspace"] {
    height: calc(100dvh - 205px) !important;
    min-height: 470px !important;
    max-height: 590px !important;
    overflow: hidden !important;
  }
  main[class*="shell"] [class*="workspaceHead"] {
    padding-top: 10px !important;
    padding-bottom: 10px !important;
  }
  main[class*="shell"] [class*="workspaceHead"] h2 { font-size: 17px !important; }
  main[class*="shell"] [class*="headTotal"] strong { font-size: 24px !important; }
  main[class*="shell"] [class*="body"] {
    min-height: 0 !important;
    grid-template-columns: minmax(0,1fr) minmax(370px,420px) !important;
    overflow: hidden !important;
  }
  main[class*="shell"] [class*="cartPanel"] {
    min-height: 0 !important;
    overflow: hidden !important;
  }
  main[class*="shell"] [class*="cart"] {
    min-height: 0 !important;
    max-height: none !important;
    overflow: auto !important;
  }
  main[class*="shell"] [class*="controls"] {
    min-height: 0 !important;
    overflow: hidden !important;
    padding: 9px 11px 10px !important;
    gap: 6px !important;
    align-content: start !important;
  }
  main[class*="shell"] [class*="statusBanner"] {
    padding: 7px 9px !important;
    border-radius: 10px !important;
    font-size: 10.5px !important;
    line-height: 1.25 !important;
  }
  main[class*="shell"] [class*="tools"] { gap: 6px !important; }
  main[class*="shell"] [class*="tool"] {
    min-height: 43px !important;
    padding: 9px 8px !important;
    border-radius: 11px !important;
    font-size: 12px !important;
  }
  main[class*="shell"] [class*="paymentLabel"] {
    margin-top: 0 !important;
    font-size: 10px !important;
    line-height: 1.1 !important;
  }
  main[class*="shell"] [class*="payments"] { gap: 5px !important; }
  main[class*="shell"] [class*="payment"] {
    min-height: 39px !important;
    padding: 8px 4px !important;
    border-radius: 10px !important;
    font-size: 11.5px !important;
    line-height: 1.05 !important;
  }
  main[class*="shell"] [class*="cashRow"] {
    gap: 7px !important;
    align-items: end !important;
  }
  main[class*="shell"] [class*="cashRow"] label {
    gap: 3px !important;
    font-size: 11px !important;
    line-height: 1.15 !important;
  }
  main[class*="shell"] [class*="cashRow"] input {
    min-height: 39px !important;
    padding: 8px 10px !important;
    border-radius: 10px !important;
    font-size: 12.5px !important;
  }
  main[class*="shell"] [class*="change"] {
    min-width: 72px !important;
    min-height: 39px !important;
    padding: 6px 9px !important;
    border-radius: 10px !important;
  }
  main[class*="shell"] [class*="change"] span { font-size: 9px !important; }
  main[class*="shell"] [class*="change"] strong { font-size: 14px !important; }
  main[class*="shell"] [class*="checkoutBox"] {
    margin-top: 0 !important;
    padding: 9px 10px !important;
    gap: 5px !important;
    border-radius: 13px !important;
  }
  main[class*="shell"] [class*="totals"] { gap: 2px !important; }
  main[class*="shell"] [class*="summary"] {
    font-size: 10.5px !important;
    line-height: 1.15 !important;
  }
  main[class*="shell"] [class*="summary"] strong { font-size: 11.5px !important; }
  main[class*="shell"] [class*="grand"] { margin-top: 0 !important; }
  main[class*="shell"] [class*="grand"] span { font-size: 11.5px !important; }
  main[class*="shell"] [class*="grand"] strong { font-size: 25px !important; }
  main[class*="shell"] [class*="checkoutActions"] { gap: 6px !important; }
  main[class*="shell"] [class*="checkoutActions"] button {
    min-height: 45px !important;
    border-radius: 11px !important;
    font-size: 12.5px !important;
  }
  main[class*="shell"] [class*="hint"] { display: none !important; }
  main[class*="shell"] [class*="cashClosed"] { padding: 7px 9px !important; }
  main[class*="shell"] [class*="openCashButton"] { min-height: 36px !important; }
}

/* En un ancho realmente tablet sí se apila; una notebook común no entra en este caso. */
@media (min-width: 768px) and (max-width: 1050px) and (max-height: 840px) {
  main[class*="shell"] [class*="workspace"] {
    height: auto !important;
    min-height: 0 !important;
    max-height: none !important;
  }
  main[class*="shell"] [class*="body"] { grid-template-columns: 1fr !important; }
  main[class*="shell"] [class*="cartPanel"] { min-height: 260px !important; }
  main[class*="shell"] [class*="controls"] { overflow: visible !important; }
}

/* La barra inferior nunca debe tapar contenido ni salirse horizontalmente. */
main[class*="shell"] [class*="bottomBar"] { max-width: 100vw !important; overflow-x: auto !important; overflow-y: hidden !important; scrollbar-width: thin; }
main[class*="shell"] [class*="bottomBar"] > * { min-width: max-content; }

/* Controles y tablas grandes: permitir scroll local antes que cortar la pantalla. */
main[class*="shell"] [class*="panel"],
main[class*="shell"] [class*="settingCard"],
main[class*="shell"] [class*="reportCard"] { min-width: 0 !important; max-width: 100%; }
main[class*="shell"] input,
main[class*="shell"] select,
main[class*="shell"] textarea { max-width: 100%; min-width: 0; }
`

export default function AdaptiveViewportFix() {
  useEffect(() => {
    const style = document.createElement('style')
    style.id = 'cl-adaptive-viewport-fix'
    style.textContent = RESPONSIVE_CSS
    document.head.appendChild(style)

    const update = () => {
      const root = document.documentElement
      root.style.setProperty('--cl-viewport-width', `${window.innerWidth}px`)
      root.style.setProperty('--cl-viewport-height', `${window.innerHeight}px`)
      root.classList.toggle('cl-short-screen', window.innerHeight < 760)
      root.classList.toggle('cl-narrow-desktop', window.innerWidth >= 768 && window.innerWidth < 1200)
    }
    update()
    window.addEventListener('resize', update, { passive: true })
    window.visualViewport?.addEventListener('resize', update)

    return () => {
      window.removeEventListener('resize', update)
      window.visualViewport?.removeEventListener('resize', update)
      document.documentElement.classList.remove('cl-short-screen', 'cl-narrow-desktop')
      style.remove()
    }
  }, [])

  return null
}