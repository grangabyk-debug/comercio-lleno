'use client'

import { useEffect,useLayoutEffect,useMemo,useState,type ComponentProps } from 'react'
import ProductsInventory from './ProductsInventory'
import { readBusinessModules,type BusinessModulesSettings } from '@/lib/comercio/business-modules'

const SUPABASE_URL=process.env.NEXT_PUBLIC_SUPABASE_URL??'https://wtcntclzcubkbtcsqkzc.supabase.co'
const PUBLISHABLE_KEY=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY??'sb_publishable_02U2KDLDTR42KxdcFHtfYw_IDM00Deb'
type Props=ComponentProps<typeof ProductsInventory>
type DateMode='default'|'newest'|'oldest'

function customKey(companyId:string){return`cl_product_categories_${companyId}`}
function readCustom(companyId:string){if(typeof window==='undefined')return[] as string[];try{return JSON.parse(localStorage.getItem(customKey(companyId))||'[]') as string[]}catch{return[]}}

export default function ProductsInventoryFixed(props:Props){
  const[category,setCategory]=useState('Todas')
  const[categoryOpen,setCategoryOpen]=useState(false)
  const[custom,setCustom]=useState<string[]>(()=>readCustom(props.session.companyId))
  const[dates,setDates]=useState<Record<string,string>>({})
  const[dateMode,setDateMode]=useState<DateMode>('default')
  const[modules,setModules]=useState<BusinessModulesSettings>(()=>readBusinessModules(props.session.companyId))

  useEffect(()=>{
    setCustom(readCustom(props.session.companyId))
    const onModules=(event:Event)=>{const next=(event as CustomEvent<BusinessModulesSettings>).detail;if(next)setModules(next)}
    window.addEventListener('comercio:business-modules',onModules)
    return()=>window.removeEventListener('comercio:business-modules',onModules)
  },[props.session.companyId])

  useEffect(()=>{
    let active=true
    fetch(`${SUPABASE_URL}/rest/v1/products?select=id,created_at&company_id=eq.${encodeURIComponent(props.session.companyId)}&active=eq.true&limit=5000`,{headers:{apikey:PUBLISHABLE_KEY,Authorization:`Bearer ${props.session.token}`},cache:'no-store'})
      .then(r=>r.ok?r.json():[]).then((rows:Array<{id:string;created_at?:string|null}>)=>{if(!active)return;const next:Record<string,string>={};rows.forEach(row=>{if(row.id&&row.created_at)next[row.id]=row.created_at});setDates(next)}).catch(()=>{})
    return()=>{active=false}
  },[props.session.companyId,props.session.token,props.data.products.length])

  useLayoutEffect(()=>{
    const original=window.fetch.bind(window)
    window.fetch=(async(input:RequestInfo|URL,init?:RequestInit)=>{
      const raw=typeof input==='string'?input:input instanceof URL?input.toString():input.url
      const method=(init?.method||(input instanceof Request?input.method:'GET')).toUpperCase()
      const isProductPatch=method==='PATCH'&&/\/rest\/v1\/products(?:\?|$)/.test(raw)
      const response=await original(input,init)
      if(isProductPatch&&response.ok)window.setTimeout(()=>{void props.refresh()},60)
      return response
    }) as typeof window.fetch
    return()=>{window.fetch=original as typeof window.fetch}
  },[props.refresh])

  useLayoutEffect(()=>{
    if(!modules.fractional.enabled)return
    const addFractionOptions=()=>document.querySelectorAll<HTMLSelectElement>('select').forEach(select=>{
      const values=Array.from(select.options).map(x=>x.value||x.text)
      if(values.includes('kg')&&values.includes('litro')){
        for(const unit of modules.fractional.units){
          const value=unit==='g'?'g':unit==='ml'?'ml':unit
          if(!values.includes(value)){const option=document.createElement('option');option.value=value;option.textContent=unit==='g'?'gramo':unit==='ml'?'mililitro':unit;select.appendChild(option)}
        }
      }
    })
    addFractionOptions();const timer=window.setInterval(addFractionOptions,700);return()=>window.clearInterval(timer)
  },[modules.fractional.enabled,modules.fractional.units.join('|')])

  const categories=useMemo(()=>Array.from(new Set(['General',...props.data.products.map(p=>(p.category||'General').trim()).filter(Boolean),...custom])).sort((a,b)=>a.localeCompare(b,'es')),[props.data.products,custom])
  const filtered=useMemo(()=>{
    let rows=category==='Todas'?props.data.products:props.data.products.filter(p=>(p.category||'General')===category)
    if(dateMode!=='default')rows=[...rows].sort((a,b)=>{
      const av=new Date(dates[a.id]||0).getTime(),bv=new Date(dates[b.id]||0).getTime()
      return dateMode==='newest'?bv-av:av-bv
    })
    return rows
  },[props.data.products,category,dateMode,dates])
  const latest=useMemo(()=>[...props.data.products].filter(p=>dates[p.id]).sort((a,b)=>new Date(dates[b.id]).getTime()-new Date(dates[a.id]).getTime()).slice(0,5),[props.data.products,dates])
  const childData=useMemo(()=>({...props.data,products:filtered}),[props.data,filtered])

  function createCategory(){const raw=window.prompt('Nombre de la nueva categoría');const name=String(raw||'').trim();if(!name)return;if(categories.some(x=>x.toLocaleLowerCase('es')===name.toLocaleLowerCase('es'))){setCategory(categories.find(x=>x.toLocaleLowerCase('es')===name.toLocaleLowerCase('es'))||name);return}const next=[...custom,name];setCustom(next);localStorage.setItem(customKey(props.session.companyId),JSON.stringify(next));setCategory(name);props.message(`Categoría “${name}” creada. Ya podés asignarla a productos.`)}
  function relayMessage(text:string){const match=text.match(/^(\d+) productos procesados correctamente\.$/i);props.message(match?`✓ Se importaron ${match[1]} productos correctamente.`:text)}

  return <div>
    <section style={{margin:'0 0 12px',padding:12,border:'1px solid #dfe7e2',borderRadius:15,background:'rgba(255,255,255,.86)',display:'flex',gap:9,alignItems:'center',flexWrap:'wrap'}}>
      <div style={{position:'relative'}}><button type="button" onClick={()=>setCategoryOpen(x=>!x)} style={{height:39,border:'1px solid #cbd8d1',borderRadius:11,background:'#fff',fontWeight:900,padding:'0 14px',cursor:'pointer'}}>Categorías · {category} ▾</button>{categoryOpen&&<div style={{position:'absolute',zIndex:40,top:44,left:0,width:260,maxHeight:330,overflow:'auto',padding:8,border:'1px solid #d6e0da',borderRadius:14,background:'#fff',boxShadow:'0 18px 50px rgba(20,42,32,.18)'}}><button type="button" onClick={()=>{setCategory('Todas');setCategoryOpen(false)}} style={{width:'100%',textAlign:'left',padding:'9px 10px',border:0,borderRadius:9,background:category==='Todas'?'#e8f7ef':'transparent',fontWeight:850,cursor:'pointer'}}>Todos los productos <span style={{float:'right'}}>{props.data.products.length}</span></button>{categories.map(name=><button type="button" key={name} onClick={()=>{setCategory(name);setCategoryOpen(false)}} style={{width:'100%',textAlign:'left',padding:'9px 10px',border:0,borderRadius:9,background:category===name?'#e8f7ef':'transparent',fontWeight:750,cursor:'pointer'}}>{name}<span style={{float:'right',opacity:.65}}>{props.data.products.filter(p=>(p.category||'General')===name).length}</span></button>)}<div style={{height:1,background:'#edf1ef',margin:'6px 0'}}/><button type="button" onClick={()=>{setCategoryOpen(false);createCategory()}} style={{width:'100%',textAlign:'left',padding:'9px 10px',border:0,borderRadius:9,background:'#f6f9f7',fontWeight:900,cursor:'pointer'}}>+ Crear categoría</button></div>}</div>
      <label style={{display:'flex',gap:8,alignItems:'center',fontSize:12,fontWeight:850}}>Fecha de carga<select value={dateMode} onChange={e=>setDateMode(e.target.value as DateMode)} style={{height:39,border:'1px solid #cbd8d1',borderRadius:11,background:'#fff',padding:'0 10px',fontWeight:800}}><option value="default">Orden habitual</option><option value="newest">Más recientes primero</option><option value="oldest">Más antiguos primero</option></select></label>
      {category!=='Todas'&&<button type="button" onClick={()=>setCategory('Todas')} style={{height:36,border:0,borderRadius:999,background:'#eef4f1',fontWeight:800,padding:'0 12px',cursor:'pointer'}}>Quitar filtro ×</button>}
      {modules.fractional.enabled&&<span style={{fontSize:11,fontWeight:900,padding:'8px 11px',borderRadius:999,background:'#e7f7ef',color:'#116b43'}}>Venta fraccionada activa</span>}
      {modules.apparel.enabled&&<span style={{fontSize:11,fontWeight:900,padding:'8px 11px',borderRadius:999,background:'#f2eafa',color:'#624176'}}>Indumentaria activa</span>}
    </section>
    {dateMode!=='default'&&latest.length>0&&<section style={{margin:'0 0 12px',padding:'11px 13px',borderRadius:14,background:'#f7faf8',border:'1px solid #e3ebe6'}}><b style={{fontSize:12}}>{dateMode==='newest'?'Últimos productos cargados':'Orden por fecha de carga activo'}</b><div style={{display:'flex',gap:7,flexWrap:'wrap',marginTop:8}}>{latest.map(p=><span key={p.id} title={new Date(dates[p.id]).toLocaleString('es-AR')} style={{fontSize:11,padding:'7px 9px',borderRadius:9,background:'#fff',border:'1px solid #e0e7e3'}}><b>{p.name}</b> · {new Date(dates[p.id]).toLocaleDateString('es-AR')}</span>)}</div></section>}
    <ProductsInventory {...props} data={childData} message={relayMessage}/>
  </div>
}
