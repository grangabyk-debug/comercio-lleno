'use client'

import { useEffect,useMemo,useState,type FormEvent } from 'react'
import { createPortal } from 'react-dom'
import { loadPettyCashState,registerPettyCashMovement,type PettyCashState } from '@/lib/comercio/petty-cash-api'
import { readTenantSession } from '@/lib/comercio/session'

const money=new Intl.NumberFormat('es-AR',{style:'currency',currency:'ARS',maximumFractionDigits:2})
type MoveKind='cash_to_petty'|'petty_withdrawal'

function findButtonHost(){
  const expense=Array.from(document.querySelectorAll('button')).find(b=>(b.textContent||'').trim().includes('Cargar gasto'))
  const bar=expense?.parentElement
  if(!bar)return null
  let host=bar.querySelector('[data-cl-petty-host]') as HTMLElement|null
  if(!host){host=document.createElement('span');host.dataset.clPettyHost='1';host.style.display='contents';bar.appendChild(host)}
  return host
}

function findCloseSummaryHost(){
  const heading=Array.from(document.querySelectorAll('h2')).find(h=>{
    const text=(h.textContent||'').trim()
    return text.includes('¿Confirmás cerrar la caja?')||text==='Caja cerrada'
  })
  const card=heading?.closest('div[class*="card"]') as HTMLElement|null
  if(!card)return null
  let host=card.querySelector('[data-cl-petty-close-summary]') as HTMLElement|null
  if(!host){host=document.createElement('div');host.dataset.clPettyCloseSummary='1';const actions=card.querySelector('[class*="modalActions"]');if(actions)card.insertBefore(host,actions);else card.appendChild(host)}
  return host
}

function refreshMain(){
  const button=Array.from(document.querySelectorAll('button')).find(b=>/Actualizar/.test(b.textContent||'')) as HTMLButtonElement|undefined
  button?.click()
}

