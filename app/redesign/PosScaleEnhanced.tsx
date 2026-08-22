'use client'

import { useEffect,useMemo,useRef,useState,type ComponentProps } from 'react'
import PosPaymentsEnhanced from './PosPaymentsEnhanced'
import { readBusinessModules,type BusinessModulesSettings } from '@/lib/comercio/business-modules'

type Props=ComponentProps<typeof PosPaymentsEnhanced>
type SerialReader={read:()=>Promise<{value?:Uint8Array;done?:boolean}>;cancel?:()=>Promise<void>;releaseLock?:()=>void}
type SerialPort={readable?:{getReader:()=>SerialReader};open:(options:{baudRate:number})=>Promise<void>;close?:()=>Promise<void>}
type SerialNavigator=Navigator&{serial?:{requestPort:()=>Promise<SerialPort>}}

function normalizeMeasurement(raw:string,target:'kg'|'g'|'litro'|'ml'|null|undefined,decimals:number){
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
  const portRef=useRef<SerialPort|null>(null)

  useEffect(()=>{
    const sync=(event:Event)=>{const next=(event as CustomEvent<BusinessModulesSettings>).detail;if(next)setModules(next)}
    window.addEventListener('comercio:business-modules',sync)
    return()=>window.removeEventListener('comercio:business-modules',sync)
  },[])

  const fractional=useMemo(()=>props.cart.filter(line=>modules.fractional.enabled&&line.sell_by_fraction===true&&!!line.fraction_unit&&modules.fractional.units.includes(line.fraction_unit)),[props.cart,modules])
  useEffect(()=>{if(!fractional.length)setSelectedId('');else if(!fractional.some(line=>line.id===selectedId))setSelectedId(fractional[fractional.length-1].id)},[fractional,selectedId])
  const selected=fractional.find(line=>line.id===selectedId)||fractional[fractional.length-1]
  const serialAvailable=typeof navigator!=='undefined'&&'serial' in navigator

  function apply(next:number){
    if(!selected||!Number.isFinite(next)||next<=0)return
    props.changeQty(selected.id,next-selected.qty)
    const label=selected.fraction_unit==='litro'?'L':selected.fraction_unit==='ml'?'mL':selected.fraction_unit||''
    setState(`Aplicado: ${next} ${label}`)
  }

  async function readDirect(){
    if(!selected)return
    if(!serialAvailable){setState('Este navegador no admite conexión Serial. Usá Chrome/Edge en PC o el modo etiqueta.');return}
    setBusy(true);setState('Esperando lectura de la balanza…')
    let reader:SerialReader|null=null
    try{
      let port=portRef.current
      if(!port){
        port=await (navigator as SerialNavigator).serial!.requestPort()
        await port.open({baudRate:modules.scale.baudRate})
        portRef.current=port
      }
      if(!port.readable)throw new Error('La balanza no habilitó el canal de lectura.')
      reader=port.readable.getReader()
      const chunks:string[]=[]
      const decoder=new TextDecoder()
      const deadline=Date.now()+6000
      while(Date.now()<deadline){
        const result=await Promise.race([
          reader.read(),
          new Promise<{done:true}>(resolve=>setTimeout(()=>resolve({done:true}),900)),
        ])
        if(result.value){
          chunks.push(decoder.decode(result.value,{stream:true}))
          const joined=chunks.join('')
          if(/[\r\n]/.test(joined)||chunks.length>=3)break
        }
        if(result.done&&chunks.length)break
      }
      const raw=chunks.join('').trim()
      const measurement=normalizeMeasurement(raw,selected.fraction_unit,modules.fractional.decimals)
      if(measurement==null)throw new Error(raw?`No pude interpretar la lectura: ${raw.slice(0,80)}`:'La balanza no envió un peso dentro de los 6 segundos.')
      apply(measurement)
    }catch(error){setState(error instanceof Error?error.message:String(error));portRef.current=null}
    finally{try{await reader?.cancel?.()}catch{};try{reader?.releaseLock?.()}catch{};setBusy(false)}
  }

  function manual(){
    if(!selected)return
    const label=selected.fraction_unit==='litro'?'L':selected.fraction_unit==='ml'?'mL':selected.fraction_unit||''
    const raw=window.prompt(`Peso / volumen para ${selected.name} (${label})`,String(selected.qty).replace('.',','))
    if(raw==null)return
    const value=Number(raw.replace(',','.'))
    if(!Number.isFinite(value)||value<=0){setState('Ingresá una cantidad mayor a cero.');return}
    const factor=10**modules.fractional.decimals
    apply(Math.round(value*factor)/factor)
  }

  const show=modules.scale.enabled&&modules.fractional.enabled&&fractional.length>0
  return <>
    <PosPaymentsEnhanced {...props}/>
    {show&&<aside style={{position:'fixed',right:18,bottom:74,zIndex:9800,width:'min(390px,calc(100vw - 28px))',background:'#fff',border:'1px solid #cfe0d7',borderRadius:18,boxShadow:'0 18px 48px rgba(20,45,34,.18)',padding:14,display:'grid',gap:10}} aria-label="Balanza">
      <div style={{display:'flex',justifyContent:'space-between',gap:10,alignItems:'center'}}><div><div style={{fontSize:9,fontWeight:950,letterSpacing:1.2,color:'#147f50'}}>BALANZA · {modules.scale.mode==='webserial'?'USB / SERIAL':'ETIQUETA'}</div><b style={{fontSize:15}}>Cargar peso en la venta</b></div><span style={{width:9,height:9,borderRadius:'50%',background:'#24a667'}}/></div>
      {fractional.length>1&&<select value={selected?.id||''} onChange={e=>setSelectedId(e.target.value)} style={{height:38,border:'1px solid #d2ddd7',borderRadius:10,padding:'0 10px',fontWeight:800}}>{fractional.map(line=><option key={line.id} value={line.id}>{line.name}</option>)}</select>}
      <div style={{fontSize:11,color:'#64726b'}}>Producto: <b>{selected?.name}</b> · actual {selected?.qty} {selected?.fraction_unit==='litro'?'L':selected?.fraction_unit==='ml'?'mL':selected?.fraction_unit}</div>
      <div style={{display:'flex',gap:8}}>{modules.scale.mode==='webserial'&&<button type="button" disabled={busy} onClick={()=>void readDirect()} style={{flex:1,minHeight:40,border:0,borderRadius:10,background:'#147f50',color:'#fff',fontWeight:900,cursor:busy?'wait':'pointer'}}>{busy?'Leyendo…':'Leer balanza'}</button>}<button type="button" onClick={manual} style={{flex:1,minHeight:40,border:'1px solid #c7d7cf',borderRadius:10,background:'#f7fbf9',color:'#214437',fontWeight:900,cursor:'pointer'}}>Ingresar manual</button></div>
      {modules.scale.mode==='barcode'&&<small style={{lineHeight:1.4,color:'#66756d'}}>Modo etiqueta activo: escaneá el código generado por la balanza con el buscador del POS. Si la etiqueta no codifica el peso en un formato reconocido por el catálogo, usá “Ingresar manual”.</small>}
      {state&&<small style={{lineHeight:1.4,fontWeight:750,color:state.startsWith('Aplicado')?'#147f50':'#8b554a'}}>{state}</small>}
    </aside>}
  </>
}
