'use client'

import { useEffect } from 'react'

const MOBILE_CSS = `
@media (max-width: 767px) {
  html, body { overflow-x: hidden !important; }
  body > .cl-brand-overlay { display: none !important; }

  main[class*="shell"] { min-width: 0 !important; overflow-x: hidden !important; }

  main[class*="shell"] > header {
    height: auto !important;
    min-height: 0 !important;
    padding: 10px 12px !important;
    display: grid !important;
    grid-template-columns: minmax(0, 1fr) auto !important;
    align-items: center !important;
    gap: 8px 10px !important;
  }

  main[class*="shell"] > header > div:first-of-type {
    min-width: 0 !important;
    width: auto !important;
    gap: 8px !important;
  }

  main[class*="shell"] > header > div:first-of-type > div:first-child {
    width: 36px !important;
    height: 36px !important;
    min-width: 36px !important;
    border-radius: 11px !important;
  }

  main[class*="shell"] > header > div:first-of-type > div:last-child {
    min-width: 0 !important;
  }

  main[class*="shell"] > header > div:first-of-type > div:last-child > div:first-child {
    font-size: 17px !important;
    white-space: nowrap !important;
  }

  main[class*="shell"] > header > div:first-of-type > div:last-child > div:last-child {
    max-width: 220px !important;
    overflow: hidden !important;
    text-overflow: ellipsis !important;
    white-space: nowrap !important;
  }

  .cl-mobile-menu-button {
    display: inline-grid !important;
    place-items: center !important;
    width: 38px !important;
    height: 38px !important;
    border: 1px solid #dfe7e3 !important;
    border-radius: 11px !important;
    background: #fff !important;
    color: #15231d !important;
    font-size: 20px !important;
    line-height: 1 !important;
    cursor: pointer !important;
  }

  main[class*="shell"] > header > div:last-of-type {
    grid-column: 1 / -1 !important;
    width: 100% !important;
    min-width: 0 !important;
    display: grid !important;
    grid-template-columns: repeat(6, minmax(0, 1fr)) !important;
    gap: 6px !important;
  }

  main[class*="shell"] > header > div:last-of-type > * {
    min-width: 0 !important;
    width: 100% !important;
    padding: 7px 5px !important;
    font-size: 9px !important;
    white-space: nowrap !important;
    overflow: hidden !important;
    text-overflow: ellipsis !important;
  }

  main[class*="shell"] > header > div:last-of-type > :nth-child(1),
  main[class*="shell"] > header > div:last-of-type > :nth-child(2) {
    grid-column: span 3 !important;
  }

  main[class*="shell"] > header > div:last-of-type > :nth-child(3) {
    display: none !important;
  }

  main[class*="shell"] > header > div:last-of-type > :nth-child(4),
  main[class*="shell"] > header > div:last-of-type > :nth-child(5),
  main[class*="shell"] > header > div:last-of-type > :nth-child(6) {
    grid-column: span 2 !important;
  }

  main[class*="shell"] > div:first-of-type {
    display: block !important;
    min-height: calc(100dvh - 118px) !important;
  }

  main[class*="shell"] > div:first-of-type > aside {
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    bottom: 0 !important;
    width: min(86vw, 310px) !important;
    height: 100dvh !important;
    z-index: 90 !important;
    padding: 14px 12px 30px !important;
    overflow-y: auto !important;
    transform: translateX(-105%) !important;
    transition: transform .2s ease !important;
    box-shadow: 20px 0 45px rgba(0,0,0,.16) !important;
  }

  html.cl-mobile-menu-open main[class*="shell"] > div:first-of-type > aside {
    transform: translateX(0) !important;
  }

  .cl-mobile-drawer-head {
    display: flex !important;
    align-items: center !important;
    justify-content: space-between !important;
    gap: 12px !important;
    padding: 2px 4px 12px !important;
    margin-bottom: 6px !important;
    border-bottom: 1px solid #dfe7e3 !important;
  }

  .cl-mobile-drawer-head strong { font-size: 14px !important; }
  .cl-mobile-drawer-close {
    width: 34px !important;
    height: 34px !important;
    border: 1px solid #dfe7e3 !important;
    border-radius: 10px !important;
    background: #fff !important;
    font-size: 20px !important;
    cursor: pointer !important;
  }

  .cl-mobile-backdrop {
    display: none !important;
    position: fixed !important;
    inset: 0 !important;
    z-index: 89 !important;
    border: 0 !important;
    background: rgba(8, 20, 16, .42) !important;
    padding: 0 !important;
  }

  html.cl-mobile-menu-open .cl-mobile-backdrop { display: block !important; }

  main[class*="shell"] > div:first-of-type > section {
    width: 100% !important;
    max-width: none !important;
    min-width: 0 !important;
    margin: 0 !important;
    padding: 18px 14px 88px !important;
  }

  main[class*="shell"] [class*="pageHead"] {
    align-items: flex-start !important;
    flex-direction: column !important;
    gap: 10px !important;
    margin-bottom: 16px !important;
  }

  main[class*="shell"] [class*="pageHead"] h1 {
    font-size: 28px !important;
    line-height: 1.05 !important;
  }

  main[class*="shell"] [class*="kpis"] {
    grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
    gap: 10px !important;
  }

  main[class*="shell"] [class*="kpi"] {
    min-width: 0 !important;
    padding: 14px !important;
  }

  main[class*="shell"] [class*="kpi"] strong {
    font-size: 23px !important;
  }

  main[class*="shell"] [class*="gridTwo"],
  main[class*="shell"] [class*="posGrid"] {
    grid-template-columns: minmax(0, 1fr) !important;
  }

  main[class*="shell"] [class*="saleCard"] {
    position: static !important;
    top: auto !important;
  }

  main[class*="shell"] [class*="panel"],
  main[class*="shell"] [class*="settingCard"],
  main[class*="shell"] [class*="reportCard"] {
    min-width: 0 !important;
  }

  main[class*="shell"] [class*="table"] {
    overflow-x: auto !important;
    -webkit-overflow-scrolling: touch !important;
  }

  main[class*="shell"] [class*="tableRow"] {
    min-width: 680px !important;
  }

  main[class*="shell"] input,
  main[class*="shell"] select,
  main[class*="shell"] textarea,
  main[class*="shell"] button {
    max-width: 100%;
  }
}

@media (max-width: 390px) {
  main[class*="shell"] > div:first-of-type > section { padding-left: 10px !important; padding-right: 10px !important; }
  main[class*="shell"] [class*="kpis"] { gap: 8px !important; }
  main[class*="shell"] [class*="kpi"] { padding: 12px !important; }
  main[class*="shell"] [class*="kpi"] strong { font-size: 21px !important; }
}
`

