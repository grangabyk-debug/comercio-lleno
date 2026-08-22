'use client'

import { useEffect,useMemo,useState,type CSSProperties } from 'react'
import { readBusinessModules } from '@/lib/comercio/business-modules'
import type { CommerceSnapshot,TenantSession } from '@/lib/comercio/types'

const SUPABASE_URL=process.env.NEXT_PUBLIC_SUPABASE_URL??'https://wtcntclzcubkbtcsqkzc.supabase.co'
const PUBLISHABLE_KEY=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY??'sb_publishable_02U2KDLDTR42KxdcFHtfYw_IDM00Deb'
type Variant={id:string;parent_product_id:string;name:string;barcode?:string|null;apparel_size?:string|null;apparel_color?:string|null;price:number;stock:number;min_stock?:number|null;inventory_location?:string|null;active?:boolean}
type Draft={size:string;color:string,barcode:string,price:string,stock:string,minStock:string,location:string}
const empty:Draft={size:'',color:'',barcode:'',price:'',stock:'0',minStock:'0',location:''}
const box:CSSProperties={border:'1px solid #dfE7e2',borderRadius:16,background:'#fff',padding:14,display:'grid',gap:12}
const input:CSSProperties={height:39,border:'1px solid #ccd8d1',borderRadius:10,padding:'0 10px',fontWeight:750,minWidth:0}
function cacheKey(companyId:string){return`cl_apparel_variants_preview_${companyId}`}
function readLocal(companyId:string):Variant[]{if(typeof window==='undefined')return[];try{return JSON.parse(localStorage.getItem(cacheKey(companyId))||'[]')}catch{return[]}}
function writeLocal(companyId:string,rows:Variant[]){if(typeof window!=='undefined')localStorage.setItem(cacheKey(companyId),JSON.stringify(rows))}
function number(v:string){const n=Number(String(v||'0').replace(',','.'));return Number.isFinite(n)?Math.max(0,n):0}
function localId(){return`preview-${Date.now()}-${Math.random().toString(16).slice(2)}`}

