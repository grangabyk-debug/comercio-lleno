'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import styles from './point-preview.module.css'

type Terminal={id:string;pos_id?:string|number|null;store_id?:string|number|null;external_pos_id?:string|null;operating_mode?:string|null}
type Category='general'|'ventas'|'integraciones'|'equipos'|'usuarios'|'sistema'

const categories:Array<{key:Category;title:string;description:string}>=[
  {key:'general',title:'Comercio',description:'Datos, sucursales y preferencias'},
  {key:'ventas',title:'Ventas y facturación',description:'Caja, stock, precios y ARCA'},
  {key:'integraciones',title:'Integraciones',description:'Mercado Pago, WhatsApp y servicios'},
  {key:'equipos',title:'Equipos',description:'Impresoras, scanners y dispositivos'},
  {key:'usuarios',title:'Usuarios y permisos',description:'Accesos, roles y seguridad'},
  {key:'sistema',title:'Sistema',description:'Diseño, actualizaciones y mantenimiento'},
]

function authHeaders(){
  const token=typeof window==='undefined'?'':localStorage.getItem('cl_access_token')||''
  return token?{Authorization:`Bearer ${token}`}:{ }
}

export default function PointPreview(){
  const[category,setCategory]=useState<Category>('integraciones')
  const[terminals,setTerminals]=useState<Terminal[]>([])
  const[selected,setSelected]=useState('')
  const[loading,setLoading]=useState(false)
  const[connected,setConnected]=useState<boolean|null>(null)
  const[message,setMessage]=useState('')
  const[amount,setAmount]=useState('100')
  const[sending,setSending]=useState(false)
  const terminal=useMemo(()=>terminals.find(item=>item.id===selected)||null,[terminals,selected])

  async function loadTerminals(){
    setLoading(true);setMessage('')
    try{
      const response=await fetch('/api/redesign/mercadopago-point',{cache:'no-store',headers:authHeaders()})
      const data=await response.json()
      setConnected(Boolean(data.connected));setTerminals(data.terminals||[])
      if(!selected&&data.terminals?.[0]?.id)setSelected(data.terminals[0].id)
      if(!response.ok)setMessage(data.error||'No se pudo consultar Mercado Pago.')
    }catch(error){setConnected(false);setMessage(error instanceof Error?error.message:String(error))}
    finally{setLoading(false)}
  }

  useEffect(()=>{void loadTerminals()},[])

  async function setPdvMode(){
    if(!selected)return;setSending(true);setMessage('')
    try{
      const response=await fetch('/api/redesign/mercadopago-point',{method:'PATCH',headers:{'Content-Type':'application/json',...authHeaders()},body:JSON.stringify({terminal_id:selected})})
      const data=await response.json();if(!response.ok)throw new Error(data.error||'No se pudo configurar la terminal.')
      setMessage('Point listo. Quedó configurado para recibir importes desde Comercio Lleno.');await loadTerminals()
    }catch(error){setMessage(error instanceof Error?error.message:String(error))}finally{setSending(false)}
  }

  async function sendTest(){
    const value=Number(amount.replace(',','.'));if(!selected||!value)return;setSending(true);setMessage('')
    try{
      const response=await fetch('/api/redesign/mercadopago-point',{method:'POST',headers:{'Content-Type':'application/json',...authHeaders()},body:JSON.stringify({terminal_id:selected,amount:value,external_reference:`CL-preview-${Date.now()}`})})
      const data=await response.json();if(!response.ok)throw new Error(data.error||'No se pudo enviar el cobro al Point.')
      setMessage(`Cobro enviado al Point. Orden ${data.order?.id||'creada correctamente'}.`)
    }catch(error){setMessage(error instanceof Error?error.message:String(error))}finally{setSending(false)}
  }

  return <main className={styles.page}>
    <header className={styles.header}><div><span>CONFIGURACIÓN · PREVIEW</span><h1>Centro de configuración</h1><p>Menos opciones sueltas y una estructura clara por categorías.</p></div><Link href="/redesign" className={styles.back}>Volver al sistema</Link></header>
    <div className={styles.layout}>
      <aside className={styles.sidebar}><b className={styles.sideTitle}>Categorías</b>{categories.map(item=><button key={item.key} onClick={()=>setCategory(item.key)} className={category===item.key?styles.categoryActive:styles.category}><strong>{item.title}</strong><small>{item.description}</small></button>)}</aside>
      <section className={styles.content}>
        {category!=='integraciones'?<div className={styles.placeholder}><span>PREVIEW DE ESTRUCTURA</span><h2>{categories.find(x=>x.key===category)?.title}</h2><p>Acá agrupamos las opciones actuales para que Configuración no termine siendo una fila interminable de botones.</p><div className={styles.placeholderGrid}><div>Configuración principal</div><div>Opciones avanzadas</div><div>Estado y diagnóstico</div></div></div>:<>
          <div className={styles.sectionHead}><div><span>INTEGRACIONES</span><h2>Servicios conectados</h2><p>Conexiones externas administradas desde un solo lugar.</p></div><div className={`${styles.status} ${connected?styles.ok:connected===false?styles.bad:''}`}>{connected===null?'Verificando…':connected?'Mercado Pago conectado':'Mercado Pago sin conectar'}</div></div>
          <div className={styles.subnav}><button className={styles.subnavActive}>Mercado Pago</button><button>WhatsApp</button><button>Otras integraciones</button></div>
          <article className={styles.hero}><div><span>MERCADO PAGO POINT</span><h3>Conectá el Point al POS</h3><p>La idea final es simple: el propietario toca “Conectar Mercado Pago”, autoriza su cuenta y Comercio Lleno detecta automáticamente los Point disponibles. Sin copiar tokens ni buscar identificadores técnicos.</p><div className={styles.actions}><button className={styles.primary} onClick={()=>void loadTerminals()}>{loading?'Buscando…':connected?'Buscar mis Point':'Conectar Mercado Pago'}</button><button className={styles.secondary}>Cómo funciona</button></div></div><div className={styles.flow}><div><b>1</b><span>Conectar cuenta</span></div><div><b>2</b><span>Elegir Point</span></div><div><b>3</b><span>Probar conexión</span></div><div><b>4</b><span>Listo para cobrar</span></div></div></article>
          <div className={styles.grid}>
            <article className={styles.card}><div className={styles.cardHead}><div><span>DISPOSITIVO</span><h3>Point vinculado</h3></div><button onClick={()=>void loadTerminals()} disabled={loading}>Actualizar</button></div>{terminals.length?<><label>Point disponible<select value={selected} onChange={e=>setSelected(e.target.value)}>{terminals.map(item=><option key={item.id} value={item.id}>{item.external_pos_id||item.id}</option>)}</select></label><div className={styles.details}><div><span>Terminal</span><b>{terminal?.id||'—'}</b></div><div><span>Sucursal</span><b>{terminal?.store_id||'—'}</b></div><div><span>Caja</span><b>{terminal?.pos_id||'—'}</b></div><div><span>Modo</span><b>{terminal?.operating_mode||'Sin informar'}</b></div></div><button className={styles.primary} onClick={()=>void setPdvMode()} disabled={sending}>Usar este Point</button></>:<div className={styles.empty}><b>No encontramos un Point todavía</b><span>Cuando la cuenta esté autorizada, los dispositivos compatibles aparecen acá automáticamente.</span></div>}</article>
            <article className={styles.card}><div className={styles.cardHead}><div><span>PRUEBA SEGURA</span><h3>Enviar importe de prueba</h3></div></div><p>Antes de activarlo en la caja, mandamos un importe chico al Point para confirmar que el dispositivo correcto responde.</p><label>Importe<input inputMode="decimal" value={amount} onChange={e=>setAmount(e.target.value)} placeholder="100"/></label><button className={styles.primary} disabled={!selected||sending} onClick={()=>void sendTest()}>{sending?'Enviando…':'Enviar al Point'}</button><small className={styles.note}>Esta acción crea una orden real de Point en el entorno configurado. Usala únicamente con el dispositivo de prueba correcto.</small></article>
          </div>
          {message&&<div className={styles.message}>{message}</div>}
        </>}
      </section>
    </div>
  </main>
}
