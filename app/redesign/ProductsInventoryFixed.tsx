'use client'

import { useEffect,useLayoutEffect,useMemo,useState,type ComponentProps } from 'react'
import ProductsInventory,{type ProductDateMode} from './ProductsInventory'
import ApparelVariantsManager from './ApparelVariantsManager'
import { readBusinessModules,type BusinessModulesSettings } from '@/lib/comercio/business-modules'
import type { Product } from '@/lib/comercio/types'

type Props=ComponentProps<typeof ProductsInventory>
function customKey(companyId:string){return`cl_product_categories_${companyId}`}
function overrideKey(companyId:string){return`cl_product_preview_overrides_${companyId}`}
function readCustom(companyId:string){if(typeof window==='undefined')return[] as string[];try{return JSON.parse(localStorage.getItem(customKey(companyId))||'[]') as string[]}catch{return[]}}
function readOverrides(companyId:string){if(typeof window==='undefined')return{} as Record<string,Partial<Product>>;try{return JSON.parse(sessionStorage.getItem(overrideKey(companyId))||'{}') as Record<string,Partial<Product>>}catch{return{}}}
function categoryToken(value:string|undefined|null){return String(value||'General').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase().replace(/[^A-Z0-9]+/g,' ').trim()}
function canonicalCategory(value:string|undefined|null){
  const raw=String(value||'').trim()
  const token=categoryToken(raw)
  if(!token||token==='GENERAL')return'General'
  if(token.startsWith('ART LIMP'))return'Art limpieza'
  if(token.startsWith('ART PERF'))return'Art perfumería'
  if(token==='ART VA'||token.startsWith('ART VAR'))return'Art varios'
  return raw||'General'
}
function sameCategory(a:string|undefined|null,b:string){return canonicalCategory(a).toLocaleLowerCase('es')===canonicalCategory(b).toLocaleLowerCase('es')}