export default function PettyCashRuntime(){
  const[host,setHost]=useState<HTMLElement|null>(null)
  const[closeHost,setCloseHost]=useState<HTMLElement|null>(null)
  const[open,setOpen]=useState(false)
  const[state,setState]=useState<PettyCashState|null>(null)
  const[loading,setLoading]=useState(false)
  const[kind,setKind]=useState<MoveKind|null>(null)
  const[amount,setAmount]=useState('')
  const[note,setNote]=useState('')
  const[busy,setBusy]=useState(false)
  const[error,setError]=useState('')
  const[message,setMessage]=useState('')
  const[activeRegister,setActiveRegister]=useState<string|null>(null)

  async function load(silent=false){
    const session=readTenantSession();if(!session)return
    if(!silent)setLoading(true)
    try{
      const next=await loadPettyCashState(session)
      setState(next)
      if(next.cash_register_id)setActiveRegister(next.cash_register_id)
      setError('')
    }catch(e){setError(e instanceof Error?e.message:String(e))}
    finally{if(!silent)setLoading(false)}
  }

  useEffect(()=>{
    let disposed=false
    const sync=()=>{
      if(disposed)return
      const nextHost=findButtonHost();setHost(nextHost)
      setCloseHost(findCloseSummaryHost())
      if(nextHost&&!state)void load(true)
    }
    sync()
    const observer=new MutationObserver(sync)
    observer.observe(document.body,{childList:true,subtree:true})
    const onUpdated=()=>void load(true)
    window.addEventListener('comercio:branch-ready',onUpdated)
    return()=>{disposed=true;observer.disconnect();window.removeEventListener('comercio:branch-ready',onUpdated);document.querySelector('[data-cl-petty-host]')?.remove();document.querySelector('[data-cl-petty-close-summary]')?.remove()}
  },[])

  useEffect(()=>{if(open)void load()},[open])

  async function submit(e:FormEvent){
    e.preventDefault();if(!kind)return
    const session=readTenantSession();if(!session)return
    setBusy(true);setError('');setMessage('')
    try{
      const next=await registerPettyCashMovement(session,kind,Number(String(amount).replace(',','.')),note)
      setState(next);if(next.cash_register_id)setActiveRegister(next.cash_register_id)
      setMessage(kind==='cash_to_petty'?'El efectivo salió de la caja diaria y quedó guardado en caja chica.':'El retiro de caja chica quedó registrado.')
      setAmount('');setNote('');setKind(null);refreshMain()
    }catch(e){setError(e instanceof Error?e.message:String(e))}
    finally{setBusy(false)}
  }

  const dayMovements=useMemo(()=>{
    if(!state)return[]
    const register=state.cash_register_id||activeRegister
    return register?state.movements.filter(m=>m.cash_register_id===register):[]
  },[state,activeRegister])
  const dayIn=dayMovements.filter(m=>m.kind==='cash_to_petty').reduce((a,m)=>a+m.amount,0)
  const dayOut=dayMovements.filter(m=>m.kind==='petty_withdrawal').reduce((a,m)=>a+m.amount,0)

  return <>
    <style>{css}</style>
    {host&&createPortal(<button type="button" className="cl-petty-button" onClick={()=>setOpen(true)}>Caja chica{state?` · ${money.format(state.balance)}`:''}</button>,host)}
    {open&&createPortal(<div className="cl-petty-overlay" onMouseDown={e=>{if(e.currentTarget===e.target&&!busy)setOpen(false)}}>
      <section className="cl-petty-modal" aria-label="Caja chica">
        <header className="cl-petty-head"><div><span>EFECTIVO RESERVADO</span><h2>Caja chica</h2><p>Dinero guardado fuera de la caja diaria. El saldo continúa de un día al otro y cada movimiento queda auditado.</p></div><button type="button" className="cl-petty-x" onClick={()=>setOpen(false)} aria-label="Cerrar">×</button></header>
        <div className="cl-petty-balance"><div><span>Efectivo en caja chica</span><strong>{loading?'Cargando…':money.format(state?.balance||0)}</strong><small>{state?.cash_open?'Caja diaria abierta · podés registrar movimientos':'Caja diaria cerrada · abrila para mover efectivo'}</small></div><div className="cl-petty-safe"><i/><i/><i/></div></div>
        <div className="cl-petty-actions">
          <button type="button" disabled={!state?.cash_open||busy} className={kind==='cash_to_petty'?'active':''} onClick={()=>{setKind('cash_to_petty');setError('');setMessage('')}}><b>Retiro de mi caja</b><small>Saca efectivo de la caja diaria y lo guarda en caja chica. El saldo de caja chica aumenta.</small></button>
          <button type="button" disabled={!state?.cash_open||busy||!state?.balance} className={kind==='petty_withdrawal'?'active danger':''} onClick={()=>{setKind('petty_withdrawal');setError('');setMessage('')}}><b>Retiro de caja chica</b><small>Saca efectivo de la caja chica. El saldo reservado disminuye y queda registrado.</small></button>
        </div>
        {kind&&<form className="cl-petty-form" onSubmit={submit}><div className="cl-petty-form-title"><b>{kind==='cash_to_petty'?'Guardar efectivo en caja chica':'Retirar efectivo de caja chica'}</b><button type="button" onClick={()=>setKind(null)}>Cancelar</button></div><label>Importe<input autoFocus inputMode="decimal" value={amount} onChange={e=>setAmount(e.target.value)} placeholder="$ 0"/></label><label>Detalle opcional<input value={note} onChange={e=>setNote(e.target.value)} placeholder={kind==='cash_to_petty'?'Ej: efectivo guardado en caja fuerte':'Ej: pago a proveedor desde caja fuerte'}/></label><button className="cl-petty-submit" disabled={busy}>{busy?'Registrando…':'Confirmar movimiento'}</button></form>}
        {error&&<div className="cl-petty-error">{error}</div>}{message&&<div className="cl-petty-ok">{message}</div>}
        <section className="cl-petty-history"><div className="cl-petty-history-head"><div><span>AUDITORÍA</span><h3>Historial de caja chica</h3></div><button type="button" onClick={()=>void load()} disabled={loading}>Actualizar</button></div><div className="cl-petty-list">{state?.movements.length?state.movements.map(m=><div className="cl-petty-row" key={m.id}><span className={m.kind==='cash_to_petty'?'in':'out'}>{m.kind==='cash_to_petty'?'+':'−'}</span><div><b>{m.kind==='cash_to_petty'?'Retiro de mi caja':'Retiro de caja chica'}</b><small>{new Date(m.occurred_at).toLocaleString('es-AR')}{m.note?` · ${m.note}`:''}</small></div><strong>{m.kind==='cash_to_petty'?'+ ':'− '}{money.format(m.amount)}</strong></div>):<div className="cl-petty-empty">Todavía no hay movimientos de caja chica.</div>}</div></section>
      </section>
    </div>,document.body)}
    {closeHost&&state&&createPortal(<div className="cl-petty-close-card"><div><span>CAJA CHICA EN ESTA JORNADA</span><b>Guardado {money.format(dayIn)} · Retirado {money.format(dayOut)}</b><small>Saldo persistente al momento de la consulta: {money.format(state.balance)}. Estos movimientos también quedan guardados dentro del cierre.</small></div></div>,closeHost)}
  </>
}

