'use client'

import { useEffect,useMemo,useState,type CSSProperties } from 'react'
import { readBusinessModules,saveBusinessModules,type BusinessModulesSettings,type FractionUnit } from '@/lib/comercio/business-modules'
import type { TenantSession } from '@/lib/comercio/types'

const card:CSSProperties={border:'1px solid #dfe7e2',borderRadius:20,padding:18,background:'#fff',boxShadow:'0 8px 30px rgba(20,45,34,.05)',display:'grid',gap:14}
const label:CSSProperties={fontSize:12,fontWeight:850,display:'grid',gap:7,color:'#26362f'}
const input:CSSProperties={height:42,border:'1px solid #cad7d0',borderRadius:11,padding:'0 12px',fontWeight:750,background:'#fff',color:'#17251f'}
const pill:CSSProperties={height:34,borderRadius:999,border:'1px solid #cfd9d4',background:'#fff',fontSize:11,fontWeight:850,padding:'0 12px',cursor:'pointer'}

function Toggle({checked,onChange}:{checked:boolean;onChange:(next:boolean)=>void}){return <button type="button" onClick={()=>onChange(!checked)} aria-pressed={checked} style={{width:54,height:30,border:0,borderRadius:999,padding:3,background:checked?'#147f50':'#cbd5d0',display:'flex',justifyContent:checked?'flex-end':'flex-start',cursor:'pointer'}}><span style={{width:24,height:24,borderRadius:'50%',background:'#fff',boxShadow:'0 2px 7px rgba(0,0,0,.2)'}}/></button>}

