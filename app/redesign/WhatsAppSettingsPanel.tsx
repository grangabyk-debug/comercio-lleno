'use client'

import { useEffect,useMemo,useRef,useState } from 'react'
import type { TenantSession } from '@/lib/comercio/types'
import base from './settings-next.module.css'
import styles from './whatsapp-settings.module.css'

type Status={ok?:boolean;configured?:boolean;connected?:boolean;state?:string;instance?:string;error?:string;message?:string;licenseRequired?:boolean;qr?:{base64?:string;code?:string;pairingCode?:string;count?:number}|null}
type Props={session:TenantSession;message:(m:string)=>void}

async function callApi(session:TenantSession,payload:Record<string,unknown>){
  const response=await fetch('/api/redesign/whatsapp',{method:'POST',headers:{Authorization:`Bearer ${session.token}`,'Content-Type':'application/json'},body:JSON.stringify(payload),cache:'no-store'})
  const data=await response.json().catch(()=>({}))
  if(!response.ok&&!data?.error)data.error=`HTTP ${response.status}`
  return data as Status&{sent?:boolean;preview?:string}
}
function qrSource(value?:string){if(!value)return'';return value.startsWith('data:image')?value:`data:image/png;base64,${value}`}

export default function WhatsAppSettingsPanel({session,message}:Props){
  const[status,setStatus]=useState<Status>({state:'loading'}),[busy,setBusy]=useState(false),[number,setNumber]=useState(''),[preset,setPreset]=useState<'test'|'ticket'|'ready'>('test'),[ticketNumber,setTicketNumber]=useState('102'),[total,setTotal]=useState('5500'),[result,setResult]=useState('')
  const pollRef=useRef<number|null>(null)
  const tone=useMemo<'green'|'yellow'|'red'>(()=>status.connected?'green':status.state==='connecting'||status.state==='loading'?'yellow':'red',[status.connected,status.state])
  const label=useMemo(()=>status.connected?'Conectado':status.state==='loading'?'Revisando conexión…':status.state==='connecting'?'Esperando vinculación':status.state==='unconfigured'?'Servidor pendiente':status.licenseRequired?'Activación pendiente':status.state==='error'?'Error de conexión':'Desconectado',[status])

  async function refresh(){const next=await callApi(session,{action:'status'});setStatus(old=>({...old,...next,qr:next.connected?null:old.qr}));if(next.connected&&pollRef.current){window.clearInterval(pollRef.current);pollRef.current=null}}
  useEffect(()=>{void refresh();return()=>{if(pollRef.current)window.clearInterval(pollRef.current)}},[session.companyId])
  function startPolling(){if(pollRef.current)window.clearInterval(pollRef.current);pollRef.current=window.setInterval(()=>void refresh(),5000);window.setTimeout(()=>{if(pollRef.current){window.clearInterval(pollRef.current);pollRef.current=null}},90000)}
  async function connect(){setBusy(true);setResult('');try{const next=await callApi(session,{action:'connect'});setStatus(old=>({...old,...next}));if(next.error)setResult(next.error);if(!next.connected&&next.configured&&!next.licenseRequired)startPolling()}finally{setBusy(false)}}
  async function send(){setBusy(true);setResult('');try{const next=await callApi(session,{action:'send',number,preset,ticketNumber,total:Number(total||0)});if(next.sent){setResult(next.preview||'Mensaje enviado correctamente.');message('Mensaje de prueba enviado por WhatsApp.')}else setResult(next.error||'No se pudo enviar el mensaje.')}finally{setBusy(false)}}
  const qr=qrSource(status.qr?.base64)

  return <section className={`${base.panel} ${styles.panel}`}>
    <div className={styles.head}><div><h3>WhatsApp</h3><p>Vinculá el WhatsApp del comercio por QR y verificá la conexión antes de activar automatizaciones.</p></div><div className={`${styles.signal} ${styles[tone]}`}><span/><b>{label}</b></div></div>
    <div className={styles.statusGrid}><div><span>Estado</span><b>{label}</b></div><div><span>Instancia</span><b>{status.instance||'—'}</b></div><div><span>Tráfico de control</span><b>Bajo</b><small>Se consulta al abrir esta pestaña. Sólo se repite durante la vinculación.</small></div></div>
    {status.configured===false&&<div className={styles.notice}><b>La interfaz ya está lista.</b><br/>Falta conectar el servidor Evolution para generar un QR real. No se muestra ningún QR simulado.</div>}
    {status.licenseRequired&&<div className={styles.error}><b>Evolution requiere activación.</b><br/>El servidor está accesible pero todavía no permite crear la sesión.</div>}
    {status.error&&<div className={styles.error}>{status.error}</div>}
    <div className={styles.actions}><button className={base.primary} disabled={busy||status.configured===false||status.connected} onClick={()=>void connect()}>{busy?'Procesando…':status.qr?.base64?'Generar otro QR':'Vincular WhatsApp por QR'}</button><button className={styles.secondary} disabled={busy} onClick={()=>void refresh()}>Actualizar estado</button></div>
    {qr&&!status.connected&&<div className={styles.qrArea}><div className={styles.qrBox}><img src={qr} alt="Código QR para vincular WhatsApp"/></div><div><h4>Escanealo desde el celular del comercio</h4><ol><li>Abrí WhatsApp.</li><li>Entrá a <b>Dispositivos vinculados</b>.</li><li>Tocá <b>Vincular un dispositivo</b>.</li><li>Escaneá este QR.</li></ol><small>Mientras el QR está abierto se revisa el estado cada 5 segundos y se detiene al conectar o a los 90 segundos.</small></div></div>}
    {status.qr?.pairingCode&&!qr&&!status.connected&&<div className={styles.pairing}><span>Código de vinculación</span><b>{status.qr.pairingCode}</b></div>}
    <div className={`${styles.test} ${!status.connected?styles.disabled:''}`}><div><h4>Prueba de envío</h4><p>Mandá un mensaje controlado para comprobar que la vinculación funciona. Esto no activa envíos automáticos.</p></div><div className={styles.formGrid}><label>Número destino<input value={number} onChange={e=>setNumber(e.target.value)} placeholder="Ej: 5491159609135" disabled={!status.connected}/></label><label>Mensaje<select value={preset} onChange={e=>setPreset(e.target.value as 'test'|'ticket'|'ready')} disabled={!status.connected}><option value="test">Prueba de conexión</option><option value="ticket">Ticket de ejemplo</option><option value="ready">Pedido listo</option></select></label>{preset==='ticket'&&<><label>Ticket<input value={ticketNumber} onChange={e=>setTicketNumber(e.target.value)} disabled={!status.connected}/></label><label>Total<input type="number" value={total} onChange={e=>setTotal(e.target.value)} disabled={!status.connected}/></label></>}</div><button className={base.primary} disabled={!status.connected||busy||number.replace(/\D/g,'').length<10} onClick={()=>void send()}>{busy?'Enviando…':'Enviar mensaje de test'}</button>{result&&<div className={styles.result}>{result}</div>}</div>
  </section>
}
