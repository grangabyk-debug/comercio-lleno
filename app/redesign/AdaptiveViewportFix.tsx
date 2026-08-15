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
  main[class*="shell"] > div:first-of-type > section { padding-top: 18px !important; padding-bottom: 64px !important; }
  main[class*="shell"] [class*="pageHead"] { margin-bottom: 15px !important; }
  main[class*="shell"] [class*="productList"] { max-height: 52dvh !important; }
  main[class*="shell"] [class*="cart"] { max-height: 31dvh !important; min-height: 150px !important; }
}

@media (min-width: 768px) and (max-height: 680px) {
  main[class*="shell"] > div:first-of-type > aside [class*="sidebarBottom"] { display: none !important; }
  main[class*="shell"] > div:first-of-type > aside [class*="navButton"] { padding-top: 6px !important; padding-bottom: 6px !important; min-height: 34px !important; }
  main[class*="shell"] > div:first-of-type > section { padding-top: 12px !important; }
  main[class*="shell"] [class*="pageHead"] { margin-bottom: 11px !important; }
  main[class*="shell"] [class*="pageHead"] h1 { margin-top: 2px !important; margin-bottom: 2px !important; }
}

/* POS en notebook: el cobro debe conservar proporciones y nunca superponer controles.
   En pantallas bajas eliminamos el scroll interno del panel derecho y compactamos sólo
   el espacio vertical, manteniendo texto y zonas de toque cómodas. */
@media (min-width: 980px) and (max-width: 1500px) and (max-height: 900px) {
  main[class*="shell"] [class*="workspace"] {
    height: auto !important;
    min-height: 590px !important;
    max-height: none !important;
    overflow: visible !important;
  }
  main[class*="shell"] [class*="body"] {
    grid-template-columns: minmax(0, 1fr) minmax(390px, 430px) !important;
    align-items: stretch !important;
  }
  main[class*="shell"] [class*="cartPanel"] {
    min-height: 560px !important;
  }
  main[class*="shell"] [class*="cart"] {
    max-height: none !important;
    min-height: 0 !important;
  }
  main[class*="shell"] [class*="controls"] {
    overflow: visible !important;
    padding: 12px 13px 14px !important;
    gap: 9px !important;
    align-content: start !important;
  }
  main[class*="shell"] [class*="statusBanner"] {
    padding: 8px 10px !important;
    font-size: 11.5px !important;
    line-height: 1.35 !important;
  }
  main[class*="shell"] [class*="tools"] { gap: 7px !important; }
  main[class*="shell"] [class*="tool"] {
    min-height: 48px !important;
    padding: 10px 10px !important;
    border-radius: 13px !important;
    font-size: 12.5px !important;
  }
  main[class*="shell"] [class*="paymentLabel"] {
    margin-top: 0 !important;
    font-size: 10.5px !important;
  }
  main[class*="shell"] [class*="payments"] { gap: 6px !important; }
  main[class*="shell"] [class*="payment"] {
    min-height: 43px !important;
    padding: 9px 5px !important;
    border-radius: 12px !important;
    font-size: 12px !important;
    line-height: 1.05 !important;
  }
  main[class*="shell"] [class*="cashRow"] {
    gap: 8px !important;
    align-items: end !important;
  }
  main[class*="shell"] [class*="cashRow"] label {
    gap: 5px !important;
    font-size: 12px !important;
  }
  main[class*="shell"] [class*="cashRow"] input {
    min-height: 44px !important;
    padding: 9px 11px !important;
    font-size: 13px !important;
  }
  main[class*="shell"] [class*="change"] {
    min-width: 76px !important;
    min-height: 44px !important;
    padding: 7px 10px !important;
  }
  main[class*="shell"] [class*="change"] span { font-size: 9.5px !important; }
  main[class*="shell"] [class*="change"] strong { font-size: 15.5px !important; }
  main[class*="shell"] [class*="checkoutBox"] {
    margin-top: 0 !important;
    padding: 11px 12px !important;
    gap: 8px !important;
    border-radius: 15px !important;
  }
  main[class*="shell"] [class*="summary"] {
    font-size: 11.5px !important;
    line-height: 1.25 !important;
  }
  main[class*="shell"] [class*="summary"] strong { font-size: 12.5px !important; }
  main[class*="shell"] [class*="grand"] { margin-top: 2px !important; }
  main[class*="shell"] [class*="grand"] span { font-size: 12.5px !important; }
  main[class*="shell"] [class*="grand"] strong { font-size: 28px !important; }
  main[class*="shell"] [class*="checkoutActions"] { gap: 8px !important; }
  main[class*="shell"] [class*="checkoutActions"] button {
    min-height: 54px !important;
    border-radius: 14px !important;
    font-size: 14px !important;
  }
  main[class*="shell"] [class*="hint"] {
    padding-top: 0 !important;
    font-size: 10.5px !important;
    line-height: 1.3 !important;
  }
}

/* Si además la notebook es angosta, el panel de cobro baja debajo del carrito en lugar
   de quedar comprimido. Así funciona bien con zoom del navegador o escalado de Windows. */
@media (min-width: 768px) and (max-width: 1180px) and (max-height: 900px) {
  main[class*="shell"] [class*="workspace"] {
    height: auto !important;
    min-height: 0 !important;
    max-height: none !important;
    overflow: visible !important;
  }
  main[class*="shell"] [class*="body"] {
    grid-template-columns: minmax(0, 1fr) !important;
  }
  main[class*="shell"] [class*="cartPanel"] {
    min-height: 300px !important;
    border-right: 0 !important;
    border-bottom: 1px solid var(--line,#e6ede9) !important;
  }
  main[class*="shell"] [class*="cart"] { max-height: 360px !important; }
  main[class*="shell"] [class*="controls"] {
    overflow: visible !important;
    grid-template-columns: minmax(0,1fr) !important;
  }
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