'use client'

import { useEffect,useState } from 'react'
import { createPortal } from 'react-dom'

type FitMode='auto'|'notebook'|'tablet'|'pc'
const KEY='cl-display-fit'
const labels:Record<FitMode,string>={auto:'Automático',notebook:'Notebook',tablet:'Tablet',pc:'PC'}

function isMode(value:string|null):value is FitMode{return value==='auto'||value==='notebook'||value==='tablet'||value==='pc'}
function findBottomBar(){return document.querySelector('main[class*="shell"] [class*="bottomBar"]') as HTMLElement|null}

export default function DisplayFitControl(){
  const[mode,setMode]=useState<FitMode>('auto')
  const[open,setOpen]=useState(false)
  const[host,setHost]=useState<HTMLElement|null>(null)

  useEffect(()=>{
    const stored=localStorage.getItem(KEY)
    const initial=isMode(stored)?stored:'auto'
    setMode(initial)
    document.documentElement.dataset.clDisplayFit=initial
    let disposed=false
    const sync=()=>{
      if(disposed)return
      const bar=findBottomBar()
      if(!bar){setHost(null);return}
      let node=bar.querySelector('[data-cl-display-fit-host]') as HTMLElement|null
      if(!node){node=document.createElement('span');node.dataset.clDisplayFitHost='1';bar.appendChild(node)}
      setHost(node)
    }
    sync()
    const observer=new MutationObserver(sync);observer.observe(document.body,{childList:true,subtree:true})
    return()=>{disposed=true;observer.disconnect();document.querySelector('[data-cl-display-fit-host]')?.remove();delete document.documentElement.dataset.clDisplayFit}
  },[])

  function choose(next:FitMode){
    setMode(next);setOpen(false);localStorage.setItem(KEY,next);document.documentElement.dataset.clDisplayFit=next
    window.dispatchEvent(new CustomEvent('comercio:display-fit',{detail:next}))
  }

  return <>
    <style>{css}</style>
    {host&&createPortal(<button type="button" className="cl-fit-trigger" onClick={()=>setOpen(x=>!x)} aria-expanded={open}>Pantalla: {labels[mode]}</button>,host)}
    {open&&createPortal(<div className="cl-fit-menu" role="dialog" aria-label="Adaptar pantalla"><div className="cl-fit-title"><b>Adaptar pantalla</b><small>Usá Automático normalmente. Elegí un formato manual si este equipo no se acomoda bien.</small></div>{(['auto','notebook','tablet','pc'] as FitMode[]).map(item=><button type="button" key={item} className={mode===item?'active':''} onClick={()=>choose(item)}><b>{labels[item]}</b><small>{item==='auto'?'Detecta el tamaño del equipo':item==='notebook'?'Compacta navegación y POS':item==='tablet'?'Apila paneles y agranda zonas de toque':'Usa el escritorio completo'}</small></button>)}<button type="button" className="cl-fit-close" onClick={()=>setOpen(false)}>Cerrar</button></div>,document.body)}
  </>
}