export default function ApparelVariantsManager({data,session,message,refresh}:{data:CommerceSnapshot;session:TenantSession;message:(text:string)=>void;refresh:()=>Promise<void>}){
  const modules=readBusinessModules(session.companyId)
  const[parentId,setParentId]=useState('')
  const[rows,setRows]=useState<Variant[]>([])
  const[draft,setDraft]=useState<Draft>(empty)
  const[remoteReady,setRemoteReady]=useState<boolean|null>(null)
  const[busy,setBusy]=useState(false)
  const parents=useMemo(()=>data.products.filter(p=>p.active!==false).sort((a,b)=>a.name.localeCompare(b.name,'es')),[data.products])
  const parent=parents.find(p=>p.id===parentId)||null

  useEffect(()=>{if(!parentId&&parents[0])setParentId(parents[0].id)},[parents,parentId])
  useEffect(()=>{if(parent){setDraft(d=>({...d,price:d.price||String(parent.price||0)}))}},[parentId])
  useEffect(()=>{let alive=true;(async()=>{
    if(!parentId){setRows([]);return}
    try{
      const url=`${SUPABASE_URL}/rest/v1/products?select=id,parent_product_id,name,barcode,apparel_size,apparel_color,price,stock,min_stock,inventory_location,active&company_id=eq.${encodeURIComponent(session.companyId)}&parent_product_id=eq.${encodeURIComponent(parentId)}&order=apparel_size.asc,apparel_color.asc`
      const response=await fetch(url,{headers:{apikey:PUBLISHABLE_KEY,Authorization:`Bearer ${session.token}`},cache:'no-store'})
      if(!response.ok)throw new Error('preview-columns-not-applied')
      const result=await response.json().catch(()=>[])
      if(alive){setRemoteReady(true);setRows(Array.isArray(result)?result:[])}
    }catch{if(alive){setRemoteReady(false);setRows(readLocal(session.companyId).filter(x=>x.parent_product_id===parentId))}}
  })();return()=>{alive=false}},[parentId,session.companyId,session.token])

  if(!modules.apparel.enabled)return null

  async function add(){
    if(!parent||!draft.size.trim()||!draft.color.trim()){message('Elegí un talle y un color para crear la variante.');return}
    setBusy(true)
    const variant:Variant={id:localId(),parent_product_id:parent.id,name:`${parent.name} · ${draft.size.trim()} · ${draft.color.trim()}`,barcode:draft.barcode.trim()||null,apparel_size:draft.size.trim(),apparel_color:draft.color.trim(),price:number(draft.price)||Number(parent.price||0),stock:number(draft.stock),min_stock:number(draft.minStock),inventory_location:draft.location.trim()||null,active:true}
    try{
      if(remoteReady){
        const payload={company_id:session.companyId,name:variant.name,barcode:variant.barcode||`VAR-${Date.now()}`,category:parent.category||'General',unit:'unidad',cost:Number(parent.cost||0),price:variant.price,wholesale_price:Number(parent.wholesale_price||0),stock:variant.stock,min_stock:Number(variant.min_stock||0),target_stock:Number(parent.target_stock||0),active:true,parent_product_id:parent.id,apparel_size:variant.apparel_size,apparel_color:variant.apparel_color,inventory_location:variant.inventory_location,updated_at:new Date().toISOString()}
        const r=await fetch(`${SUPABASE_URL}/rest/v1/products`,{method:'POST',headers:{apikey:PUBLISHABLE_KEY,Authorization:`Bearer ${session.token}`,'Content-Type':'application/json',Prefer:'return=representation'},body:JSON.stringify(payload)})
        const result=await r.json().catch(()=>null);if(!r.ok)throw new Error(result?.message||'No se pudo crear la variante.')
        const created=Array.isArray(result)?result[0]:result;setRows(prev=>[...prev,created]);await refresh();message(`Variante ${draft.size} / ${draft.color} creada.`)
      }else{
        const all=readLocal(session.companyId);const next=[...all,variant];writeLocal(session.companyId,next);setRows(next.filter(x=>x.parent_product_id===parent.id));message('Variante guardada en esta preview. Quedará persistida en la base cuando se apruebe la migración preparada.')
      }
      setDraft({...empty,price:String(parent.price||0)})
    }catch(error){message(error instanceof Error?error.message:String(error))}finally{setBusy(false)}
  }

  async function update(id:string,patch:Partial<Variant>){
    const current=rows.find(x=>x.id===id);if(!current)return
    const next={...current,...patch};setRows(prev=>prev.map(x=>x.id===id?next:x))
    if(remoteReady&&!id.startsWith('preview-')){
      const r=await fetch(`${SUPABASE_URL}/rest/v1/products?id=eq.${encodeURIComponent(id)}&company_id=eq.${encodeURIComponent(session.companyId)}`,{method:'PATCH',headers:{apikey:PUBLISHABLE_KEY,Authorization:`Bearer ${session.token}`,'Content-Type':'application/json',Prefer:'return=minimal'},body:JSON.stringify({barcode:next.barcode||'',apparel_size:next.apparel_size,apparel_color:next.apparel_color,price:Number(next.price||0),stock:Number(next.stock||0),min_stock:Number(next.min_stock||0),inventory_location:next.inventory_location||null,active:next.active!==false,updated_at:new Date().toISOString()})})
      if(!r.ok){message('No se pudo guardar la variante en la base.');return}
      message('Variante actualizada.')
    }else{
      const all=readLocal(session.companyId).map(x=>x.id===id?next:x);writeLocal(session.companyId,all)
    }
  }

  return <section style={{...box,marginTop:14}}>
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:12,flexWrap:'wrap'}}><div><div style={{fontSize:10,fontWeight:950,letterSpacing:1.2,color:'#69457d'}}>INDUMENTARIA · VARIANTES</div><h3 style={{margin:'4px 0 4px',fontSize:18}}>Talles, colores y stock por variante</h3><p style={{margin:0,fontSize:11,color:'#68766f'}}>Cada combinación puede tener su propio código, precio, stock, mínimo y ubicación.</p></div><span style={{fontSize:10,fontWeight:900,padding:'7px 10px',borderRadius:999,background:remoteReady?'#e8f7ef':'#fff6e8',color:remoteReady?'#126d45':'#8b5a16'}}>{remoteReady?'Persistencia lista':'Modo preview local'}</span></div>
    <label style={{display:'grid',gap:6,fontSize:11,fontWeight:850,maxWidth:520}}>Producto base<select style={input} value={parentId} onChange={e=>setParentId(e.target.value)}>{parents.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></label>
    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(120px,1fr))',gap:8}}>
      <label style={{display:'grid',gap:5,fontSize:10,fontWeight:850}}>Talle<select style={input} value={draft.size} onChange={e=>setDraft({...draft,size:e.target.value})}><option value="">Elegir…</option>{modules.apparel.sizes.map(x=><option key={x}>{x}</option>)}</select></label>
      <label style={{display:'grid',gap:5,fontSize:10,fontWeight:850}}>Color<select style={input} value={draft.color} onChange={e=>setDraft({...draft,color:e.target.value})}><option value="">Elegir…</option>{modules.apparel.colors.map(x=><option key={x}>{x}</option>)}</select></label>
      <label style={{display:'grid',gap:5,fontSize:10,fontWeight:850}}>Código / SKU<input style={input} value={draft.barcode} onChange={e=>setDraft({...draft,barcode:e.target.value})}/></label>
      <label style={{display:'grid',gap:5,fontSize:10,fontWeight:850}}>Precio<input style={input} inputMode="decimal" value={draft.price} onChange={e=>setDraft({...draft,price:e.target.value})}/></label>
      <label style={{display:'grid',gap:5,fontSize:10,fontWeight:850}}>Stock<input style={input} inputMode="numeric" value={draft.stock} onChange={e=>setDraft({...draft,stock:e.target.value})}/></label>
      <label style={{display:'grid',gap:5,fontSize:10,fontWeight:850}}>Stock mínimo<input style={input} inputMode="numeric" value={draft.minStock} onChange={e=>setDraft({...draft,minStock:e.target.value})}/></label>
      {modules.apparel.trackLocation&&<label style={{display:'grid',gap:5,fontSize:10,fontWeight:850}}>Ubicación<input style={input} value={draft.location} onChange={e=>setDraft({...draft,location:e.target.value})} placeholder="Ej. A2 / estante 4"/></label>}
      <button type="button" disabled={busy||!parentId} onClick={()=>void add()} style={{alignSelf:'end',height:39,border:0,borderRadius:10,background:'#68407d',color:'#fff',fontWeight:900,cursor:'pointer'}}>{busy?'Guardando…':'+ Crear variante'}</button>
    </div>
    <div style={{overflowX:'auto'}}><div style={{minWidth:760}}>{rows.length?<>{rows.map(v=><div key={v.id} style={{display:'grid',gridTemplateColumns:'110px 130px 150px 110px 90px 90px minmax(130px,1fr)',gap:7,alignItems:'center',padding:'8px 0',borderTop:'1px solid #edf1ef'}}><select style={input} value={v.apparel_size||''} onChange={e=>void update(v.id,{apparel_size:e.target.value})}>{modules.apparel.sizes.map(x=><option key={x}>{x}</option>)}</select><select style={input} value={v.apparel_color||''} onChange={e=>void update(v.id,{apparel_color:e.target.value})}>{modules.apparel.colors.map(x=><option key={x}>{x}</option>)}</select><input style={input} value={v.barcode||''} onChange={e=>void update(v.id,{barcode:e.target.value})}/><input style={input} inputMode="decimal" value={v.price} onChange={e=>void update(v.id,{price:number(e.target.value)})}/><input style={input} inputMode="numeric" value={v.stock} onChange={e=>void update(v.id,{stock:number(e.target.value)})}/><input style={input} inputMode="numeric" value={v.min_stock||0} onChange={e=>void update(v.id,{min_stock:number(e.target.value)})}/>{modules.apparel.trackLocation?<input style={input} value={v.inventory_location||''} onChange={e=>void update(v.id,{inventory_location:e.target.value})}/>:<span style={{fontSize:11,color:'#7a8781'}}>Ubicación oculta</span>}</div>)}</>:<div style={{padding:'14px 2px',fontSize:11,color:'#74817b'}}>Este producto todavía no tiene variantes. Creá la primera combinación de talle y color.</div>}</div></div>
  </section>
}
