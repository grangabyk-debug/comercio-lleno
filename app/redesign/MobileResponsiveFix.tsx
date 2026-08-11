'use client'

import { useEffect } from 'react'

const MOBILE_CSS = `
@media (max-width:767px){
  html,body{overflow-x:hidden!important}
  body>.cl-brand-overlay{display:none!important}
  main[class*="shell"]{min-width:0!important;overflow-x:hidden!important;background:#f6f9f7!important}

  main[class*="shell"]>header{position:sticky!important;top:0!important;z-index:70!important;height:58px!important;min-height:58px!important;padding:8px 12px!important;display:flex!important;align-items:center!important;justify-content:space-between!important;gap:10px!important;background:rgba(255,255,255,.98)!important;border-bottom:1px solid #e5ece8!important;box-shadow:0 5px 18px rgba(16,45,31,.05)!important}
  main[class*="shell"]>header>div:first-of-type{min-width:0!important;width:auto!important;gap:8px!important}
  main[class*="shell"]>header>div:first-of-type>div:first-child{width:34px!important;height:34px!important;min-width:34px!important;border-radius:10px!important;font-size:11px!important}
  main[class*="shell"]>header>div:first-of-type>div:last-child{min-width:0!important}
  main[class*="shell"]>header>div:first-of-type>div:last-child>div:first-child{font-size:16px!important;line-height:1.05!important;white-space:nowrap!important}
  main[class*="shell"]>header>div:first-of-type>div:last-child>div:last-child{max-width:205px!important;overflow:hidden!important;text-overflow:ellipsis!important;white-space:nowrap!important;font-size:9px!important}
  main[class*="shell"]>header>div:last-of-type{display:none!important}

  .cl-mobile-menu-button{display:inline-grid!important;place-items:center!important;width:42px!important;height:42px!important;flex:0 0 42px!important;border:1px solid #dce7e1!important;border-radius:13px!important;background:#fff!important;color:#10281d!important;font-size:23px!important;line-height:1!important;cursor:pointer!important;box-shadow:0 4px 12px rgba(16,45,31,.06)!important}

  main[class*="shell"]>div:first-of-type{display:block!important;min-height:calc(100dvh - 58px)!important}
  main[class*="shell"]>div:first-of-type>aside{position:fixed!important;top:0!important;left:0!important;bottom:0!important;width:min(88vw,318px)!important;height:100dvh!important;z-index:92!important;padding:12px 12px 22px!important;overflow-y:auto!important;transform:translateX(-105%)!important;transition:transform .22s ease!important;box-shadow:24px 0 55px rgba(0,0,0,.18)!important;background:#fff!important}
  html.cl-mobile-menu-open main[class*="shell"]>div:first-of-type>aside{transform:translateX(0)!important}
  .cl-mobile-backdrop{display:none!important;position:fixed!important;inset:0!important;z-index:91!important;border:0!important;background:rgba(7,20,14,.48)!important;padding:0!important}
  html.cl-mobile-menu-open .cl-mobile-backdrop{display:block!important}

  .cl-mobile-drawer-head{position:sticky!important;top:-12px!important;z-index:3!important;display:flex!important;align-items:center!important;justify-content:space-between!important;gap:12px!important;padding:13px 4px 12px!important;margin:0 0 10px!important;background:#fff!important;border-bottom:1px solid #e5ece8!important}
  .cl-mobile-drawer-title{display:flex!important;flex-direction:column!important;gap:2px!important}.cl-mobile-drawer-title strong{font-size:15px!important;color:#10281d!important}.cl-mobile-drawer-title small{font-size:9px!important;color:#759083!important;letter-spacing:.08em!important}
  .cl-mobile-drawer-close{width:36px!important;height:36px!important;border:1px solid #dfe7e3!important;border-radius:11px!important;background:#fff!important;font-size:21px!important;cursor:pointer!important}
  .cl-mobile-drawer-tools{display:grid!important;grid-template-columns:repeat(3,minmax(0,1fr))!important;gap:7px!important;margin:13px 2px 2px!important;padding-top:12px!important;border-top:1px solid #e5ece8!important}
  .cl-mobile-drawer-tools button{min-height:40px!important;padding:7px 5px!important;border:1px solid #dfe7e3!important;border-radius:11px!important;background:#f8fbf9!important;color:#233b30!important;font-size:10px!important;font-weight:800!important}.cl-mobile-drawer-tools button:last-child{color:#b23a3a!important;background:#fff7f7!important}

  main[class*="shell"]>div:first-of-type>section{width:100%!important;max-width:none!important;min-width:0!important;margin:0!important;padding:14px 12px 96px!important}
  main[class*="shell"] [class*="pageHead"]{align-items:flex-start!important;flex-direction:column!important;gap:6px!important;margin-bottom:12px!important}
  main[class*="shell"] [class*="pageHead"] h1{font-size:26px!important;line-height:1.02!important;margin:0!important}
  main[class*="shell"] [class*="pageHead"] p{font-size:11px!important;line-height:1.35!important;margin-top:3px!important}
  main[class*="shell"] [class*="eyebrow"]{font-size:9px!important}
  main[class*="shell"] [class*="kpis"]{grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:8px!important}
  main[class*="shell"] [class*="kpi"]{min-width:0!important;min-height:108px!important;padding:12px!important;border-radius:16px!important}
  main[class*="shell"] [class*="kpi"] strong{font-size:22px!important}
  main[class*="shell"] [class*="gridTwo"],main[class*="shell"] [class*="posGrid"]{grid-template-columns:minmax(0,1fr)!important;gap:10px!important}
  html.cl-mobile-dashboard-view main[class*="shell"] [class*="pageHead"] p{display:none!important}
  html.cl-mobile-dashboard-view main[class*="shell"] [class*="gridTwo"]>:last-child{display:none!important}

  html.cl-mobile-pos-view main[class*="shell"]>div:first-of-type>section{padding-top:10px!important;padding-bottom:28px!important}
  html.cl-mobile-pos-view main[class*="shell"] [class*="pageHead"]{margin-bottom:8px!important}
  html.cl-mobile-pos-view main[class*="shell"] [class*="pageHead"] p,html.cl-mobile-pos-view main[class*="shell"] [class*="headBadges"]{display:none!important}
  html.cl-mobile-pos-view main[class*="shell"] [class*="pageHead"] h1{font-size:22px!important}
  main[class*="shell"] [class*="searchCard"]{position:sticky!important;top:66px!important;z-index:25!important;padding:8px!important;margin-bottom:8px!important;border-radius:15px!important;box-shadow:0 8px 22px rgba(20,54,38,.08)!important}
  main[class*="shell"] [class*="searchBox"]{gap:6px!important}main[class*="shell"] [class*="searchBox"] input{min-width:0!important;font-size:16px!important}main[class*="shell"] [class*="searchBox"] button{min-height:42px!important;padding:8px 11px!important}main[class*="shell"] [class*="scanHint"]{display:none!important}
  main[class*="shell"] [class*="productList"]{max-height:38dvh!important;overflow-y:auto!important;overscroll-behavior:contain!important;-webkit-overflow-scrolling:touch!important;border-radius:14px!important}
  main[class*="shell"] [class*="productRow"]{min-height:58px!important;padding:9px 8px!important;gap:7px!important}main[class*="shell"] [class*="productIcon"]{display:none!important}main[class*="shell"] [class*="productInfo"]{min-width:0!important}main[class*="shell"] [class*="productInfo"] b{font-size:12px!important;white-space:normal!important;line-height:1.2!important}main[class*="shell"] [class*="productInfo"] small{display:none!important}main[class*="shell"] [class*="stockMini"]{font-size:9px!important;padding:4px 6px!important}main[class*="shell"] [class*="productRow"]>strong{font-size:13px!important;white-space:nowrap!important}
  main[class*="shell"] [class*="saleCard"]{position:static!important;top:auto!important;scroll-margin-top:70px!important;margin-top:2px!important;border-radius:16px!important}main[class*="shell"] [class*="saleCardHead"]{padding:11px 12px!important}main[class*="shell"] [class*="saleCardHead"] h2{font-size:18px!important}main[class*="shell"] [class*="checkout"]{padding:11px 12px 12px!important}main[class*="shell"] [class*="payments"]{grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:6px!important}main[class*="shell"] [class*="payment"]{min-height:42px!important;padding:8px!important;font-size:10px!important}main[class*="shell"] [class*="charge"]{position:sticky!important;bottom:8px!important;z-index:20!important;min-height:54px!important;border-radius:14px!important;font-size:15px!important;box-shadow:0 10px 26px rgba(20,130,75,.22)!important}

  main[class*="shell"] [class*="table"]{overflow-x:auto!important;-webkit-overflow-scrolling:touch!important}main[class*="shell"] [class*="tableRow"]{min-width:680px!important}

  .cl-mobile-sale-fab{position:fixed!important;right:16px!important;bottom:18px!important;z-index:78!important;width:68px!important;height:68px!important;border:0!important;border-radius:22px!important;background:#159558!important;color:#fff!important;font-size:40px!important;font-weight:400!important;line-height:1!important;box-shadow:0 16px 32px rgba(19,126,75,.34)!important;cursor:pointer!important}
  .cl-mobile-sale-fab:after{content:'Venta';position:absolute;left:50%;top:49px;transform:translateX(-50%);font-size:8px;font-weight:900;letter-spacing:.04em}
  html.cl-mobile-pos-view .cl-mobile-sale-fab{display:none!important}
}
@media(max-width:390px){main[class*="shell"]>div:first-of-type>section{padding-left:10px!important;padding-right:10px!important}main[class*="shell"] [class*="kpi"]{min-height:102px!important;padding:10px!important}main[class*="shell"] [class*="kpi"] strong{font-size:20px!important}}
`