const css=`
[data-cl-display-fit-host]{display:inline-flex;align-items:center;margin-left:auto;margin-right:12px}.cl-fit-trigger{min-height:34px!important;border:1px solid #3b3041!important;border-radius:10px!important;background:#211a25!important;color:#eee6f1!important;padding:7px 11px!important;font-size:11px!important;font-weight:900!important;cursor:pointer!important;white-space:nowrap!important}.cl-fit-trigger:hover{border-color:#6d4aa3!important;color:#d6c1ff!important}.cl-fit-menu{position:fixed;right:14px;bottom:58px;z-index:220;width:min(330px,calc(100vw - 28px));padding:12px;border:1px solid #ded5e4;border-radius:17px;background:#fff;color:#211a25;box-shadow:0 22px 65px rgba(26,14,33,.28);display:grid;gap:7px}.cl-fit-title{padding:4px 5px 7px}.cl-fit-title b,.cl-fit-title small{display:block}.cl-fit-title b{font-size:14px}.cl-fit-title small{font-size:10px;color:#766d7b;line-height:1.4;margin-top:4px}.cl-fit-menu>button:not(.cl-fit-close){border:1px solid #e5dde9;border-radius:12px;background:#fbf9fc;color:#211a25;text-align:left;padding:10px 11px;cursor:pointer}.cl-fit-menu>button:not(.cl-fit-close) b,.cl-fit-menu>button:not(.cl-fit-close) small{display:block}.cl-fit-menu>button:not(.cl-fit-close) b{font-size:12px}.cl-fit-menu>button:not(.cl-fit-close) small{font-size:9.5px;color:#766d7b;margin-top:3px}.cl-fit-menu>button.active{border-color:#7d51d5!important;background:#f2ebff!important;box-shadow:0 0 0 2px rgba(109,54,216,.08)}.cl-fit-close{border:0;background:transparent;color:#6d36d8;padding:7px;font-weight:900;cursor:pointer}body.comercio-dark .cl-fit-menu{background:#19151c;color:#f4edf6;border-color:#3d3243}body.comercio-dark .cl-fit-menu>button:not(.cl-fit-close){background:#211a25;color:#f4edf6;border-color:#3d3243}body.comercio-dark .cl-fit-menu>button:not(.cl-fit-close) small,body.comercio-dark .cl-fit-title small{color:#aaa0ae}body.comercio-dark .cl-fit-menu>button.active{background:#2c2138!important;border-color:#8059ce!important}

/* Formato Notebook: menú angosto, POS en dos columnas y controles compactos. */
html[data-cl-display-fit="notebook"] main[class*="shell"]>div[class*="layout"]{grid-template-columns:82px minmax(0,1fr)!important}
html[data-cl-display-fit="notebook"] main[class*="shell"]>div[class*="layout"]>aside{padding-inline:8px!important}
html[data-cl-display-fit="notebook"] main[class*="shell"]>div[class*="layout"]>aside [class*="navLabel"],html[data-cl-display-fit="notebook"] main[class*="shell"]>div[class*="layout"]>aside [class*="mainLabel"],html[data-cl-display-fit="notebook"] main[class*="shell"] [class*="managementLabel"]{display:none!important}
html[data-cl-display-fit="notebook"] main[class*="shell"]>div[class*="layout"]>aside [class*="navButton"],html[data-cl-display-fit="notebook"] main[class*="shell"] [class*="managementButton"]{justify-content:center!important;padding-inline:6px!important;gap:0!important}
html[data-cl-display-fit="notebook"] main[class*="shell"]>div[class*="layout"]>section[class*="content"]{padding:18px 18px 82px!important}
html[data-cl-display-fit="notebook"] main[class*="shell"] section[class*="workspace"]{height:calc(100dvh - 190px)!important;min-height:470px!important;max-height:650px!important;overflow:hidden!important}
html[data-cl-display-fit="notebook"] main[class*="shell"] section[class*="workspace"]>[class*="body"]{grid-template-columns:minmax(0,1fr) minmax(360px,420px)!important;overflow:hidden!important}
html[data-cl-display-fit="notebook"] main[class*="shell"] section[class*="workspace"] [class*="controls"]{overflow-y:auto!important;overflow-x:hidden!important;padding:8px 10px 10px!important;gap:6px!important}
html[data-cl-display-fit="notebook"] main[class*="shell"] section[class*="workspace"] [class*="payments"]{grid-template-columns:repeat(3,minmax(0,1fr))!important;gap:5px!important}
html[data-cl-display-fit="notebook"] main[class*="shell"] section[class*="workspace"] [class*="payment"]{min-height:36px!important;padding:7px 3px!important;font-size:11px!important}
html[data-cl-display-fit="notebook"] main[class*="shell"] section[class*="workspace"] [class*="checkoutActions"] button{min-height:43px!important;font-size:12px!important}

/* Formato Tablet: navegación compacta y contenido apilado, aunque la pantalla física sea más ancha. */
html[data-cl-display-fit="tablet"] main[class*="shell"]>div[class*="layout"]{grid-template-columns:74px minmax(0,1fr)!important}
html[data-cl-display-fit="tablet"] main[class*="shell"]>div[class*="layout"]>aside{padding-inline:7px!important}
html[data-cl-display-fit="tablet"] main[class*="shell"]>div[class*="layout"]>aside [class*="navLabel"],html[data-cl-display-fit="tablet"] main[class*="shell"]>div[class*="layout"]>aside [class*="mainLabel"],html[data-cl-display-fit="tablet"] main[class*="shell"] [class*="managementLabel"]{display:none!important}
html[data-cl-display-fit="tablet"] main[class*="shell"]>div[class*="layout"]>aside [class*="navButton"],html[data-cl-display-fit="tablet"] main[class*="shell"] [class*="managementButton"]{justify-content:center!important;padding-inline:5px!important;gap:0!important}
html[data-cl-display-fit="tablet"] main[class*="shell"]>div[class*="layout"]>section[class*="content"]{padding:18px 16px 86px!important}
html[data-cl-display-fit="tablet"] main[class*="shell"] section[class*="workspace"]{height:auto!important;min-height:0!important;max-height:none!important;overflow:visible!important}
html[data-cl-display-fit="tablet"] main[class*="shell"] section[class*="workspace"]>[class*="body"]{grid-template-columns:1fr!important;display:grid!important}
html[data-cl-display-fit="tablet"] main[class*="shell"] section[class*="workspace"] [class*="cartPanel"]{min-height:280px!important;border-right:0!important;border-bottom:1px solid var(--line,#e6ede9)!important}
html[data-cl-display-fit="tablet"] main[class*="shell"] section[class*="workspace"] [class*="controls"]{overflow:visible!important}
html[data-cl-display-fit="tablet"] main[class*="shell"] [class*="metrics"],html[data-cl-display-fit="tablet"] main[class*="shell"] [class*="kpis"]{grid-template-columns:repeat(2,minmax(0,1fr))!important}

/* Formato PC: recupera ancho completo y proporciones de escritorio. */
html[data-cl-display-fit="pc"] main[class*="shell"]>div[class*="layout"]{grid-template-columns:224px minmax(0,1fr)!important}
html[data-cl-display-fit="pc"] main[class*="shell"]>div[class*="layout"]>aside{padding-inline:12px!important}
html[data-cl-display-fit="pc"] main[class*="shell"]>div[class*="layout"]>aside [class*="navLabel"],html[data-cl-display-fit="pc"] main[class*="shell"]>div[class*="layout"]>aside [class*="mainLabel"],html[data-cl-display-fit="pc"] main[class*="shell"] [class*="managementLabel"]{display:block!important}
html[data-cl-display-fit="pc"] main[class*="shell"]>div[class*="layout"]>aside [class*="navButton"],html[data-cl-display-fit="pc"] main[class*="shell"] [class*="managementButton"]{justify-content:flex-start!important;gap:11px!important;padding-inline:11px!important}
html[data-cl-display-fit="pc"] main[class*="shell"]>div[class*="layout"]>section[class*="content"]{padding:28px 30px 94px!important}
html[data-cl-display-fit="pc"] main[class*="shell"] section[class*="workspace"]{height:calc(100vh - 178px)!important;min-height:540px!important;max-height:760px!important}
html[data-cl-display-fit="pc"] main[class*="shell"] section[class*="workspace"]>[class*="body"]{grid-template-columns:minmax(0,1.45fr) minmax(390px,.85fr)!important}
html[data-cl-display-fit="pc"] main[class*="shell"] section[class*="workspace"] [class*="controls"]{overflow:auto!important}

@media(max-width:767px){[data-cl-display-fit-host]{display:none!important}.cl-fit-menu{display:none!important}}
`
