'use client'

import { FormEvent, useEffect, useMemo, useState } from 'react'
import core from './page.module.css'
import styles from './management.module.css'
import { createTwoForOnePromotion } from '@/lib/comercio/api'
import { applyPercentagePromotion, loadPromotionsEnhanced, removePercentagePromotion, type PromotionRecord } from '@/lib/comercio/promotion-api'
import type { CommerceSnapshot, Product, TenantSession } from '@/lib/comercio/types'

const money = new Intl.NumberFormat('es-AR', { style:'currency', currency:'ARS', maximumFractionDigits:0 })

function esc(s:string){return s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]||c))}
function checksumEAN13(value:string){const d=value.slice(0,12).split('').map(Number);let sum=0;for(let i=0;i<12;i++)sum+=d[i]*(i%2?3:1);return String((10-sum%10)%10)}
function eanBits(value:string){let s=value.replace(/\D/g,'');if(s.length===12)s+=checksumEAN13(s);if(s.length!==13)return null;const L=['0001101','0011001','0010011','0111101','0100011','0110001','0101111','0111011','0110111','0001011'],G=['0100111','0110011','0011011','0100001','0011101','0111001','0000101','0010001','0001001','0010111'],R=['1110010','1100110','1101100','1000010','1011100','1001110','1010000','1000100','1001000','1110100'],P=['LLLLLL','LLGLGG','LLGGLG','LLGGGL','LGLLGG','LGGLLG','LGGGLL','LGLGLG','LGLGGL','LGGLGL'];let bits='101',parity=P[Number(s[0])];for(let i=1;i<=6;i++)bits+=parity[i-1]==='L'?L[Number(s[i])]:G[Number(s[i])];bits+='01010';for(let i=7;i<=12;i++)bits+=R[Number(s[i])];bits+='101';return{s,bits}}

function printOfferLabels(items:Array<{promotion:PromotionRecord;product:Product}>){
  const labels=items.map(({promotion,product})=>{
    const original=Number(promotion.original_price||product.price)
    const percent=Number(promotion.discount_percent||0)
    const code=eanBits(String(product.barcode||''))
    const svg=code?`<svg viewBox="0 0 ${code.bits.length} 52" preserveAspectRatio="none"><g>${code.bits.split('').map((b,i)=>b==='1'?`<rect x="${i}" y="0" width="1" height="41"/>`:'').join('')}</g><text x="0" y="51" font-size="7">${code.s}</text></svg>`:''
    return `<article class="label"><div class="offer">OFERTA</div><div class="name">${esc(product.name)}</div><div class="old">ANTES <s>${esc(money.format(original))}</s></div><div class="discount">-${percent}% DESCUENTO</div><div class="new">${esc(money.format(product.price))}</div>${svg?`<div class="barcode">${svg}</div>`:`<div class="code">${esc(product.barcode||'SIN CÓDIGO')}</div>`}</article>`
  })
  const sheets:string[]=[];for(let i=0;i<labels.length;i+=21)sheets.push(`<main class="sheet">${labels.slice(i,i+21).join('')}</main>`)
  const w=window.open('','_blank','width=1000,height=800');if(!w){alert('Permití ventanas emergentes para imprimir etiquetas.');return}
  w.document.write(`<!doctype html><html><head><title>Etiquetas de oferta</title><style>@page{size:A4 portrait;margin:0}*{box-sizing:border-box}body{margin:0;font-family:Arial;color:#000}.sheet{width:210mm;height:297mm;display:grid;grid-template-columns:repeat(3,70mm);grid-template-rows:repeat(7,42.42mm);break-after:page}.label{width:70mm;height:42.42mm;border:1px dashed #777;padding:2.3mm 3mm;text-align:center;overflow:hidden;display:flex;flex-direction:column;align-items:center}.offer{border:2px solid #000;font-size:13px;line-height:16px;font-weight:900;letter-spacing:2px;padding:0 7px}.name{font-size:10px;font-weight:800;text-transform:uppercase;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;width:100%;margin-top:1px}.old{font-size:9px;margin-top:1px}.old s{font-size:11px;font-weight:800}.discount{font-size:11px;font-weight:900;border-top:1px solid #000;border-bottom:1px solid #000;width:100%;margin:1px 0}.new{font-size:21px;font-weight:950;line-height:22px}.barcode{width:42mm;height:9mm;margin-top:auto}.barcode svg{width:42mm;height:9mm}.code{font-size:8px;margin-top:auto}</style></head><body>${sheets.join('')}<script>onload=()=>setTimeout(()=>print(),250)<\/script></body></html>`);w.document.close()
}