export default function BusinessModulesPanel({session,message}:{session:TenantSession;message:(text:string)=>void}){
  const[value,setValue]=useState<BusinessModulesSettings>(()=>readBusinessModules(session.companyId))
  const[serialState,setSerialState]=useState('Sin vincular')
  useEffect(()=>{setValue(readBusinessModules(session.companyId))},[session.companyId])
  const webSerialAvailable=useMemo(()=>typeof navigator!=='undefined'&&'serial' in navigator,[])
  function commit(){const next=saveBusinessModules(session.companyId,value);setValue(next);message('Módulos guardados para este comercio. Las funciones activadas ya quedan visibles en el sistema.')}
  function list(text:string){return text.split(',').map(x=>x.trim()).filter(Boolean)}
  function toggleUnit(unit:FractionUnit){const current=value.fractional.units;setValue({...value,fractional:{...value.fractional,units:current.includes(unit)?current.filter(x=>x!==unit):[...current,unit]}})}
  async function connectScale(){
    if(value.scale.mode==='barcode'){setSerialState('Modo etiquetas / código de barras activo');message('Balanza configurada por etiquetas: el POS leerá el código impreso por la balanza.');return}
    if(!webSerialAvailable){setSerialState('Web Serial no disponible en este navegador');message('Para conexión directa usá Chrome/Edge en PC por HTTPS o elegí el modo por etiquetas/código de barras.');return}
    try{
      const serial=(navigator as Navigator&{serial?:{requestPort:()=>Promise<{open:(options:{baudRate:number})=>Promise<void>;close?:()=>Promise<void>}>}}).serial
      const port=await serial?.requestPort()
      if(!port)throw new Error('No se eligió una balanza.')
      await port.open({baudRate:value.scale.baudRate})
      setSerialState(`Vinculada · ${value.scale.baudRate} baud`)
      message('Balanza vinculada para esta sesión de prueba.')
    }catch(error){setSerialState('Sin vincular');message(error instanceof Error?error.message:String(error))}
  }
  return <section style={{display:'grid',gap:16}}>
    <div style={{display:'flex',justifyContent:'space-between',gap:20,alignItems:'flex-start',flexWrap:'wrap'}}><div><div style={{fontSize:10,fontWeight:950,letterSpacing:1.4,color:'#147f50'}}>CONFIGURACIÓN · MÓDULOS</div><h2 style={{margin:'5px 0 7px',fontSize:26}}>Funciones por tipo de negocio</h2><p style={{margin:0,maxWidth:760,color:'#617068',lineHeight:1.55,fontSize:13}}>Activá solamente lo que usa cada comercio. Si un módulo está apagado, el sistema conserva la experiencia actual sin botones ni campos extra.</p></div><button type="button" onClick={commit} style={{height:44,border:0,borderRadius:12,background:'#147f50',color:'#fff',fontWeight:900,padding:'0 18px',cursor:'pointer'}}>Guardar módulos</button></div>

    <article style={card}>
      <div style={{display:'flex',justifyContent:'space-between',gap:16,alignItems:'center'}}><div><b style={{fontSize:18}}>Venta fraccionada</b><p style={{margin:'4px 0 0',fontSize:12,color:'#65756d'}}>Para verdulerías, dietéticas, perfumerías, limpieza, almacenes y cualquier producto vendido por peso o volumen.</p></div><Toggle checked={value.fractional.enabled} onChange={enabled=>setValue({...value,fractional:{...value.fractional,enabled}})}/></div>
      {value.fractional.enabled&&<div style={{display:'grid',gap:13,borderTop:'1px solid #eef2ef',paddingTop:14}}><div style={label}>Unidades habilitadas<div style={{display:'flex',gap:8,flexWrap:'wrap'}}>{(['kg','g','litro','ml'] as FractionUnit[]).map(unit=><button type="button" key={unit} onClick={()=>toggleUnit(unit)} style={{...pill,background:value.fractional.units.includes(unit)?'#e7f7ef':'#fff',borderColor:value.fractional.units.includes(unit)?'#7cc8a1':'#cfd9d4',color:value.fractional.units.includes(unit)?'#0f6f43':'#34453d'}}>{unit==='litro'?'Litro':unit==='ml'?'Mililitro':unit==='kg'?'Kilo':'Gramo'}</button>)}</div></div><label style={{...label,maxWidth:260}}>Decimales para cantidad<select style={input} value={value.fractional.decimals} onChange={e=>setValue({...value,fractional:{...value.fractional,decimals:Number(e.target.value)}})}><option value={2}>2 decimales</option><option value={3}>3 decimales</option><option value={4}>4 decimales</option></select></label><small style={{color:'#617068'}}>Al activarlo, Productos habilita unidades fraccionadas y Nueva venta admite cantidades decimales.</small></div>}
    </article>

    <article style={card}>
      <div style={{display:'flex',justifyContent:'space-between',gap:16,alignItems:'center'}}><div><b style={{fontSize:18}}>Balanza</b><p style={{margin:'4px 0 0',fontSize:12,color:'#65756d'}}>Conexión directa por puerto serie/USB en PC compatible o lectura del código impreso por la balanza.</p></div><Toggle checked={value.scale.enabled} onChange={enabled=>setValue({...value,scale:{...value.scale,enabled}})}/></div>
      {value.scale.enabled&&<div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(210px,1fr))',gap:12,borderTop:'1px solid #eef2ef',paddingTop:14}}><label style={label}>Modo de integración<select style={input} value={value.scale.mode} onChange={e=>setValue({...value,scale:{...value.scale,mode:e.target.value==='barcode'?'barcode':'webserial'}})}><option value="webserial">Directa · USB / Serial</option><option value="barcode">Etiqueta / código de barras</option></select></label><label style={label}>Perfil de balanza<select style={input} value={value.scale.protocol} onChange={e=>setValue({...value,scale:{...value.scale,protocol:e.target.value as 'generic'|'systel'|'kretz'}})}><option value="generic">Serial genérica</option><option value="systel">Systel</option><option value="kretz">Kretz</option></select></label><label style={label}>Velocidad<select style={input} disabled={value.scale.mode!=='webserial'} value={value.scale.baudRate} onChange={e=>setValue({...value,scale:{...value.scale,baudRate:Number(e.target.value)}})}>{[1200,2400,4800,9600,19200,38400,57600,115200].map(x=><option key={x}>{x}</option>)}</select></label><label style={{...label,alignContent:'end'}}><span>Lectura automática</span><span style={{display:'flex',gap:10,alignItems:'center'}}><Toggle checked={value.scale.autoRead} onChange={autoRead=>setValue({...value,scale:{...value.scale,autoRead}})}/><small>{value.scale.autoRead?'Activa':'Manual'}</small></span></label><div style={{gridColumn:'1 / -1',display:'flex',gap:10,alignItems:'center',flexWrap:'wrap'}}><button type="button" onClick={()=>void connectScale()} style={{height:40,border:'1px solid #bdd1c6',borderRadius:11,background:'#f4faf7',fontWeight:900,padding:'0 14px',cursor:'pointer'}}>Vincular balanza</button><small style={{fontWeight:800,color:serialState.includes('Vinculada')?'#147f50':'#6a7770'}}>{serialState}</small></div></div>}
    </article>

    <article style={card}>
      <div style={{display:'flex',justifyContent:'space-between',gap:16,alignItems:'center'}}><div><b style={{fontSize:18}}>Tiendas de ropa e indumentaria</b><p style={{margin:'4px 0 0',fontSize:12,color:'#65756d'}}>Variantes por talle y color, stock por variante, ubicación y ticket de cambio.</p></div><Toggle checked={value.apparel.enabled} onChange={enabled=>setValue({...value,apparel:{...value.apparel,enabled}})}/></div>
      {value.apparel.enabled&&<div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(230px,1fr))',gap:12,borderTop:'1px solid #eef2ef',paddingTop:14}}><label style={label}>Talles disponibles<input style={input} value={value.apparel.sizes.join(', ')} onChange={e=>setValue({...value,apparel:{...value.apparel,sizes:list(e.target.value)}})} placeholder="XS, S, M, L, XL"/></label><label style={label}>Colores frecuentes<input style={input} value={value.apparel.colors.join(', ')} onChange={e=>setValue({...value,apparel:{...value.apparel,colors:list(e.target.value)}})} placeholder="Negro, Blanco, Azul"/></label><label style={label}>Vigencia ticket de cambio<input style={input} type="number" min="0" max="365" value={value.apparel.exchangeTicketDays} onChange={e=>setValue({...value,apparel:{...value.apparel,exchangeTicketDays:Number(e.target.value||0)}})}/><small>días</small></label><label style={{...label,alignContent:'end'}}><span>Ubicación en depósito/local</span><span style={{display:'flex',gap:10,alignItems:'center'}}><Toggle checked={value.apparel.trackLocation} onChange={trackLocation=>setValue({...value,apparel:{...value.apparel,trackLocation}})}/><small>{value.apparel.trackLocation?'Visible':'Oculta'}</small></label><div style={{gridColumn:'1 / -1',padding:12,borderRadius:12,background:'#faf7ff',border:'1px solid #e4d9f0',fontSize:12,lineHeight:1.5,color:'#574267'}}><b>Campos del módulo:</b> código/SKU, descripción, categoría, talle, color, precio, stock, stock mínimo, estado y ubicación. El ticket de cambio queda separado del comprobante fiscal.</div></div>}
    </article>
  </section>
}