export default function ProductsInventoryFixed(props:Props){
  const[category,setCategory]=useState('Todas')
  const[categoryOpen,setCategoryOpen]=useState(false)
  const[custom,setCustom]=useState<string[]>(()=>readCustom(props.session.companyId))
  const[dateMode,setDateMode]=useState<ProductDateMode>('default')
  const[modules,setModules]=useState<BusinessModulesSettings>(()=>readBusinessModules(props.session.companyId))
  const[overrides,setOverrides]=useState<Record<string,Partial<Product>>>(()=>readOverrides(props.session.companyId))

  useEffect(()=>{
    setCustom(readCustom(props.session.companyId).map(canonicalCategory))
    setOverrides(readOverrides(props.session.companyId))
    const onModules=(event:Event)=>{const next=(event as CustomEvent<BusinessModulesSettings>).detail;if(next)setModules(next)}
    window.addEventListener('comercio:business-modules',onModules)
    return()=>window.removeEventListener('comercio:business-modules',onModules)
  },[props.session.companyId])

  useLayoutEffect(()=>{
    const original=window.fetch.bind(window)
    window.fetch=(async(input:RequestInfo|URL,init?:RequestInit)=>{
      const raw=typeof input==='string'?input:input instanceof URL?input.toString():input.url
      const method=(init?.method||(input instanceof Request?input.method:'GET')).toUpperCase()
      const isProductPatch=method==='PATCH'&&/\/rest\/v1\/products(?:\?|$)/.test(raw)
      const response=await original(input,init)
      if(isProductPatch&&response.ok){
        try{
          const url=new URL(raw,window.location.origin)
          const idFilter=url.searchParams.get('id')||''
          const id=idFilter.startsWith('eq.')?decodeURIComponent(idFilter.slice(3)):''
          const body=typeof init?.body==='string'?JSON.parse(init.body):null
          if(id&&body&&typeof body==='object'){
            setOverrides(current=>{
              const next={...current,[id]:{...(current[id]||{}),...body}}
              try{sessionStorage.setItem(overrideKey(props.session.companyId),JSON.stringify(next))}catch{}
              return next
            })
          }
        }catch{}
      }
      return response
    }) as typeof window.fetch
    return()=>{window.fetch=original as typeof window.fetch}
  },[props.session.companyId])

  const canonicalProducts=useMemo(()=>props.data.products.map(p=>{
    const merged={...p,...(overrides[p.id]||{})}
    return {...merged,category:canonicalCategory(merged.category)}
  }),[props.data.products,overrides])
  const categories=useMemo(()=>Array.from(new Set(['General',...canonicalProducts.map(p=>canonicalCategory(p.category)),...custom.map(canonicalCategory)])).sort((a,b)=>{
    const preferred=['Art limpieza','Art perfumería','Art varios','General']
    const ai=preferred.indexOf(a),bi=preferred.indexOf(b)
    if(ai>=0||bi>=0){if(ai<0)return 1;if(bi<0)return-1;return ai-bi}
    return a.localeCompare(b,'es')
  }),[canonicalProducts,custom])
  const filtered=useMemo(()=>category==='Todas'?canonicalProducts:canonicalProducts.filter(p=>sameCategory(p.category,category)),[canonicalProducts,category])
  const childData=useMemo(()=>({...props.data,products:filtered}),[props.data,filtered])

  function createCategory(){
    const raw=window.prompt('Nombre de la nueva categoría')
    const name=canonicalCategory(raw)
    if(!raw||!String(raw).trim())return
    if(categories.some(x=>x.toLocaleLowerCase('es')===name.toLocaleLowerCase('es'))){setCategory(categories.find(x=>x.toLocaleLowerCase('es')===name.toLocaleLowerCase('es'))||name);return}
    const next=Array.from(new Set([...custom,name]))
    setCustom(next)
    localStorage.setItem(customKey(props.session.companyId),JSON.stringify(next))
    setCategory(name)
    props.message(`Categoría “${name}” creada. Ya podés asignarla a productos nuevos o existentes.`)
  }
  function relayMessage(text:string){const match=text.match(/^(\d+) productos procesados correctamente\.$/i);props.message(match?`✓ Se importaron ${match[1]} productos correctamente.`:text)}

  return <div>
    <section style={{margin:'0 0 12px',padding:12,border:'1px solid #dfe7e2',borderRadius:15,background:'rgba(255,255,255,.86)',display:'flex',gap:9,alignItems:'center',flexWrap:'wrap'}}>
      <div style={{position:'relative'}}><button type="button" onClick={()=>setCategoryOpen(x=>!x)} style={{height:39,border:'1px solid #cbd8d1',borderRadius:11,background:'#fff',fontWeight:900,padding:'0 14px',cursor:'pointer'}}>Categorías · {category} ▾</button>{categoryOpen&&<div style={{position:'absolute',zIndex:40,top:44,left:0,width:260,maxHeight:330,overflow:'auto',padding:8,border:'1px solid #d6e0da',borderRadius:14,background:'#fff',boxShadow:'0 18px 50px rgba(20,42,32,.18)'}}><button type="button" onClick={()=>{setCategory('Todas');setCategoryOpen(false)}} style={{width:'100%',textAlign:'left',padding:'9px 10px',border:0,borderRadius:9,background:category==='Todas'?'#e8f7ef':'transparent',fontWeight:850,cursor:'pointer'}}>Todos los productos <span style={{float:'right'}}>{canonicalProducts.length}</span></button>{categories.map(name=><button type="button" key={name} onClick={()=>{setCategory(name);setCategoryOpen(false)}} style={{width:'100%',textAlign:'left',padding:'9px 10px',border:0,borderRadius:9,background:category===name?'#e8f7ef':'transparent',fontWeight:750,cursor:'pointer'}}>{name}<span style={{float:'right',opacity:.65}}>{canonicalProducts.filter(p=>sameCategory(p.category,name)).length}</span></button>)}<div style={{height:1,background:'#edf1ef',margin:'6px 0'}}/><button type="button" onClick={()=>{setCategoryOpen(false);createCategory()}} style={{width:'100%',textAlign:'left',padding:'9px 10px',border:0,borderRadius:9,background:'#f6f9f7',fontWeight:900,cursor:'pointer'}}>+ Crear categoría</button></div>}</div>
      <label style={{display:'flex',gap:8,alignItems:'center',fontSize:12,fontWeight:850}}>Fecha de carga<select value={dateMode} onChange={e=>setDateMode(e.target.value as ProductDateMode)} style={{height:39,border:'1px solid #cbd8d1',borderRadius:11,background:'#fff',padding:'0 10px',fontWeight:800}}><option value="default">Orden habitual</option><option value="newest">Más recientes primero</option><option value="oldest">Más antiguos primero</option></select></label>
      {dateMode!=='default'&&<span style={{fontSize:11,fontWeight:800,color:'#4d6559'}}>Seguís editando en la misma grilla, sin perder el orden.</span>}
      {category!=='Todas'&&<button type="button" onClick={()=>setCategory('Todas')} style={{height:36,border:0,borderRadius:999,background:'#eef4f1',fontWeight:800,padding:'0 12px',cursor:'pointer'}}>Quitar filtro ×</button>}
      {modules.fractional.enabled&&<span style={{fontSize:11,fontWeight:900,padding:'8px 11px',borderRadius:999,background:'#e7f7ef',color:'#116b43'}}>Venta fraccionada activa</span>}{modules.apparel.enabled&&<span style={{fontSize:11,fontWeight:900,padding:'8px 11px',borderRadius:999,background:'#f2eafa',color:'#624176'}}>Indumentaria activa</span>}
    </section>
    <ProductsInventory {...props} data={childData} message={relayMessage} categoryOptions={categories} dateMode={dateMode}/>
    {modules.apparel.enabled&&<ApparelVariantsManager data={{...props.data,products:canonicalProducts}} session={props.session} message={props.message} refresh={props.refresh}/>} 
  </div>
}