function normalize(value:string){return value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,' ').trim()}

export default function MobileResponsiveFix(){
  useEffect(()=>{
    const style=document.createElement('style')
    style.id='cl-mobile-responsive-fix'
    style.textContent=MOBILE_CSS
    document.head.appendChild(style)

    const shell=document.querySelector('main[class*="shell"]')
    const header=shell?.querySelector(':scope > header')
    const layout=shell?.querySelector(':scope > div:first-of-type')
    const sidebar=layout?.querySelector(':scope > aside')
    const content=layout?.querySelector(':scope > section')
    if(!shell||!header||!sidebar||!content)return()=>style.remove()

    const shellEl=shell as HTMLElement
    const headerEl=header as HTMLElement
    const sidebarEl=sidebar as HTMLElement
    const contentEl=content as HTMLElement

    const findButton=(label:string)=>{
      const wanted=normalize(label)
      return Array.from(shellEl.querySelectorAll('button')).find(button=>normalize(button.textContent||'')===wanted||normalize(button.textContent||'').includes(wanted)) as HTMLButtonElement|undefined
    }

    const menu=document.createElement('button')
    menu.type='button';menu.className='cl-mobile-menu-button';menu.setAttribute('aria-label','Abrir menú');menu.textContent='☰'
    const backdrop=document.createElement('button')
    backdrop.type='button';backdrop.className='cl-mobile-backdrop';backdrop.setAttribute('aria-label','Cerrar menú')
    const head=document.createElement('div')
    head.className='cl-mobile-drawer-head'
    const title=document.createElement('div')
    title.className='cl-mobile-drawer-title';title.innerHTML='<strong>Comercio Lleno</strong><small>MENÚ MOBILE · PREVIEW</small>'
    const closeBtn=document.createElement('button')
    closeBtn.type='button';closeBtn.className='cl-mobile-drawer-close';closeBtn.setAttribute('aria-label','Cerrar menú');closeBtn.textContent='×'
    head.append(title,closeBtn)

    const tools=document.createElement('div')
    tools.className='cl-mobile-drawer-tools'
    const refreshBtn=document.createElement('button');refreshBtn.type='button';refreshBtn.textContent='↻ Actualizar'
    const themeBtn=document.createElement('button');themeBtn.type='button';themeBtn.textContent='☾ Tema'
    const logoutBtn=document.createElement('button');logoutBtn.type='button';logoutBtn.textContent='Salir'
    tools.append(refreshBtn,themeBtn,logoutBtn)

    const fab=document.createElement('button')
    fab.type='button';fab.className='cl-mobile-sale-fab';fab.setAttribute('aria-label','Nueva venta');fab.title='Nueva venta';fab.textContent='+'

    const open=()=>document.documentElement.classList.add('cl-mobile-menu-open')
    const close=()=>document.documentElement.classList.remove('cl-mobile-menu-open')
    const goSale=()=>{findButton('Nueva venta')?.click();close()}
    const syncMode=()=>{
      const pageTitle=normalize(contentEl.querySelector('h1')?.textContent||'')
      document.documentElement.classList.toggle('cl-mobile-pos-view',pageTitle.includes('nueva venta'))
      document.documentElement.classList.toggle('cl-mobile-dashboard-view',pageTitle==='inicio')
    }

    menu.addEventListener('click',open);backdrop.addEventListener('click',close);closeBtn.addEventListener('click',close);fab.addEventListener('click',goSale)
    refreshBtn.addEventListener('click',()=>location.reload())
    themeBtn.addEventListener('click',()=>{const b=Array.from(shellEl.querySelectorAll('header button')).find(x=>/oscuro|claro/i.test(x.textContent||'')) as HTMLButtonElement|undefined;b?.click()})
    logoutBtn.addEventListener('click',()=>{const b=Array.from(shellEl.querySelectorAll('header button')).find(x=>normalize(x.textContent||'')==='salir') as HTMLButtonElement|undefined;b?.click()})
    const onSidebarClick=(event:Event)=>{const button=(event.target as Element|null)?.closest('button');if(!button||button.classList.contains('cl-mobile-drawer-close'))return;if(normalize(button.textContent||'').startsWith('gestion'))return;setTimeout(close,40)}
    sidebarEl.addEventListener('click',onSidebarClick)

    headerEl.appendChild(menu);sidebarEl.prepend(head);sidebarEl.appendChild(tools);document.body.append(backdrop,fab)
    syncMode()
    const observer=new MutationObserver(syncMode)
    observer.observe(contentEl,{childList:true,subtree:true,characterData:true})

    return()=>{observer.disconnect();close();document.documentElement.classList.remove('cl-mobile-pos-view','cl-mobile-dashboard-view');sidebarEl.removeEventListener('click',onSidebarClick);menu.remove();backdrop.remove();fab.remove();head.remove();tools.remove();style.remove()}
  },[])
  return null
}
