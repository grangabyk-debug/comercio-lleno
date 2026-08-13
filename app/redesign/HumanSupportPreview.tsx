'use client'

import { FormEvent,useState } from 'react'
import { readTenantSession } from '@/lib/comercio/session'
import styles from './HumanSupportPreview.module.css'

type SupportStage='bot'|'queued'|'human'
type SupportMessage={id:string;from:'bot'|'user'|'agent'|'system';content:string}

const DEMO_TICKET='CL-DEMO-1042'

function roleLabel(role:string){return role==='owner'?'Propietario':role==='manager'?'Encargado':role==='cashier'?'Cajero':role==='seller'?'Vendedor':role==='supervisor'?'Supervisor':role||'Usuario'}

function botReply(message:string){
  const normalized=message.toLowerCase()
  if(/arca|factura|cae/.test(normalized))return 'Entiendo. Primero revisá si el indicador ARCA figura conectado. Si sigue fallando, puedo enviar esta conversación a Central Llena con el contexto del comercio.'
  if(/impre|ticket|papel/.test(normalized))return 'Podés revisar la impresora predeterminada, el ancho de papel y la impresión automática en Configuración. Si querés, paso el caso a una persona.'
  if(/stock|producto/.test(normalized))return 'Puedo ayudarte a revisar productos y stock. Si el dato no coincide con tu comercio, conviene que Central Llena vea el caso.'
  return 'Gracias, ya entendí la consulta. Puedo seguir orientándote o pasar la conversación a una persona de Central Llena.'
}

export default function HumanSupportPreview(){
  const[tenant]=useState(()=>readTenantSession())
  const[open,setOpen]=useState(false)
  const[stage,setStage]=useState<SupportStage>('bot')
  const[draft,setDraft]=useState('')
  const[messages,setMessages]=useState<SupportMessage[]>([{id:'welcome',from:'bot',content:'Hola. Contame qué pasó. Intento resolverlo y, si hace falta, envío la conversación a Central Llena.'}])

  function send(event:FormEvent){
    event.preventDefault()
    const content=draft.trim()
    if(!content)return
    const stamp=Date.now()
    setMessages(current=>[...current,{id:`user-${stamp}`,from:'user',content}])
    setDraft('')
    if(stage==='bot')setMessages(current=>[...current,{id:`bot-${stamp}`,from:'bot',content:botReply(content)}])
    if(stage==='human')setMessages(current=>[...current,{id:`agent-${stamp}`,from:'agent',content:'Recibido. Lo sumo al caso y sigo con vos por acá.'}])
  }

  function escalate(){
    if(stage!=='bot')return
    setStage('queued')
    setMessages(current=>[...current,{id:'queued',from:'system',content:`Conversación ${DEMO_TICKET} enviada a la bandeja de Central Llena.`}])
  }

  function simulateAgent(){
    if(stage!=='queued')return
    setStage('human')
    setMessages(current=>[...current,{id:'agent-demo',from:'agent',content:'Hola, soy Sofía de soporte. Ya veo el comercio y el historial del chat. ¿El problema te aparece al vender o al imprimir?'}])
  }

  const status=stage==='bot'?'Bot activo':stage==='queued'?'Enviado a Central':'Humano conectado'
  return <div className={styles.card}>
    <div className={styles.top}><span>SOPORTE</span><span className={styles.previewFlag}>VISTA PREVIA</span></div>
    <h3>Chat humano dentro del sistema</h3>
    <p>El bot intenta resolver la consulta y puede pasar el historial completo a Central Llena.</p>
    {!open?<><button className={styles.launch} type="button" onClick={()=>setOpen(true)}>Probar chat de soporte</button><small>No envía datos reales en esta prueba.</small></>:<div className={styles.chat}>
      <div className={styles.context}><div><b>{tenant?.companyName||'Comercio de prueba'}</b><small>{roleLabel(tenant?.role||'owner')} · tenant {tenant?.companyId?.slice(0,8)||'demo'}</small></div><span data-stage={stage}>{status}</span></div>
      <div className={styles.messages} aria-live="polite">{messages.map(message=><div key={message.id} className={message.from==='user'?styles.user:message.from==='agent'?styles.agent:message.from==='system'?styles.system:styles.bot}>{message.from==='agent'&&<b>Central Llena</b>}{message.content}</div>)}</div>
      <form className={styles.form} onSubmit={send}><input aria-label="Mensaje para soporte" autoComplete="off" value={draft} onChange={event=>setDraft(event.target.value)} placeholder="Escribí tu consulta…"/><button type="submit" disabled={!draft.trim()}>Enviar</button></form>
      <div className={styles.actions}>{stage==='bot'&&<button type="button" onClick={escalate}>Hablar con una persona</button>}{stage==='queued'&&<button type="button" onClick={simulateAgent}>Simular respuesta de Central</button>}<button type="button" className={styles.secondary} onClick={()=>setOpen(false)}>Cerrar prueba</button></div>
    </div>}
  </div>
}
