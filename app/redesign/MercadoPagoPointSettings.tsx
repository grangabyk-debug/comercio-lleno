'use client'

import { useEffect,useMemo,useState } from 'react'
import type { TenantSession } from '@/lib/comercio/types'
import styles from './mercadopago-point-settings.module.css'

const configuredUrl=process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_URL=!configuredUrl||configuredUrl.includes('wtcntclzcubkbtcsqkzc.supabase.co')?'https://comerciolleno.supabase.co':configuredUrl
const PUBLISHABLE_KEY=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY??'sb_publishable_02U2KDLDTR42KxdcFHtfYw_IDM00Deb'
const FUNCTION_URL=`${SUPABASE_URL.replace(/\/$/,'')}/functions/v1/mercadopago-point`

type Terminal={id:string;pos_id?:string|null;store_id?:string|null;external_pos_id?:string|null;operating_mode?:string|null}
type Status={app_configured:boolean;connected:boolean;ready:boolean;terminal?:{id?:string|null;operating_mode?:string|null;store_id?:string|null;pos_id?:string|null};last_error?:string|null}

function authHeaders(session:TenantSession){return{apikey:PUBLISHABLE_KEY,Authorization:`Bearer ${session.token}`,'Content-Type':'application/json'}}

async function callPoint(session:TenantSession,body:Record<string,unknown>){
  const response=await fetch(FUNCTION_URL,{method:'POST',headers:authHeaders(session),body:JSON.stringify(body),cache:'no-store'})
  const data=await response.json().catch(()=>({}))
  if(!response.ok||data?.ok===false)throw new Error(data?.error||'No se pudo comunicar con Mercado Pago.')
  return data
}

