'use client'

import { useEffect,useMemo,useRef,useState,type ComponentProps } from 'react'
import PosPaymentsEnhanced from './PosPaymentsEnhanced'
import { readBusinessModules,type BusinessModulesSettings } from '@/lib/comercio/business-modules'
import type { CartLine } from '@/lib/comercio/types'

type Props=ComponentProps<typeof PosPaymentsEnhanced>
type FractionUnit='kg'|'g'|'litro'|'ml'
type EntryUnit='kg'|'g'|'litro'|'ml'
type SerialReader={read:()=>Promise<{value?:Uint8Array;done?:boolean}>;cancel?:()=>Promise<void>;releaseLock?:()=>void}
type SerialPort={readable?:{getReader:()=>SerialReader};open:(options:{baudRate:number})=>Promise<void>;close?:()=>Promise<void>}
type SerialNavigator=Navigator&{serial?:{requestPort:()=>Promise<SerialPort>}}

const money=new Intl.NumberFormat('es-AR',{style:'currency',currency:'ARS',maximumFractionDigits:2})

function fractionUnit(line:CartLine):FractionUnit|null{
  const raw=String(line.fraction_unit||line.unit||'').toLowerCase().trim()
  if(raw==='kg'||raw==='kilo'||raw==='kilogramo')return'kg'
  if(raw==='g'||raw==='gr'||raw==='gramo')return'g'
  if(raw==='litro'||raw==='l')return'litro'
  if(raw==='ml'||raw==='mililitro')return'ml'
  return null
}
function unitLabel(unit:FractionUnit|EntryUnit|null){return unit==='litro'?'L':unit==='ml'?'mL':unit||''}
function entryOptions(base:FractionUnit):EntryUnit[]{return base==='kg'||base==='g'?['kg','g']:['litro','ml']}
function toBase(value:number,entry:EntryUnit,base:FractionUnit){
  if(entry===base)return value
  if(base==='kg'&&entry==='g')return value/1000
  if(base==='g'&&entry==='kg')return value*1000
  if(base==='litro'&&entry==='ml')return value/1000
  if(base==='ml'&&entry==='litro')return value*1000
  return value
}
function fromBase(value:number,base:FractionUnit,entry:EntryUnit){
  if(entry===base)return value
  if(base==='kg'&&entry==='g')return value*1000
  if(base==='g'&&entry==='kg')return value/1000
  if(base==='litro'&&entry==='ml')return value*1000
  if(base==='ml'&&entry==='litro')return value/1000
  return value
}
function normalizeMeasurement(raw:string,target:FractionUnit,decimals:number){
  const normalized=raw.replace(/,/g,'.')
  const matches=[...normalized.matchAll(/(-?\d+(?:\.\d+)?)/g)]
  if(!matches.length)return null
  const value=Number(matches[matches.length-1][1])
  if(!Number.isFinite(value)||value<=0)return null
  const lower=normalized.toLowerCase()
  let next=value
  if(target==='kg'&&/\bg\b/.test(lower)&&!(/\bkg\b/.test(lower)))next=value/1000
  else if(target==='g'&&/\bkg\b/.test(lower))next=value*1000
  else if(target==='litro'&&/(?:\bml\b|mililit)/.test(lower))next=value/1000
  else if(target==='ml'&&/(?:\bl\b|litro)/.test(lower)&&!(/\bml\b/.test(lower)))next=value*1000
  const factor=10**Math.max(0,Math.min(4,decimals))
  return Math.round(next*factor)/factor
}

