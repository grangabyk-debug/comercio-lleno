'use client'

import { useEffect,useMemo,useRef,useState,type FormEvent } from 'react'
import { createPortal } from 'react-dom'
import { loadPettyCashState,registerPettyCashMovement,setPettyCashBalanceWithPassword,type PettyCashKind,type PettyCashState } from '@/lib/comercio/petty-cash-api'
import { readTenantSession } from '@/lib/comercio/session'

const money=new Intl.NumberFormat('es-AR',{style:'currency',currency:'ARS',maximumFractionDigits:2})
type MoveKind='cash_to_petty'|'petty_withdrawal'

function ensureHost(){
  const expense=Array.from(document.querySelectorAll('button')).find(b=>(b.textContent||'').includes('Cargar gasto'))
  const bar=expense?.parentElement
  if(!bar)return null
  let host=bar.querySelector('[data-cl-petty-stable-host]') as HTMLElement|null
  if(!host){host=document.createElement('span');host.dataset.clPettyStableHost='1';host.style.display='contents';bar.appendChild(host)}
  return host
}
function refreshMain(){Array.from(document.querySelectorAll('button')).find(b=>(b.textContent||'').includes('Actualizar'))?.dispatchEvent(new MouseEvent('click',{bubbles:true}))}
function movementMeta(kind:PettyCashKind){
  if(kind==='cash_to_petty')return{label:'Retiro de mi caja',sign:'+',tone:'plus'}
  if(kind==='petty_withdrawal')return{label:'Retiro de caja chica',sign:'−',tone:'minus'}
  if(kind==='owner_adjustment_in')return{label:'Ajuste de saldo por propietario',sign:'+',tone:'owner'}
  return{label:'Ajuste de saldo por propietario',sign:'−',tone:'owner'}
}