const css=`
.cl-petty-button{min-height:52px!important;padding:13px 18px!important;border:1px solid rgba(109,54,216,.28)!important;border-radius:14px!important;background:linear-gradient(145deg,#fff,#f5efff)!important;color:#5125a3!important;font-size:14px!important;font-weight:950!important;cursor:pointer!important;box-shadow:0 8px 20px rgba(66,35,92,.08)!important}
main[class*="dark"] .cl-petty-button{background:#211a25!important;color:#d4c0fb!important;border-color:#55406c!important;box-shadow:none!important}
.cl-petty-overlay{position:fixed;inset:0;z-index:180;background:rgba(12,8,14,.68);display:grid;place-items:center;padding:20px;backdrop-filter:blur(7px)}
.cl-petty-modal{width:min(760px,96vw);max-height:92dvh;overflow:auto;border:1px solid #e6ddec;border-radius:24px;background:#fbf9fc;color:#1d1820;box-shadow:0 32px 100px rgba(20,9,28,.34);padding:22px}
body.comercio-dark .cl-petty-modal{background:#171219;color:#f7f1f8;border-color:#3d3243}
.cl-petty-head{display:flex;justify-content:space-between;align-items:flex-start;gap:18px}.cl-petty-head span,.cl-petty-history-head span,.cl-petty-close-card span{display:block;color:#ff641d;font-size:10px;font-weight:950;letter-spacing:.14em}.cl-petty-head h2{font-size:30px;letter-spacing:-.04em;margin:5px 0}.cl-petty-head p{max-width:590px;margin:0;color:#766d7b;font-size:13px;line-height:1.5;font-weight:700}.cl-petty-x{width:38px;height:38px;border:1px solid #ded5e4;border-radius:12px;background:#fff;color:#251d29;font-size:23px;cursor:pointer}.cl-petty-balance{margin-top:18px;border-radius:20px;padding:20px 22px;background:linear-gradient(135deg,#171318,#32203f 55%,#5d2abf);color:#fff;display:flex;justify-content:space-between;align-items:center;gap:20px;overflow:hidden}.cl-petty-balance span{display:block;font-size:11px;font-weight:850;color:#d9cfe0}.cl-petty-balance strong{display:block;font-size:38px;letter-spacing:-.05em;margin-top:4px}.cl-petty-balance small{display:block;font-size:11px;color:#bfb3c6;margin-top:5px}.cl-petty-safe{width:76px;height:64px;border:2px solid rgba(255,255,255,.35);border-radius:16px;display:grid;place-items:center;position:relative;background:rgba(255,255,255,.08)}.cl-petty-safe:before{content:"";width:30px;height:30px;border:3px solid rgba(255,255,255,.75);border-radius:50%}.cl-petty-safe i{position:absolute;width:4px;height:4px;border-radius:50%;background:#ff8c56}.cl-petty-safe i:nth-child(1){transform:translate(0,-20px)}.cl-petty-safe i:nth-child(2){transform:translate(20px,0)}.cl-petty-safe i:nth-child(3){transform:translate(-20px,0)}
.cl-petty-actions{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:14px}.cl-petty-actions button{min-height:112px;border:1px solid #e1d8e7;border-radius:18px;background:#fff;color:#261f2a;text-align:left;padding:16px;cursor:pointer}.cl-petty-actions button b,.cl-petty-actions button small{display:block}.cl-petty-actions button b{font-size:15px}.cl-petty-actions button small{margin-top:7px;color:#746a79;font-size:11px;line-height:1.45}.cl-petty-actions button.active{border:2px solid #6d36d8;background:#f4efff;box-shadow:0 0 0 3px rgba(109,54,216,.08)}.cl-petty-actions button.danger{border-color:#da704a;background:#fff4ef}.cl-petty-actions button:disabled{opacity:.45;cursor:not-allowed}body.comercio-dark .cl-petty-actions button{background:#211a25;color:#f1eaf3;border-color:#3d3243}body.comercio-dark .cl-petty-actions button small{color:#aaa0ae}body.comercio-dark .cl-petty-actions button.active{background:#2a2036;border-color:#8e66df}
.cl-petty-form{margin-top:12px;border:1px solid #dfd5e5;border-radius:18px;background:#fff;padding:16px;display:grid;grid-template-columns:1fr 1fr auto;gap:10px;align-items:end}.cl-petty-form-title{grid-column:1/-1;display:flex;justify-content:space-between;align-items:center}.cl-petty-form-title b{font-size:13px}.cl-petty-form-title button{border:0;background:transparent;color:#6d36d8;font-weight:850;cursor:pointer}.cl-petty-form label{display:grid;gap:6px;color:#665d6a;font-size:11px;font-weight:850}.cl-petty-form input{min-height:43px;border:1px solid #dcd2e2;border-radius:11px;background:#fbf9fc;color:#211a25;padding:9px 11px;font-size:13px}.cl-petty-submit{min-height:43px;border:0;border-radius:11px;background:linear-gradient(135deg,#6d36d8,#5020b3);color:#fff;padding:0 16px;font-weight:950;cursor:pointer}body.comercio-dark .cl-petty-form{background:#211a25;border-color:#403447}body.comercio-dark .cl-petty-form input{background:#151117;color:#f7f1f8;border-color:#493b50}
.cl-petty-error,.cl-petty-ok{margin-top:10px;border-radius:12px;padding:10px 12px;font-size:11px;font-weight:800}.cl-petty-error{background:#fff0ee;border:1px solid #efb4a6;color:#a83f2d}.cl-petty-ok{background:#eef9f3;border:1px solid #a8dbc1;color:#21764c}
.cl-petty-history{margin-top:14px;border:1px solid #e2d9e7;border-radius:18px;background:#fff;overflow:hidden}.cl-petty-history-head{display:flex;justify-content:space-between;align-items:flex-end;padding:15px 16px;border-bottom:1px solid #eee8f1}.cl-petty-history-head h3{margin:3px 0 0;font-size:16px}.cl-petty-history-head button{border:1px solid #ded5e4;border-radius:9px;background:#fbf9fc;padding:7px 10px;font-size:10px;font-weight:850;cursor:pointer}.cl-petty-list{max-height:280px;overflow:auto}.cl-petty-row{display:grid;grid-template-columns:34px minmax(0,1fr) auto;gap:10px;align-items:center;padding:12px 15px;border-bottom:1px solid #f0ebf2}.cl-petty-row:last-child{border-bottom:0}.cl-petty-row>span{width:31px;height:31px;display:grid;place-items:center;border-radius:10px;font-size:18px;font-weight:950}.cl-petty-row>span.in{background:#ede5ff;color:#6933cf}.cl-petty-row>span.out{background:#fff0e9;color:#d95219}.cl-petty-row b,.cl-petty-row small{display:block}.cl-petty-row b{font-size:12px}.cl-petty-row small{margin-top:3px;color:#7b7180;font-size:10px}.cl-petty-row strong{font-size:12px;white-space:nowrap}.cl-petty-empty{padding:25px;text-align:center;color:#7a7080;font-size:11px}body.comercio-dark .cl-petty-history{background:#1d1721;border-color:#3d3243}body.comercio-dark .cl-petty-history-head{border-color:#342b39}body.comercio-dark .cl-petty-row{border-color:#312837}body.comercio-dark .cl-petty-row small{color:#a99fad}
.cl-petty-close-card{margin:12px 0;border:1px solid #dacded;border-radius:13px;background:#f7f2ff;padding:12px 13px;color:#2b2131}.cl-petty-close-card b,.cl-petty-close-card small{display:block}.cl-petty-close-card b{font-size:12px;margin-top:4px}.cl-petty-close-card small{font-size:10px;color:#766b7b;margin-top:4px;line-height:1.4}body.comercio-dark .cl-petty-close-card{background:#271e2e;border-color:#4a395a;color:#f2ebf5}body.comercio-dark .cl-petty-close-card small{color:#aaa0ae}
@media(max-width:700px){.cl-petty-modal{padding:16px;border-radius:19px}.cl-petty-balance strong{font-size:31px}.cl-petty-actions{grid-template-columns:1fr}.cl-petty-form{grid-template-columns:1fr}.cl-petty-form-title{grid-column:auto}.cl-petty-submit{width:100%}.cl-petty-row{grid-template-columns:31px minmax(0,1fr)}.cl-petty-row strong{grid-column:2}.cl-petty-safe{display:none}}
`