export default function PosScaleEnhanced(props:Props){
  const[modules,setModules]=useState<BusinessModulesSettings>(()=>readBusinessModules(props.data.company.id))
  const[selectedId,setSelectedId]=useState('')
  const[state,setState]=useState('')
  const[busy,setBusy]=useState(false)
  const[input,setInput]=useState('')
  const[entryUnit,setEntryUnit]=useState<EntryUnit>('g')
  const[panelOpen,setPanelOpen]=useState(false)
  const portRef=useRef<SerialPort|null>(null)
  const suppressNextOpen=useRef(false)

  useEffect(()=>{
    const sync=(event:Event)=>{const next=(event as CustomEvent<BusinessModulesSettings>).detail;if(next)setModules(next)}
    window.addEventListener('comercio:business-modules',sync)
    return()=>window.removeEventListener('comercio:business-modules',sync)
  },[])

  const fractional=useMemo(()=>props.cart.filter(line=>{
    if(!modules.fractional.enabled)return false
    const unit=fractionUnit(line)
    return !!unit&&modules.fractional.units.includes(unit)
  }),[props.cart,modules])
  const fractionalSignature=useMemo(()=>fractional.map(line=>`${line.id}:${line.qty}`).join('|'),[fractional])

  useEffect(()=>{
    if(!fractional.length){setSelectedId('');setPanelOpen(false);return}
    if(!fractional.some(line=>line.id===selectedId))setSelectedId(fractional[fractional.length-1].id)
  },[fractional,selectedId])

  useEffect(()=>{
    if(!fractional.length)return
    if(suppressNextOpen.current){suppressNextOpen.current=false;return}
    setPanelOpen(true)
  },[fractionalSignature])

  const selected=fractional.find(line=>line.id===selectedId)||fractional[fractional.length-1]
  const baseUnit=selected?fractionUnit(selected):null
  const options=baseUnit?entryOptions(baseUnit):[]
  const serialAvailable=typeof navigator!=='undefined'&&'serial' in navigator

  useEffect(()=>{
    if(!selected||!baseUnit)return
    const preferred:EntryUnit=baseUnit==='kg'?'g':baseUnit==='litro'?'ml':baseUnit
    setEntryUnit(preferred)
    setInput(String(fromBase(selected.qty,baseUnit,preferred)).replace('.',','))
    setState('')
  },[selected?.id,baseUnit])

  function applyBase(next:number,messageUnit?:EntryUnit,messageValue?:number){
    if(!selected||!baseUnit||!Number.isFinite(next)||next<=0)return
    const factor=10**Math.max(0,Math.min(4,modules.fractional.decimals))
    const rounded=Math.round(next*factor)/factor
    suppressNextOpen.current=true
    props.changeQty(selected.id,rounded-selected.qty)
    const displayValue=messageValue??rounded
    const displayUnit=messageUnit??baseUnit
    setState(`Aplicado: ${displayValue} ${unitLabel(displayUnit)} · ${money.format(selected.price*rounded)}`)
    setPanelOpen(false)
  }

  function applyManual(){
    if(!selected||!baseUnit)return
    const value=Number(input.replace(',','.'))
    if(!Number.isFinite(value)||value<=0){setState('Ingresá una cantidad mayor a cero.');return}
    const next=toBase(value,entryUnit,baseUnit)
    applyBase(next,entryUnit,value)
  }

  async function readDirect(){
    if(!selected||!baseUnit)return
    if(!serialAvailable){setState('Este navegador no admite conexión Serial. Usá Chrome/Edge en PC o ingresá el peso manualmente.');return}
    setBusy(true);setState('Esperando lectura de la balanza…')
    let reader:SerialReader|null=null
    try{
      let port=portRef.current
      if(!port){port=await (navigator as SerialNavigator).serial!.requestPort();await port.open({baudRate:modules.scale.baudRate});portRef.current=port}
      if(!port.readable)throw new Error('La balanza no habilitó el canal de lectura.')
      reader=port.readable.getReader()
      const chunks:string[]=[];const decoder=new TextDecoder();const deadline=Date.now()+6000
      while(Date.now()<deadline){
        const result=await Promise.race([reader.read(),new Promise<{done:true}>(resolve=>setTimeout(()=>resolve({done:true}),900))])
        if(result.value){chunks.push(decoder.decode(result.value,{stream:true}));const joined=chunks.join('');if(/[\r\n]/.test(joined)||chunks.length>=3)break}
        if(result.done&&chunks.length)break
      }
      const raw=chunks.join('').trim()
      const measurement=normalizeMeasurement(raw,baseUnit,modules.fractional.decimals)
      if(measurement==null)throw new Error(raw?`No pude interpretar la lectura: ${raw.slice(0,80)}`:'La balanza no envió un peso dentro de los 6 segundos.')
      applyBase(measurement)
      const preferred:EntryUnit=baseUnit==='kg'?'g':baseUnit==='litro'?'ml':baseUnit
      setEntryUnit(preferred);setInput(String(fromBase(measurement,baseUnit,preferred)).replace('.',','))
    }catch(error){setState(error instanceof Error?error.message:String(error));portRef.current=null}
    finally{try{await reader?.cancel?.()}catch{};try{reader?.releaseLock?.()}catch{};setBusy(false)}
  }

  const show=modules.fractional.enabled&&fractional.length>0&&panelOpen
  const currentDisplay=selected&&baseUnit?`${selected.qty.toLocaleString('es-AR',{maximumFractionDigits:modules.fractional.decimals})} ${unitLabel(baseUnit)}`:''
  const lineTotal=selected?selected.price*selected.qty:0

  return <>
    <PosPaymentsEnhanced {...props}/>
    {show&&<aside style={{position:'fixed',left:'50%',top:'50%',transform:'translate(-50%,-50%)',zIndex:9800,width:'min(410px,calc(100vw - 28px))',maxHeight:'calc(100vh - 32px)',overflowY:'auto',background:'#fff',border:'1px solid #cfe0d7',borderRadius:18,boxShadow:'0 18px 48px rgba(20,45,34,.18)',padding:15,display:'grid',gap:11}} aria-label="Cantidad fraccionada">
      <div style={{display:'flex',justifyContent:'space-between',gap:10,alignItems:'center'}}><div><div style={{fontSize:9,fontWeight:950,letterSpacing:1.2,color:'#147f50'}}>VENTA FRACCIONADA</div><b style={{fontSize:15}}>Ingresá peso o volumen</b></div><span style={{fontSize:10,fontWeight:900,padding:'6px 9px',borderRadius:999,background:'#e7f7ef',color:'#147f50'}}>ACTIVO</span></div>
      {fractional.length>1&&<select value={selected?.id||''} onChange={e=>setSelectedId(e.target.value)} style={{height:38,border:'1px solid #d2ddd7',borderRadius:10,padding:'0 10px',fontWeight:800}}>{fractional.map(line=><option key={line.id} value={line.id}>{line.name}</option>)}</select>}
      <div style={{padding:'10px 11px',borderRadius:11,background:'#f6faf8',display:'grid',gap:3,fontSize:11,color:'#53665d'}}><b style={{color:'#1d352a',fontSize:12}}>{selected?.name}</b><span>{money.format(selected?.price||0)} por {unitLabel(baseUnit)}</span><span>Actual: <b>{currentDisplay}</b> · Subtotal: <b>{money.format(lineTotal)}</b></span></div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 105px',gap:8}}><input inputMode="decimal" value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'){e.preventDefault();applyManual()}}} placeholder={entryUnit==='g'?'Ej: 250':entryUnit==='kg'?'Ej: 0,250':entryUnit==='ml'?'Ej: 500':'Ej: 0,5'} style={{height:44,border:'1px solid #c8d8d0',borderRadius:11,padding:'0 12px',fontSize:16,fontWeight:900,outline:'none'}}/><select value={entryUnit} onChange={e=>setEntryUnit(e.target.value as EntryUnit)} style={{height:44,border:'1px solid #c8d8d0',borderRadius:11,padding:'0 9px',background:'#fff',fontWeight:900}}>{options.map(unit=><option key={unit} value={unit}>{unit==='g'?'gramos':unit==='kg'?'kilos':unit==='ml'?'mililitros':'litros'}</option>)}</select></div>
      <button type="button" onClick={applyManual} style={{minHeight:42,border:0,borderRadius:11,background:'#147f50',color:'#fff',fontWeight:950,cursor:'pointer'}}>Aplicar cantidad</button>
      {modules.scale.enabled&&<div style={{borderTop:'1px solid #e3ebe7',paddingTop:10,display:'grid',gap:8}}><div style={{fontSize:10,fontWeight:900,color:'#65756d'}}>BALANZA {modules.scale.mode==='webserial'?'USB / SERIAL':'POR ETIQUETA'}</div>{modules.scale.mode==='webserial'?<button type="button" disabled={busy} onClick={()=>void readDirect()} style={{minHeight:40,border:'1px solid #bcd7c9',borderRadius:10,background:'#eff9f4',color:'#147f50',fontWeight:900,cursor:busy?'wait':'pointer'}}>{busy?'Leyendo balanza…':'Leer balanza'}</button>:<small style={{lineHeight:1.4,color:'#66756d'}}>Escaneá la etiqueta generada por la balanza. También podés ingresar el peso manualmente arriba.</small>}</div>}
      {state&&<small style={{lineHeight:1.4,fontWeight:800,color:state.startsWith('Aplicado')?'#147f50':'#8b554a'}}>{state}</small>}
      <small style={{lineHeight:1.4,color:'#708078'}}>Ejemplo: si el precio es $50.000/kg y cargás 250 g, la venta toma 0,250 kg y suma $12.500.</small>
    </aside>}
  </>
}