export default function MercadoPagoPointSettings({session,message}:{session:TenantSession;message:(value:string)=>void}){
  const[status,setStatus]=useState<Status|null>(null)
  const[terminals,setTerminals]=useState<Terminal[]>([])
  const[selected,setSelected]=useState('')
  const[loading,setLoading]=useState(true)
  const[busy,setBusy]=useState(false)
  const[error,setError]=useState('')
  const selectedTerminal=useMemo(()=>terminals.find(x=>x.id===selected)||null,[terminals,selected])

  async function refresh(){
    setLoading(true);setError('')
    try{
      const next=await callPoint(session,{action:'status'}) as Status&{ok:boolean}
      setStatus(next)
      if(next.connected){
        const list=await callPoint(session,{action:'terminals'})
        const rows:Array<Terminal>=list.terminals||[]
        setTerminals(rows)
        const current=String(next.terminal?.id||'')
        setSelected(current&&rows.some(x=>x.id===current)?current:(rows[0]?.id||''))
      }else{setTerminals([]);setSelected('')}
    }catch(e){setError(e instanceof Error?e.message:String(e))}
    finally{setLoading(false)}
  }

  useEffect(()=>{void refresh()},[session.companyId])

  async function connect(){
    setBusy(true);setError('')
    try{
      const data=await callPoint(session,{action:'start_oauth',return_url:window.location.href})
      if(!data.auth_url)throw new Error('Mercado Pago no devolvió la pantalla de autorización.')
      window.location.assign(data.auth_url)
    }catch(e){setError(e instanceof Error?e.message:String(e));setBusy(false)}
  }

  async function useTerminal(){
    if(!selected)return
    setBusy(true);setError('')
    try{
      await callPoint(session,{action:'setup_terminal',terminal_id:selected})
      message('Point vinculado correctamente. Si Mercado Pago lo solicita, reiniciá la terminal una vez.')
      await refresh()
    }catch(e){setError(e instanceof Error?e.message:String(e))}
    finally{setBusy(false)}
  }

  async function disconnect(){
    if(!window.confirm('¿Desconectar Mercado Pago de Comercio Lleno?'))return
    setBusy(true);setError('')
    try{await callPoint(session,{action:'disconnect'});message('Mercado Pago fue desconectado.');await refresh()}
    catch(e){setError(e instanceof Error?e.message:String(e))}
    finally{setBusy(false)}
  }

  if(loading)return <section className={styles.shell}><div className={styles.loading}>Verificando Mercado Pago…</div></section>

  const ready=Boolean(status?.ready)
  const connected=Boolean(status?.connected)
  return <section className={styles.shell}>
    <div className={styles.header}>
      <div><span className={styles.eyebrow}>INTEGRACIONES</span><h2>Mercado Pago Point</h2><p>Conectá una cuenta de Mercado Pago y elegí el Point que va a recibir los importes desde la caja.</p></div>
      <div className={`${styles.state} ${ready?styles.ready:connected?styles.partial:styles.off}`}>{ready?'Point listo':connected?'Cuenta conectada':'Sin conectar'}</div>
    </div>

    {error&&<div className={styles.error}>{error}</div>}
    {status?.last_error&&<div className={styles.warning}>{status.last_error}</div>}

    {!connected?<div className={styles.connectCard}>
      <div className={styles.connectText}><span>PASO 1</span><h3>Conectá tu cuenta</h3><p>No necesitás copiar Access Tokens, IDs ni claves. Vas a Mercado Pago, autorizás Comercio Lleno y volvés automáticamente.</p></div>
      <div className={styles.connectAction}><button className={styles.primary} disabled={busy} onClick={()=>void connect()}>{busy?'Abriendo Mercado Pago…':'Conectar Mercado Pago'}</button>{!status?.app_configured&&<small>La aplicación de Point todavía requiere completar la configuración del proveedor. Podés tocar el botón para ver exactamente qué falta.</small>}</div>
    </div>:<>
      <div className={styles.steps}>
        <div className={styles.done}><b>1</b><span><strong>Cuenta Mercado Pago</strong><small>Autorizada correctamente</small></span></div>
        <div className={selected?styles.done:styles.current}><b>2</b><span><strong>Elegir Point</strong><small>{terminals.length?`${terminals.length} dispositivo${terminals.length===1?'':'s'} encontrado${terminals.length===1?'':'s'}`:'Buscando dispositivos'}</small></span></div>
        <div className={ready?styles.done:styles.current}><b>3</b><span><strong>Activar en la caja</strong><small>{ready?'Listo para recibir cobros':'Seleccioná el dispositivo'}</small></span></div>
      </div>

      <div className={styles.grid}>
        <article className={styles.card}>
          <div className={styles.cardHead}><div><span>DISPOSITIVO</span><h3>Elegí tu Point</h3></div><button className={styles.refresh} onClick={()=>void refresh()} disabled={busy}>Actualizar</button></div>
          {terminals.length?<><label className={styles.field}>Point disponible<select value={selected} onChange={e=>setSelected(e.target.value)}>{terminals.map((item,index)=><option key={item.id} value={item.id}>{item.external_pos_id||`Point ${index+1}`} · {item.operating_mode||'Sin configurar'}</option>)}</select></label>
            <div className={styles.terminalInfo}><div><span>Estado</span><strong>{selectedTerminal?.operating_mode==='PDV'?'Modo caja':'Requiere activación'}</strong></div><div><span>Sucursal Mercado Pago</span><strong>{selectedTerminal?.store_id||'Automática'}</strong></div><div><span>Caja Mercado Pago</span><strong>{selectedTerminal?.pos_id||'Automática'}</strong></div></div>
            <button className={styles.primary} disabled={!selected||busy} onClick={()=>void useTerminal()}>{busy?'Configurando…':ready&&status?.terminal?.id===selected?'Point vinculado':'Usar este Point'}</button>
          </>:<div className={styles.empty}><strong>No encontramos un Point</strong><p>Encendé el dispositivo, verificá que pertenezca a esta cuenta de Mercado Pago y tocá “Actualizar”.</p></div>}
        </article>

        <article className={styles.card}>
          <div className={styles.cardHead}><div><span>FUNCIONAMIENTO</span><h3>Qué va a pasar al cobrar</h3></div></div>
          <div className={styles.flow}><div><b>1</b><p><strong>Elegís Mercado Pago</strong><span>en el cobro de Comercio Lleno.</span></p></div><div><b>2</b><p><strong>El importe aparece solo</strong><span>en este Point físico.</span></p></div><div><b>3</b><p><strong>El cliente paga</strong><span>con tarjeta o medio disponible.</span></p></div><div><b>4</b><p><strong>Comercio Lleno confirma</strong><span>y recién entonces cierra la venta.</span></p></div></div>
        </article>
      </div>

      {ready&&<div className={styles.readyCard}><div><span>LISTO PARA USAR</span><h3>Este comercio ya tiene un Point vinculado</h3><p>Terminal {String(status?.terminal?.id||'').slice(0,8)}… · modo PDV. El próximo paso es activar el envío automático desde el botón Mercado Pago del POS.</p></div><div className={styles.readyDot}/></div>}
      <div className={styles.footer}><button className={styles.danger} disabled={busy} onClick={()=>void disconnect()}>Desconectar Mercado Pago</button><span>Las credenciales se guardan cifradas y nunca se muestran al cajero.</span></div>
    </>}
  </section>
}