export default function PromotionsEnhanced({data,session}:{data:CommerceSnapshot;session:TenantSession}){
  const[rows,setRows]=useState<PromotionRecord[]>([])
  const[error,setError]=useState('')
  const[discountOpen,setDiscountOpen]=useState(false)
  const[twoOpen,setTwoOpen]=useState(false)
  const[query,setQuery]=useState('')
  const[selectedProducts,setSelectedProducts]=useState<Record<string,boolean>>({})
  const[selectedLabels,setSelectedLabels]=useState<Record<string,boolean>>({})
  const[percent,setPercent]=useState('10')
  const[name,setName]=useState('Oferta')
  const[twoName,setTwoName]=useState('2x1')
  const[twoProduct,setTwoProduct]=useState('')
  const[busy,setBusy]=useState(false)
  const canManage=session.role==='owner'||session.permissions?.can_manage_promotions===true||(session.permissions?.can_manage_promotions==null&&session.role==='supervisor')

  async function load(){try{setRows(await loadPromotionsEnhanced(session));setError('')}catch(e){setError(e instanceof Error?e.message:String(e))}}
  useEffect(()=>{void load()},[session.companyId,session.token])

  const products=useMemo(()=>{const q=query.trim().toLowerCase();return data.products.filter(p=>!q||`${p.name} ${p.barcode||''} ${p.category||''}`.toLowerCase().includes(q)).slice(0,300)},[data.products,query])
  const percentRows=rows.filter(r=>r.type==='percent_discount'&&r.active)
  const labelRows=percentRows.filter(r=>selectedLabels[r.id]).map(promotion=>({promotion,product:data.products.find(p=>p.id===promotion.product_id)})).filter((x):x is {promotion:PromotionRecord;product:Product}=>Boolean(x.product))

  async function apply(e:FormEvent){e.preventDefault();if(!canManage)return;const ids=Object.entries(selectedProducts).filter(([,v])=>v).map(([id])=>id);const value=Number(percent.replace(',','.'));if(!ids.length){setError('Seleccioná al menos un producto.');return}if(!(value>0&&value<100)){setError('El descuento debe ser mayor a 0 y menor a 100.');return}setBusy(true);setError('');try{const updates=await applyPercentagePromotion(session,ids,value,name);updates.forEach(u=>{const p=data.products.find(x=>x.id===u.product_id);if(p)p.price=Number(u.new_price)});await load();setDiscountOpen(false);setSelectedProducts({});setPercent('10');setName('Oferta')}catch(e){setError(e instanceof Error?e.message:String(e))}finally{setBusy(false)}}
  async function remove(row:PromotionRecord){if(!canManage||!window.confirm(`¿Quitar la promoción de ${data.products.find(p=>p.id===row.product_id)?.name||'este producto'} y restaurar el precio anterior?`))return;setBusy(true);try{const result=await removePercentagePromotion(session,row.id);const p=data.products.find(x=>x.id===result.product_id);if(p)p.price=Number(result.restored_price);await load()}catch(e){setError(e instanceof Error?e.message:String(e))}finally{setBusy(false)}}
  async function create2x1(e:FormEvent){e.preventDefault();if(!canManage||!twoProduct)return;setBusy(true);try{await createTwoForOnePromotion(session,twoName,twoProduct);setTwoOpen(false);setTwoProduct('');await load()}catch(e){setError(e instanceof Error?e.message:String(e))}finally{setBusy(false)}}

  return <>
    <div className={core.pageHead}><div><div className={core.eyebrow}>GESTIÓN</div><h1>Promociones</h1><p>Aplicá descuentos reales al precio, imprimí carteles de oferta y administrá 2x1.</p></div>{canManage&&<div className={styles.actions}><button className={core.secondary} onClick={()=>setTwoOpen(true)}>+ Crear 2x1</button><button className={core.primary} onClick={()=>setDiscountOpen(true)}>+ Descuento %</button></div>}</div>
    {error&&<div className={core.error}>{error}</div>}
    {labelRows.length>0&&<div style={{display:'flex',justifyContent:'flex-end',marginBottom:10}}><button className={core.primary} onClick={()=>printOfferLabels(labelRows)}>▦ Imprimir etiquetas de oferta ({labelRows.length})</button></div>}
    <div className={core.table} style={{overflowX:'auto'}}><div style={{minWidth:980}}>
      <div className={`${core.tableRow} ${core.tableHead}`} style={{gridTemplateColumns:'34px 1.2fr 1.5fr .85fr .8fr .8fr .8fr .75fr 85px'}}><span></span><span>Promoción</span><span>Producto</span><span>Tipo</span><span>Antes</span><span>Descuento</span><span>Precio oferta</span><span>Estado</span><span></span></div>
      {rows.map(row=>{const product=data.products.find(p=>p.id===row.product_id);const pct=row.type==='percent_discount';return <div className={core.tableRow} style={{gridTemplateColumns:'34px 1.2fr 1.5fr .85fr .8fr .8fr .8fr .75fr 85px'}} key={row.id}>
        <span>{pct&&row.active?<input type="checkbox" checked={Boolean(selectedLabels[row.id])} onChange={e=>setSelectedLabels(s=>({...s,[row.id]:e.target.checked}))}/>:null}</span><span><b>{row.name}</b></span><span>{product?.name||'—'}</span><span>{pct?'Descuento %':row.type}</span><span>{pct&&row.original_price!=null?<s>{money.format(row.original_price)}</s>:'—'}</span><span>{pct?`${row.discount_percent}%`:'—'}</span><span><b>{pct&&product?money.format(product.price):'—'}</b></span><span><span className={`${core.badge} ${row.active?core.badgeGreen:core.badgeRed}`}>{row.active?'Activa':'Inactiva'}</span></span><span>{pct&&row.active&&canManage?<button className={styles.miniButton} disabled={busy} onClick={()=>void remove(row)}>Quitar</button>:null}</span>
      </div>})}
      {!rows.length&&<div style={{padding:24,textAlign:'center',color:'#75827c'}}>Todavía no hay promociones.</div>}
    </div></div>

    {discountOpen&&<div className={styles.modal} onMouseDown={e=>e.currentTarget===e.target&&setDiscountOpen(false)}><form className={styles.modalCard} onSubmit={apply}><div className={styles.modalHead}><div><span>OFERTA</span><h2>Aplicar descuento a productos</h2></div><button type="button" onClick={()=>setDiscountOpen(false)}>×</button></div>
      <div className={styles.formGrid}><label>Nombre de la promoción<input value={name} onChange={e=>setName(e.target.value)} placeholder="Ej: Oferta de agosto"/></label><label>Descuento (%)<input type="number" min="1" max="99" value={percent} onChange={e=>setPercent(e.target.value)}/></label></div>
      <div style={{display:'flex',gap:7,margin:'10px 0'}}>{[10,20,30].map(x=><button type="button" key={x} className={core.secondary} onClick={()=>setPercent(String(x))}>{x}%</button>)}</div>
      <div className={core.searchSlim} style={{width:'100%',marginBottom:8}}><span>⌕</span><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Buscar producto para agregar a la promoción…"/></div>
      <div style={{border:'1px solid #dfe7e3',borderRadius:12,maxHeight:310,overflow:'auto'}}>{products.map(p=>{const active=percentRows.find(r=>r.product_id===p.id);return <label key={p.id} style={{display:'grid',gridTemplateColumns:'24px 1fr auto',gap:9,alignItems:'center',padding:'9px 11px',borderBottom:'1px solid #edf1ef',cursor:'pointer'}}><input type="checkbox" checked={Boolean(selectedProducts[p.id])} onChange={e=>setSelectedProducts(s=>({...s,[p.id]:e.target.checked}))}/><span><b style={{display:'block',fontSize:10}}>{p.name}</b><small style={{display:'block',color:'#77857e'}}>{p.barcode||'Sin código'} · {p.category||'General'}{active?` · Ya tiene ${active.discount_percent}%`:''}</small></span><strong>{money.format(p.price)}</strong></label>})}</div>
      <div className={styles.modalActions}><button type="button" onClick={()=>setDiscountOpen(false)}>Cancelar</button><button className={styles.save} disabled={busy}>{busy?'Aplicando…':`Aplicar ${percent||0}% de descuento`}</button></div>
    </form></div>}

    {twoOpen&&<div className={styles.modal} onMouseDown={e=>e.currentTarget===e.target&&setTwoOpen(false)}><form className={styles.modalCard} onSubmit={create2x1}><div className={styles.modalHead}><div><span>PROMOCIÓN</span><h2>Nueva promoción 2x1</h2></div><button type="button" onClick={()=>setTwoOpen(false)}>×</button></div><div className={styles.formGrid}><label>Nombre<input value={twoName} onChange={e=>setTwoName(e.target.value)}/></label><label>Producto<select value={twoProduct} onChange={e=>setTwoProduct(e.target.value)}><option value="">Seleccionar…</option>{data.products.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></label></div><div className={styles.modalActions}><button type="button" onClick={()=>setTwoOpen(false)}>Cancelar</button><button className={styles.save} disabled={busy}>Crear promoción</button></div></form></div>}
  </>
}