export default function PettyCashRuntimeStable(){
  const[host,setHost]=useState<HTMLElement|null>(null)
  const[open,setOpen]=useState(false)
  const[state,setState]=useState<PettyCashState|null>(null)
  const[kind,setKind]=useState<MoveKind|null>(null)
  const[amount,setAmount]=useState('')
  const[note,setNote]=useState('')
  const[busy,setBusy]=useState(false)
  const[loading,setLoading]=useState(false)
  const[error,setError]=useState('')
  const[ok,setOk]=useState('')
  const[isOwner,setIsOwner]=useState(false)
  const[ownerEdit,setOwnerEdit]=useState(false)
  const[ownerBalance,setOwnerBalance]=useState('')
  const[ownerPassword,setOwnerPassword]=useState('')
  const loadedForHost=useRef<HTMLElement|null>(null)

  async function load(silent=false){
    const session=readTenantSession();if(!session)return
    setIsOwner(session.role==='owner')
    if(!silent)setLoading(true)
    try{const next=await loadPettyCashState(session);setState(next);setError('');if(!ownerEdit)setOwnerBalance(String(next.balance))}
    catch(e){setError(e instanceof Error?e.message:String(e))}
    finally{if(!silent)setLoading(false)}
  }

  useEffect(()=>{
    let stopped=false
    const sync=()=>{
      if(stopped)return
      const next=ensureHost();setHost(next)
      if(next&&loadedForHost.current!==next){loadedForHost.current=next;void load(true)}
      if(!next)loadedForHost.current=null
    }
    sync()
    const observer=new MutationObserver(sync);observer.observe(document.body,{childList:true,subtree:true})
    const branch=()=>{loadedForHost.current=null;setOwnerEdit(false);void load(true)}
    window.addEventListener('comercio:branch-ready',branch)
    return()=>{stopped=true;observer.disconnect();window.removeEventListener('comercio:branch-ready',branch);document.querySelector('[data-cl-petty-stable-host]')?.remove()}
  },[])

  useEffect(()=>{if(open)void load()},[open])

  async function submit(e:FormEvent){
    e.preventDefault();if(!kind)return
    if(kind==='petty_withdrawal'&&!note.trim()){setError('Indicá el motivo del retiro de caja chica.');return}
    const session=readTenantSession();if(!session)return
    setBusy(true);setError('');setOk('')
    try{
      const next=await registerPettyCashMovement(session,kind,Number(String(amount).replace(',','.')),note)
      setState(next);setOwnerBalance(String(next.balance))
      setOk(kind==='cash_to_petty'?'El dinero salió de la caja diaria y quedó guardado en caja chica.':'El retiro de caja chica quedó registrado con su motivo.')
      setKind(null);setAmount('');setNote('');refreshMain()
    }catch(e){setError(e instanceof Error?e.message:String(e))}
    finally{setBusy(false)}
  }

  async function submitOwnerAdjustment(e:FormEvent){
    e.preventDefault()
    const session=readTenantSession();if(!session)return
    setBusy(true);setError('');setOk('')
    try{
      const next=await setPettyCashBalanceWithPassword(session,Number(String(ownerBalance).replace(',','.')),ownerPassword)
      setState(next);setOwnerBalance(String(next.balance));setOwnerPassword('');setOwnerEdit(false)
      setOk(`Saldo de caja chica corregido a ${money.format(next.balance)}. El ajuste quedó auditado.`)
    }catch(e){setError(e instanceof Error?e.message:String(e))}
    finally{setBusy(false)}
  }

  const today=useMemo(()=>{
    if(!state?.cash_register_id)return{inside:0,outside:0}
    const rows=state.movements.filter(m=>m.cash_register_id===state.cash_register_id)
    return{inside:rows.filter(m=>m.kind==='cash_to_petty').reduce((a,m)=>a+m.amount,0),outside:rows.filter(m=>m.kind==='petty_withdrawal').reduce((a,m)=>a+m.amount,0)}
  },[state])

  return <>
    <style>{css}</style>
    {host&&createPortal(<button className="cl-petty-trigger" type="button" onClick={()=>setOpen(true)}>Caja chica{state?` · ${money.format(state.balance)}`:''}</button>,host)}
    {open&&createPortal(<div className="cl-petty-layer" onMouseDown={e=>{if(e.currentTarget===e.target&&!busy)setOpen(false)}}><section className="cl-petty-card">
      <header><div><span>CONTROL DE EFECTIVO RESERVADO</span><h2>Caja chica</h2><p>Representa el efectivo guardado en la caja fuerte del local. No se borra al cerrar la caja diaria.</p></div><div className="cl-petty-head-actions">{isOwner&&<button type="button" className="cl-petty-gear" onClick={()=>{setOwnerBalance(String(state?.balance||0));setOwnerPassword('');setError('');setOk('');setOwnerEdit(x=>!x)}} title="Ajuste de propietario" aria-label="Ajuste de propietario">⚙</button>}<button type="button" onClick={()=>setOpen(false)} aria-label="Cerrar">×</button></div></header>
      {ownerEdit&&<form className="cl-petty-owner" onSubmit={submitOwnerAdjustment}><div><span>SOLO PROPIETARIO</span><b>Corregir saldo de caja chica</b><small>Requiere la contraseña actual del propietario. La diferencia queda registrada en la auditoría.</small></div><label>Nuevo saldo<input autoFocus inputMode="decimal" value={ownerBalance} onChange={e=>setOwnerBalance(e.target.value)} placeholder="$ 0"/></label><label>Contraseña<input type="password" autoComplete="current-password" value={ownerPassword} onChange={e=>setOwnerPassword(e.target.value)} placeholder="Contraseña del propietario"/></label><div className="cl-petty-owner-actions"><button type="button" onClick={()=>{setOwnerEdit(false);setOwnerPassword('')}}>Cancelar</button><button disabled={busy||!ownerPassword}>{busy?'Verificando…':'Guardar ajuste'}</button></div></form>}
      <div className="cl-petty-total"><div><span>Efectivo en caja chica</span><strong>{loading?'Cargando…':money.format(state?.balance||0)}</strong><small>{state?.cash_open?'Caja diaria abierta':'Caja diaria cerrada · abrila para registrar movimientos'}</small></div><div><span>En esta caja</span><b>Guardado {money.format(today.inside)}</b><b>Retirado {money.format(today.outside)}</b></div></div>
      <div className="cl-petty-choices"><button disabled={!state?.cash_open||busy} className={kind==='cash_to_petty'?'active':''} onClick={()=>{setKind('cash_to_petty');setNote('');setError('');setOk('')}}><b>Retiro de mi caja</b><small>Saca efectivo de la caja diaria y lo guarda en la caja fuerte. Baja la caja del día y sube caja chica.</small></button><button disabled={!state?.cash_open||busy||!state?.balance} className={kind==='petty_withdrawal'?'active out':''} onClick={()=>{setKind('petty_withdrawal');setNote('');setError('');setOk('')}}><b>Retiro de caja chica</b><small>Saca efectivo de la caja fuerte. Reduce caja chica y registra el motivo del retiro.</small></button></div>
      {kind&&<form className="cl-petty-entry" onSubmit={submit}><div><b>{kind==='cash_to_petty'?'Guardar en caja chica':'Retirar de caja chica'}</b><button type="button" onClick={()=>setKind(null)}>Cancelar</button></div><label>Importe<input autoFocus inputMode="decimal" value={amount} onChange={e=>setAmount(e.target.value)} placeholder="$ 0"/></label><label>{kind==='petty_withdrawal'?'Motivo del retiro':'Detalle opcional'}<input required={kind==='petty_withdrawal'} value={note} onChange={e=>setNote(e.target.value)} placeholder={kind==='cash_to_petty'?'Ej: guardado en caja fuerte':'Ej: pago a proveedor, compra, cambio…'}/></label><button disabled={busy||kind==='petty_withdrawal'&&!note.trim()}>{busy?'Registrando…':'Confirmar'}</button></form>}
      {error&&<div className="cl-petty-msg error">{error}</div>}{ok&&<div className="cl-petty-msg ok">{ok}</div>}
      <section className="cl-petty-audit"><div className="cl-petty-audit-head"><div><span>AUDITORÍA</span><h3>Historial completo</h3><p>Fecha, hora, importe, motivo y ajustes del propietario. Los movimientos vinculados a una caja también se guardan dentro del resumen de cierre de ese día.</p></div><button type="button" onClick={()=>void load()} disabled={loading}>Actualizar</button></div><div className="cl-petty-rows">{state?.movements.length?state.movements.map(m=>{const meta=movementMeta(m.kind);return <div className="cl-petty-row" key={m.id}><i className={meta.tone}>{meta.sign}</i><div><b>{meta.label}</b><small>{new Date(m.occurred_at).toLocaleString('es-AR')}{m.note?` · ${m.note}`:''}</small></div><strong>{meta.sign} {money.format(m.amount)}</strong></div>}):<div className="cl-petty-empty">Todavía no hay movimientos.</div>}</div></section>
    </section></div>,document.body)}
  </>
}

