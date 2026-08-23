'use client'

import { useEffect,useLayoutEffect,useMemo,useRef,useState,type ComponentProps } from 'react'
import ProductsInventory from './ProductsInventory'
import ApparelVariantsManager from './ApparelVariantsManager'
import { readBusinessModules,type BusinessModulesSettings } from '@/lib/comercio/business-modules'

const SUPABASE_URL=process.env.NEXT_PUBLIC_SUPABASE_URL??'https://wtcntclzcubkbtcsqkzc.supabase.co'
const PUBLISHABLE_KEY=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY??'sb_publishable_02U2KDLDTR42KxdcFHtfYw_IDM00Deb'
type Props=ComponentProps<typeof ProductsInventory>
type DateMode='default'|'newest'|'oldest'
function customKey(companyId:string){return`cl_product_categories_${companyId}`}
function readCustom(companyId:string){if(typeof window==='undefined')return[] as string[];try{return JSON.parse(localStorage.getItem(customKey(companyId))||'[]') as string[]}catch{return[]}}
function loadedAt(value:string|undefined){if(!value)return'Fecha no disponible';const date=new Date(value);return Number.isNaN(date.getTime())?'Fecha no disponible':date.toLocaleString('es-AR',{dateStyle:'short',timeStyle:'short'})}
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
  const rootRef=useRef<HTMLDivElement|null>(null)
  const[category,setCategory]=useState('Todas'),[categoryOpen,setCategoryOpen]=useState(false),[custom,setCustom]=useState<string[]>(()=>readCustom(props.session.companyId)),[dates,setDates]=useState<Record<string,string>>({}),[dateMode,setDateMode]=useState<DateMode>('default'),[modules,setModules]=useState<BusinessModulesSettings>(()=>readBusinessModules(props.session.companyId))
  const datalistId=`cl-product-categories-${props.session.companyId.replace(/[^a-zA-Z0-9_-]/g,'')}`

  useEffect(()=>{setCustom(readCustom(props.session.companyId).map(canonicalCategory));const onModules=(event:Event)=>{const next=(event as CustomEvent<BusinessModulesSettings>).detail;if(next)setModules(next)};window.addEventListener('comercio:business-modules',onModules);return()=>window.removeEventListener('comercio:business-modules',onModules)},[props.session.companyId])
  useEffect(()=>{let active=true;fetch(`${SUPABASE_URL}/rest/v1/products?select=id,created_at&company_id=eq.${encodeURIComponent(props.session.companyId)}&active=eq.true&limit=5000`,{headers:{apikey:PUBLISHABLE_KEY,Authorization:`Bearer ${props.session.token}`},cache:'no-store'}).then(r=>r.ok?r.json():[]).then((rows:Array<{id:string;created_at?:string|null}>)=>{if(!active)return;const next:Record<string,string>={};rows.forEach(row=>{if(row.id&&row.created_at)next[row.id]=row.created_at});setDates(next)}).catch(()=>{});return()=>{active=false}},[props.session.companyId,props.session.token,props.data.products.length])
  useLayoutEffect(()=>{const original=window.fetch.bind(window);window.fetch=(async(input:RequestInfo|URL,init?:RequestInit)=>{const raw=typeof input==='string'?input:input instanceof URL?input.toString():input.url;const method=(init?.method||(input instanceof Request?input.method:'GET')).toUpperCase();const isProductPatch=method==='PATCH'&&/\/rest\/v1\/products(?:\?|$)/.test(raw);const response=await original(input,init);if(isProductPatch&&response.ok)window.setTimeout(()=>{void props.refresh()},60);return response}) as typeof window.fetch;return()=>{window.fetch=original as typeof window.fetch}},[props.refresh])
  useLayoutEffect(()=>{if(!modules.fractional.enabled)return;const addFractionOptions=()=>document.querySelectorAll<HTMLSelectElement>('select').forEach(select=>{const values=Array.from(select.options).map(x=>x.value||x.text);if(values.includes('kg')&&values.includes('litro'))for(const unit of modules.fractional.units){const value=unit==='g'?'g':unit==='ml'?'ml':unit;if(!values.includes(value)){const option=document.createElement('option');option.value=value;option.textContent=unit==='g'?'gramo':unit==='ml'?'mililitro':unit;select.appendChild(option)}}});addFractionOptions();const timer=window.setInterval(addFractionOptions,700);return()=>window.clearInterval(timer)},[modules.fractional.enabled,modules.fractional.units.join('|')])

  const canonicalProducts=useMemo(()=>props.data.products.map(p=>({...p,category:canonicalCategory(p.category)})),[props.data.products])
  const categories=useMemo(()=>Array.from(new Set(['General',...canonicalProducts.map(p=>canonicalCategory(p.category)),...custom.map(canonicalCategory)])).sort((a,b)=>{const preferred=['Art limpieza','Art perfumería','Art varios','General'];const ai=preferred.indexOf(a),bi=preferred.indexOf(b);if(ai>=0||bi>=0){if(ai<0)return 1;if(bi<0)return-1;return ai-bi}return a.localeCompare(b,'es')}),[canonicalProducts,custom])
  const filtered=useMemo(()=>{let rows=category==='Todas'?canonicalProducts:canonicalProducts.filter(p=>sameCategory(p.category,category));if(dateMode!=='default')rows=[...rows].sort((a,b)=>{const av=new Date(dates[a.id]||0).getTime(),bv=new Date(dates[b.id]||0).getTime();return dateMode==='newest'?bv-av:av-bv});return rows},[canonicalProducts,category,dateMode,dates])
  const childData=useMemo(()=>({...props.data,products:filtered}),[props.data,filtered])
  const dateRank=useMemo(()=>new Map(filtered.map((p,index)=>[p.id,index])),[filtered])
  const barcodeToId=useMemo(()=>{const map=new Map<string,string>();filtered.forEach(p=>{if(p.barcode)map.set(String(p.barcode).trim(),p.id)});return map},[filtered])
  const nameToIds=useMemo(()=>{const map=new Map<string,string[]>();filtered.forEach(p=>{const key=p.name.trim().toLocaleLowerCase('es');map.set(key,[...(map.get(key)||[]),p.id])});return map},[filtered])

  useLayoutEffect(()=>{
    const root=rootRef.current
    if(!root)return
    let observer:MutationObserver|null=null
    let applying=false
    const decorate=()=>{
      if(applying)return
      applying=true
      try{
        root.querySelectorAll('label').forEach(label=>{
          const text=(label.textContent||'').trim().toLocaleLowerCase('es')
          if(text.startsWith('categoría'))label.querySelector('input')?.setAttribute('list',datalistId)
        })
        const checkbox=root.querySelector<HTMLInputElement>('input[type="checkbox"]')
        const firstRow=checkbox?.parentElement?.parentElement as HTMLElement|null
        const table=firstRow?.parentElement as HTMLElement|null
        if(!table)return
        const dataRows=Array.from(table.children).filter(node=>(node as HTMLElement).querySelector?.('input[type="checkbox"]')) as HTMLElement[]
        dataRows.forEach(row=>{
          const cells=Array.from(row.children) as HTMLElement[]
          const categoryInput=cells[3]?.querySelector('input')
          if(categoryInput)categoryInput.setAttribute('list',datalistId)
          row.querySelectorAll('[data-load-date]').forEach(node=>node.remove())
        })
        if(dateMode==='default'){
          table.style.removeProperty('display');table.style.removeProperty('flex-direction')
          dataRows.forEach(row=>row.style.removeProperty('order'))
          return
        }
        table.style.display='flex';table.style.flexDirection='column'
        const header=Array.from(table.children).find(node=>!(node as HTMLElement).querySelector?.('input[type="checkbox"]')) as HTMLElement|undefined
        if(header)header.style.order='0'
        dataRows.forEach((row,rowIndex)=>{
          const cells=Array.from(row.children) as HTMLElement[]
          const editInput=row.querySelector<HTMLInputElement>('[data-product-name]')
          let id=editInput?.getAttribute('data-product-name')||''
          if(!id){const barcode=(cells[2]?.textContent||'').trim();if(barcode&&barcode!=='—')id=barcodeToId.get(barcode)||''}
          if(!id){const name=(cells[1]?.querySelector('b')?.textContent||cells[1]?.textContent||'').replace(/%\s*\d+(?:[.,]\d+)?/g,'').trim().toLocaleLowerCase('es');id=(nameToIds.get(name)||[])[0]||''}
          const rank=id?(dateRank.get(id)??rowIndex):rowIndex
          row.style.order=String(rank+1)
          if(id&&cells[3]){
            const small=document.createElement('small');small.setAttribute('data-load-date','1');small.textContent=`Cargado: ${loadedAt(dates[id])}`;small.style.marginTop='3px';small.style.opacity='.75';cells[3].appendChild(small)
          }
        })
      }finally{applying=false}
    }
    decorate()
    observer=new MutationObserver(()=>window.requestAnimationFrame(decorate));observer.observe(root,{childList:true,subtree:true})
    return()=>observer?.disconnect()
  },[dateMode,dateRank,barcodeToId,nameToIds,dates,datalistId,filtered.length])

  function createCategory(){const raw=window.prompt('Nombre de la nueva categoría');const name=canonicalCategory(raw);if(!raw||!String(raw).trim())return;if(categories.some(x=>x.toLocaleLowerCase('es')===name.toLocaleLowerCase('es'))){setCategory(categories.find(x=>x.toLocaleLowerCase('es')===name.toLocaleLowerCase('es'))||name);return}const next=Array.from(new Set([...custom,name]));setCustom(next);localStorage.setItem(customKey(props.session.companyId),JSON.stringify(next));setCategory(name);props.message(`Categoría “${name}” creada. Ya podés asignarla a productos nuevos o existentes.`)}
  function relayMessage(text:string){const match=text.match(/^(\d+) productos procesados correctamente\.$/i);props.message(match?`✓ Se importaron ${match[1]} productos correctamente.`:text)}
  function blockColumnSortWhileDateMode(event:React.MouseEvent<HTMLDivElement>){if(dateMode==='default')return;const button=(event.target as HTMLElement).closest('button');if(!button)return;const label=(button.textContent||'').toLocaleLowerCase('es');if(['producto','costo','minorista','mayorista','stock'].some(x=>label.includes(x))){event.preventDefault();event.stopPropagation()}}

  return <div ref={rootRef} onClickCapture={blockColumnSortWhileDateMode}>
    <datalist id={datalistId}>{categories.map(name=><option key={name} value={name}/>)}</datalist>
    <section style={{margin:'0 0 12px',padding:12,border:'1px solid #dfe7e2',borderRadius:15,background:'rgba(255,255,255,.86)',display:'flex',gap:9,alignItems:'center',flexWrap:'wrap'}}>
      <div style={{position:'relative'}}><button type="button" onClick={()=>setCategoryOpen(x=>!x)} style={{height:39,border:'1px solid #cbd8d1',borderRadius:11,background:'#fff',fontWeight:900,padding:'0 14px',cursor:'pointer'}}>Categorías · {category} ▾</button>{categoryOpen&&<div style={{position:'absolute',zIndex:40,top:44,left:0,width:260,maxHeight:330,overflow:'auto',padding:8,border:'1px solid #d6e0da',borderRadius:14,background:'#fff',boxShadow:'0 18px 50px rgba(20,42,32,.18)'}}><button type="button" onClick={()=>{setCategory('Todas');setCategoryOpen(false)}} style={{width:'100%',textAlign:'left',padding:'9px 10px',border:0,borderRadius:9,background:category==='Todas'?'#e8f7ef':'transparent',fontWeight:850,cursor:'pointer'}}>Todos los productos <span style={{float:'right'}}>{canonicalProducts.length}</span></button>{categories.map(name=><button type="button" key={name} onClick={()=>{setCategory(name);setCategoryOpen(false)}} style={{width:'100%',textAlign:'left',padding:'9px 10px',border:0,borderRadius:9,background:category===name?'#e8f7ef':'transparent',fontWeight:750,cursor:'pointer'}}>{name}<span style={{float:'right',opacity:.65}}>{canonicalProducts.filter(p=>sameCategory(p.category,name)).length}</span></button>)}<div style={{height:1,background:'#edf1ef',margin:'6px 0'}}/><button type="button" onClick={()=>{setCategoryOpen(false);createCategory()}} style={{width:'100%',textAlign:'left',padding:'9px 10px',border:0,borderRadius:9,background:'#f6f9f7',fontWeight:900,cursor:'pointer'}}>+ Crear categoría</button></div>}</div>
      <label style={{display:'flex',gap:8,alignItems:'center',fontSize:12,fontWeight:850}}>Fecha de carga<select value={dateMode} onChange={e=>setDateMode(e.target.value as DateMode)} style={{height:39,border:'1px solid #cbd8d1',borderRadius:11,background:'#fff',padding:'0 10px',fontWeight:800}}><option value="default">Orden habitual</option><option value="newest">Más recientes primero</option><option value="oldest">Más antiguos primero</option></select></label>
      {dateMode!=='default'&&<span style={{fontSize:11,fontWeight:800,color:'#4d6559'}}>Podés editar directamente sin perder el orden por fecha.</span>}
      {category!=='Todas'&&<button type="button" onClick={()=>setCategory('Todas')} style={{height:36,border:0,borderRadius:999,background:'#eef4f1',fontWeight:800,padding:'0 12px',cursor:'pointer'}}>Quitar filtro ×</button>}
      {modules.fractional.enabled&&<span style={{fontSize:11,fontWeight:900,padding:'8px 11px',borderRadius:999,background:'#e7f7ef',color:'#116b43'}}>Venta fraccionada activa</span>}{modules.apparel.enabled&&<span style={{fontSize:11,fontWeight:900,padding:'8px 11px',borderRadius:999,background:'#f2eafa',color:'#624176'}}>Indumentaria activa</span>}
    </section>
    <ProductsInventory key={`${dateMode}-${category}`} {...props} data={childData} message={relayMessage}/>
    {modules.apparel.enabled&&<ApparelVariantsManager data={{...props.data,products:canonicalProducts}} session={props.session} message={props.message} refresh={props.refresh}/>} 
  </div>
}