export default function MobileResponsiveFix() {
  useEffect(() => {
    const style = document.createElement('style')
    style.id = 'cl-mobile-responsive-fix'
    style.textContent = MOBILE_CSS
    document.head.appendChild(style)

    const shell = document.querySelector('main[class*="shell"]')
    const header = shell?.querySelector(':scope > header')
    const layout = shell?.querySelector(':scope > div:first-of-type')
    const sidebar = layout?.querySelector(':scope > aside')
    if (!header || !sidebar) return () => style.remove()

    const menuButton = document.createElement('button')
    menuButton.type = 'button'
    menuButton.className = 'cl-mobile-menu-button'
    menuButton.setAttribute('aria-label', 'Abrir menú')
    menuButton.textContent = '☰'

    const backdrop = document.createElement('button')
    backdrop.type = 'button'
    backdrop.className = 'cl-mobile-backdrop'
    backdrop.setAttribute('aria-label', 'Cerrar menú')

    const drawerHead = document.createElement('div')
    drawerHead.className = 'cl-mobile-drawer-head'
    const drawerTitle = document.createElement('strong')
    drawerTitle.textContent = 'Menú'
    const closeButton = document.createElement('button')
    closeButton.type = 'button'
    closeButton.className = 'cl-mobile-drawer-close'
    closeButton.setAttribute('aria-label', 'Cerrar menú')
    closeButton.textContent = '×'
    drawerHead.append(drawerTitle, closeButton)

    const open = () => document.documentElement.classList.add('cl-mobile-menu-open')
    const close = () => document.documentElement.classList.remove('cl-mobile-menu-open')

    menuButton.addEventListener('click', open)
    backdrop.addEventListener('click', close)
    closeButton.addEventListener('click', close)
    const onSidebarClick = (event: Event) => {
      const target = event.target as Element | null
      const button = target?.closest('button')
      if (!button || button.classList.contains('cl-mobile-drawer-close')) return
      const label = button.textContent?.replace(/\s+/g, ' ').trim() || ''
      if (label.startsWith('Gestión')) return
      close()
    }
    sidebar.addEventListener('click', onSidebarClick)

    header.appendChild(menuButton)
    sidebar.prepend(drawerHead)
    document.body.appendChild(backdrop)

    return () => {
      close()
      sidebar.removeEventListener('click', onSidebarClick)
      menuButton.removeEventListener('click', open)
      backdrop.removeEventListener('click', close)
      closeButton.removeEventListener('click', close)
      menuButton.remove()
      backdrop.remove()
      drawerHead.remove()
      style.remove()
    }
  }, [])

  return null
}