const css=`
.cl-petty-trigger{min-height:52px!important;padding:13px 18px!important;border:1px solid rgba(109,54,216,.30)!important;border-radius:14px!important;background:linear-gradient(145deg,#fff,#f4eeff)!important;color:#5526ab!important;font-size:14px!important;font-weight:950!important;cursor:pointer!important;box-shadow:0 8px 20px rgba(70,37,99,.08)!important}main[class*="dark"] .cl-petty-trigger{background:#211a25!important;color:#d5c2fb!important;border-color:#55406c!important;box-shadow:none!important}
.cl-petty-layer{position:fixed;inset:0;z-index:190;background:rgba(10,7,12,.70);display:grid;place-items:center;padding:18px;backdrop-filter:blur(7px)}.cl-petty-card{width:min(780px,96vw);max-height:92dvh;overflow:auto;background:#fbf9fc;color:#211a25;border:1px solid #e4dce8;border-radius:24px;padding:22px;box-shadow:0 30px 100px rgba(22,11,29,.36)}body.comercio-dark .cl-petty-card{background:#171219;color:#f6eff8;border-color:#3d3243}.cl-petty-card>header{display:flex;justify-content:space-between;align-items:flex-start;gap:18px}.cl-petty-card>header span,.cl-petty-audit-head span{display:block;color:#ff641d;font-size:10px;font-weight:950;letter-spacing:.14em}.cl-petty-card>header h2{font-size:30px;margin:5px 0;letter-spacing:-.04em}.cl-petty-card>header p{margin:0;color:#766d7b;font-size:12px;line-height:1.5;font-weight:700}.cl-petty-head-actions{display:flex;gap:7px}.cl-petty-head-actions>button{width:38px;height:38px;border:1px solid #ded5e4;border-radius:11px;background:#fff;color:#251d29;font-size:23px;cursor:pointer}.cl-petty-head-actions>.cl-petty-gear{font-size:17px;color:#5b31ad;background:#f5efff;border-color:#dfd0f6}body.comercio-dark .cl-petty-head-actions>button{background:#211a25;color:#eee6f1;border-color:#44364b}body.comercio-dark .cl-petty-head-actions>.cl-petty-gear{color:#ceb8fb;border-color:#594471;background:#2a2033}
.cl-petty-owner{margin-top:14px;border:1px solid #d9c9ef;background:#f8f3ff;border-radius:17px;padding:14px;display:grid;grid-template-columns:1fr 1fr;gap:10px}.cl-petty-owner>div:first-child{grid-column:1/-1}.cl-petty-owner span,.cl-petty-owner b,.cl-petty-owner small{display:block}.cl-petty-owner span{font-size:9px;font-weight:950;letter-spacing:.14em;color:#6d36d8}.cl-petty-owner b{margin-top:3px;font-size:13px}.cl-petty-owner small{margin-top:4px;font-size:10px;color:#746a79;line-height:1.45}.cl-petty-owner label{display:grid;gap:5px;font-size:10px;font-weight:850;color:#685f6c}.cl-petty-owner input{min-height:42px;border:1px solid #d8cce5;border-radius:10px;background:#fff;color:#211a25;padding:8px 10px}.cl-petty-owner-actions{grid-column:1/-1;display:flex!important;justify-content:flex-end;gap:8px}.cl-petty-owner-actions button{min-height:39px;border-radius:10px;padding:0 13px;border:1px solid #ddd3e5;background:#fff;color:#4e4354;font-weight:900;cursor:pointer}.cl-petty-owner-actions button:last-child{background:#6d36d8;color:#fff;border-color:#6d36d8}body.comercio-dark .cl-petty-owner{background:#241b2d;border-color:#5a4470}body.comercio-dark .cl-petty-owner small,body.comercio-dark .cl-petty-owner label{color:#b2a6b8}body.comercio-dark .cl-petty-owner input{background:#151117;color:#f7f1f8;border-color:#493b50}body.comercio-dark .cl-petty-owner-actions button{background:#211a25;color:#eee6f1;border-color:#493b50}body.comercio-dark .cl-petty-owner-actions button:last-child{background:#7040cf;border-color:#8052dc}
.cl-petty-total{margin-top:17px;border-radius:20px;background:linear-gradient(135deg,#171318,#2b1d34 55%,#5c2ab9);color:#fff;padding:20px 22px;display:flex;justify-content:space-between;align-items:center;gap:24px}.cl-petty-total>div:last-child{min-width:190px;border-left:1px solid rgba(255,255,255,.18);padding-left:22px}.cl-petty-total span,.cl-petty-total small,.cl-petty-total b{display:block}.cl-petty-total span{font-size:10px;color:#cfc3d4;font-weight:850}.cl-petty-total strong{display:block;font-size:38px;letter-spacing:-.05em;margin-top:4px}.cl-petty-total small{font-size:10px;color:#b9aebe;margin-top:5px}.cl-petty-total b{font-size:11px;margin-top:6px}
.cl-petty-choices{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:12px}.cl-petty-choices button{min-height:108px;text-align:left;border:1px solid #e0d7e5;border-radius:17px;background:#fff;color:#261f2a;padding:15px;cursor:pointer}.cl-petty-choices button b,.cl-petty-choices button small{display:block}.cl-petty-choices button b{font-size:14px}.cl-petty-choices button small{font-size:10.5px;color:#746a79;line-height:1.45;margin-top:6px}.cl-petty-choices button.active{border:2px solid #6d36d8;background:#f3edff;box-shadow:0 0 0 3px rgba(109,54,216,.07)}.cl-petty-choices button.out{border-color:#df754d;background:#fff3ee}.cl-petty-choices button:disabled{opacity:.42;cursor:not-allowed}body.comercio-dark .cl-petty-choices button{background:#211a25;color:#f1eaf3;border-color:#403447}body.comercio-dark .cl-petty-choices button small{color:#aaa0ae}body.comercio-dark .cl-petty-choices button.active{background:#2a2036;border-color:#8e66df}
.cl-petty-entry{margin-top:11px;border:1px solid #dfd5e5;border-radius:17px;background:#fff;padding:14px;display:grid;grid-template-columns:1fr 1fr auto;gap:9px;align-items:end}.cl-petty-entry>div{grid-column:1/-1;display:flex;align-items:center;justify-content:space-between}.cl-petty-entry>div b{font-size:12px}.cl-petty-entry>div button{border:0;background:transparent;color:#6d36d8;font-weight:900;cursor:pointer}.cl-petty-entry label{display:grid;gap:5px;font-size:10px;color:#685f6c;font-weight:850}.cl-petty-entry input{min-height:42px;border:1px solid #dcd2e2;border-radius:10px;background:#fbf9fc;color:#211a25;padding:8px 10px;font-size:12px}.cl-petty-entry>button{min-height:42px;border:0;border-radius:10px;background:linear-gradient(135deg,#6d36d8,#5120b4);color:#fff;padding:0 16px;font-weight:950;cursor:pointer}.cl-petty-entry>button:disabled{opacity:.48;cursor:not-allowed}body.comercio-dark .cl-petty-entry{background:#211a25;border-color:#403447}body.comercio-dark .cl-petty-entry input{background:#151117;color:#f7f1f8;border-color:#493b50}.cl-petty-msg{margin-top:9px;padding:9px 11px;border-radius:11px;font-size:10.5px;font-weight:800}.cl-petty-msg.error{background:#fff0ed;border:1px solid #efb5a8;color:#a53f2d}.cl-petty-msg.ok{background:#eef9f3;border:1px solid #a9dcc2;color:#21754b}
.cl-petty-audit{margin-top:13px;background:#fff;border:1px solid #e2d9e7;border-radius:17px;overflow:hidden}.cl-petty-audit-head{display:flex;justify-content:space-between;gap:16px;align-items:flex-end;padding:14px 15px;border-bottom:1px solid #eee8f1}.cl-petty-audit-head h3{font-size:15px;margin:3px 0}.cl-petty-audit-head p{margin:0;color:#796f7e;font-size:9.5px;line-height:1.4;max-width:560px}.cl-petty-audit-head>button{border:1px solid #ddd4e2;border-radius:9px;background:#fbf9fc;padding:7px 9px;font-size:9.5px;font-weight:850;cursor:pointer}.cl-petty-rows{max-height:270px;overflow:auto}.cl-petty-row{display:grid;grid-template-columns:32px minmax(0,1fr) auto;gap:10px;align-items:center;padding:11px 14px;border-bottom:1px solid #f0ebf2}.cl-petty-row:last-child{border-bottom:0}.cl-petty-row i{width:30px;height:30px;border-radius:9px;display:grid;place-items:center;font-style:normal;font-size:17px;font-weight:950}.cl-petty-row i.plus{background:#eee6ff;color:#6731cf}.cl-petty-row i.minus{background:#fff0e9;color:#d7541b}.cl-petty-row i.owner{background:#eef2f7;color:#4a5360}.cl-petty-row b,.cl-petty-row small{display:block}.cl-petty-row b{font-size:11.5px}.cl-petty-row small{font-size:9.5px;color:#7a7080;margin-top:3px}.cl-petty-row strong{font-size:11.5px;white-space:nowrap}.cl-petty-empty{padding:25px;text-align:center;color:#7a7080;font-size:10.5px}body.comercio-dark .cl-petty-audit{background:#1d1721;border-color:#3d3243}body.comercio-dark .cl-petty-audit-head{border-color:#342b39}body.comercio-dark .cl-petty-audit-head p,body.comercio-dark .cl-petty-row small{color:#aaa0ae}body.comercio-dark .cl-petty-row{border-color:#312837}body.comercio-dark .cl-petty-row i.owner{background:#2c2631;color:#d5cbd9}
@media(max-width:700px){.cl-petty-card{padding:16px;border-radius:19px}.cl-petty-owner{grid-template-columns:1fr}.cl-petty-owner>div:first-child,.cl-petty-owner-actions{grid-column:auto}.cl-petty-total{align-items:flex-start}.cl-petty-total strong{font-size:30px}.cl-petty-total>div:last-child{display:none}.cl-petty-choices{grid-template-columns:1fr}.cl-petty-entry{grid-template-columns:1fr}.cl-petty-entry>div{grid-column:auto}.cl-petty-row{grid-template-columns:30px minmax(0,1fr)}.cl-petty-row strong{grid-column:2}}
`
