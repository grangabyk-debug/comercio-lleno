'use client'

import { FormEvent, useEffect, useMemo, useRef, useState } from 'react'
import core from './page.module.css'
import styles from './management.module.css'
import { createProduct, loadSuppliers, updateProduct, type Supplier } from '@/lib/comercio/api'
import { loadPromotionsEnhanced, type PromotionRecord } from '@/lib/comercio/promotion-api'
import type { CommerceSnapshot, Product, TenantSession } from '@/lib/comercio/types'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://wtcntclzcubkbtcsqkzc.supabase.co'
const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? 'sb_publishable_02U2KDLDTR42KxdcFHtfYw_IDM00Deb'
const money = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 })
type SortKey = 'name' | 'cost' | 'price' | 'wholesale_price' | 'stock'
type SortDir = 'asc' | 'desc'
type NumberKey = 'cost' | 'price' | 'wholesale_price' | 'stock' | 'min_stock' | 'target_stock'

function n(v: unknown) { return Number(v || 0) }
function Head({ children }: { children?: React.ReactNode }) {
  return <div className={core.pageHead}><div><div className={core.eyebrow}>CATÁLOGO</div><h1>Productos y stock</h1><p>Alta, edición rápida, costos, precios, stock, importación, exportación y etiquetas.</p></div>{children}</div>
}
function sortGlyph(active: boolean, dir: SortDir) { return active ? (dir === 'asc' ? ' ↑' : ' ↓') : ' ↕' }
function numericString(v: unknown) { return String(Number(v || 0)) }
function numericValue(v: string) { const parsed = Number(String(v || '').replace(',','.')); return Number.isFinite(parsed) ? Math.max(0, parsed) : 0 }

async function fileResponse(response: Response, fallback: string) {
  if (!response.ok) {
    const data = await response.json().catch(() => ({}))
    throw new Error(data?.error || `No se pudo generar ${fallback}.`)
  }
  const blob = await response.blob()
  const cd = response.headers.get('content-disposition') || ''
  const match = cd.match(/filename="?([^";]+)"?/i)
  const filename = match?.[1] || fallback
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = filename; document.body.appendChild(a); a.click(); a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 5000)
}

export default function ProductsInventory({ data, session, refresh, message }: { data: CommerceSnapshot; session: TenantSession; refresh: () => Promise<void>; message: (m: string) => void }) {
  const [q, setQ] = useState('')
  const [creating, setCreating] = useState(false)
  const [selected, setSelected] = useState<Record<string, number>>({})
  const [sortKey, setSortKey] = useState<SortKey>('name')
  const [sortDir, setSortDir] = useState<SortDir>('asc')
  const [importOpen, setImportOpen] = useState(false)
  const [exportOpen, setExportOpen] = useState(false)
  const [busySheet, setBusySheet] = useState(false)
  const [importFile, setImportFile] = useState<File | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draft, setDraft] = useState<Product | null>(null)
  const [numbers, setNumbers] = useState<Record<NumberKey,string>>({cost:'0',price:'0',wholesale_price:'0',stock:'0',min_stock:'0',target_stock:'0'})
  const [dirty, setDirty] = useState(false)
  const [savingInline, setSavingInline] = useState(false)
  const [savedInline, setSavedInline] = useState(false)
  const [promotions, setPromotions] = useState<PromotionRecord[]>([])
  const [bulkOpen, setBulkOpen] = useState(false)
  const [bulkTarget, setBulkTarget] = useState<'retail'|'wholesale'>('retail')
  const [bulkPercent, setBulkPercent] = useState('')
  const [bulkBusy, setBulkBusy] = useState(false)
  const [bulkSaved, setBulkSaved] = useState(false)
  const fileRef = useRef<HTMLInputElement | null>(null)

  const canEdit = session.role === 'owner' || session.permissions?.can_edit_products === true || (session.permissions?.can_edit_products == null && session.permissions?.can_manage_stock !== false)
  const canImportExport = session.role === 'owner' || session.permissions?.can_import_export_products === true || (session.permissions?.can_import_export_products == null && session.permissions?.can_manage_stock !== false)

  async function reloadPromotions() {
    try { setPromotions(await loadPromotionsEnhanced(session)) } catch { setPromotions([]) }
  }
  useEffect(() => { void reloadPromotions() }, [session.companyId, session.token])

  const promoByProduct = useMemo(() => {
    const map = new Map<string, PromotionRecord>()
    promotions.filter(p => p.active && p.type === 'percent_discount' && p.product_id).forEach(p => map.set(String(p.product_id), p))
    return map
  }, [promotions])

  const rows = useMemo(() => {
    const filtered = data.products.filter(p => `${p.name} ${p.barcode || ''} ${p.category || ''}`.toLowerCase().includes(q.toLowerCase()))
    return [...filtered].sort((a, b) => {
      let cmp = 0
      if (sortKey === 'name') cmp = a.name.localeCompare(b.name, 'es', { sensitivity: 'base' })
      else cmp = n(a[sortKey]) - n(b[sortKey])
      return sortDir === 'asc' ? cmp : -cmp
    }).slice(0, 5000)
  }, [data.products, q, sortKey, sortDir])

  const selectedRows = data.products.filter(p => (selected[p.id] || 0) > 0).map(p => ({ product: p, qty: selected[p.id] }))
  const selectedIds = selectedRows.map(x => x.product.id)

  function toggle(id: string, checked: boolean) { setSelected(s => ({ ...s, [id]: checked ? (s[id] || 1) : 0 })) }
  function sortBy(key: SortKey) { if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc'); else { setSortKey(key); setSortDir('asc') } }
  function SortHeader({ field, children }: { field: SortKey; children: React.ReactNode }) {
    return <button type="button" onClick={() => sortBy(field)} style={{border:0,background:'transparent',font:'inherit',fontWeight:800,padding:0,cursor:'pointer',color:'inherit',textAlign:'left'}}>{children}{sortGlyph(sortKey === field, sortDir)}</button>
  }

  function loadDraft(product: Product) {
    setEditingId(product.id)
    setDraft({...product})
    setNumbers({
      cost:numericString(product.cost), price:numericString(product.price), wholesale_price:numericString(product.wholesale_price),
      stock:numericString(product.stock), min_stock:numericString(product.min_stock), target_stock:numericString(product.target_stock),
    })
    setDirty(false); setSavedInline(false)
    window.setTimeout(() => document.querySelector<HTMLInputElement>(`[data-product-name="${product.id}"]`)?.focus(), 40)
  }
  function buildDraft(): Product | null {
    if (!draft) return null
    return {...draft,
      cost:numericValue(numbers.cost), price:numericValue(numbers.price), wholesale_price:numericValue(numbers.wholesale_price),
      stock:numericValue(numbers.stock), min_stock:numericValue(numbers.min_stock), target_stock:numericValue(numbers.target_stock),
    }
  }
  async function saveCurrent(silent=false) {
    const next = buildDraft()
    if (!next || !dirty || savingInline) return true
    setSavingInline(true); setSavedInline(false)
    try {
      await updateProduct(session,next)
      setDirty(false); setSavedInline(true)
      if (!silent) message('Producto actualizado.')
      window.setTimeout(()=>setSavedInline(false),2200)
      return true
    } catch(e) { message(e instanceof Error?e.message:String(e)); return false }
    finally { setSavingInline(false) }
  }
  async function chooseProduct(product: Product) {
    if (!canEdit) { message('Tu usuario no tiene permiso para editar productos.'); return }
    if (editingId === product.id) return
    if (dirty) { const ok=await saveCurrent(true); if(!ok)return }
    loadDraft(product)
  }
  function patchText(patch: Partial<Product>) { if(!draft)return; setDraft({...draft,...patch});setDirty(true);setSavedInline(false) }
  function patchNumber(key:NumberKey,value:string){setNumbers(v=>({...v,[key]:value}));setDirty(true);setSavedInline(false)}
  function cleanZero(key:NumberKey){setNumbers(v=>({...v,[key]:v[key]==='0'?'':v[key]}))}

  async function bulkIncrease(){
    const percent=Number(bulkPercent.replace(',','.'))
    if(!Number.isFinite(percent)||percent<=0){message('Ingresá un porcentaje mayor a 0.');return}
    if(!window.confirm(`¿Aplicar un aumento del ${percent}% al precio ${bulkTarget==='retail'?'minorista':'mayorista'} de todos los productos activos?`))return
    setBulkBusy(true);setBulkSaved(false)
    try{
      if(dirty)await saveCurrent(true)
      const r=await fetch(`${SUPABASE_URL}/rest/v1/rpc/bulk_increase_product_prices`,{method:'POST',headers:{apikey:PUBLISHABLE_KEY,Authorization:`Bearer ${session.token}`,'Content-Type':'application/json'},body:JSON.stringify({p_target:bulkTarget,p_percent:percent}),cache:'no-store'})
      const result=await r.json().catch(()=>null)
      if(!r.ok)throw new Error(result?.message||'No se pudo aplicar el aumento masivo.')
      await refresh();await reloadPromotions();setEditingId(null);setDraft(null);setBulkSaved(true)
      message(`${result?.updated ?? 'Los'} productos fueron actualizados ${percent}%.`)
      window.setTimeout(()=>{setBulkOpen(false);setBulkSaved(false);setBulkPercent('')},1800)
    }catch(e){message(e instanceof Error?e.message:String(e))}finally{setBulkBusy(false)}
  }

  async function downloadModel() {
    setBusySheet(true)
    try { await fileResponse(await fetch('/api/redesign/products-sheet', { headers: { Authorization: `Bearer ${session.token}` } }), 'modelo-productos-comercio-lleno.xlsx') }
    catch (e) { message(e instanceof Error ? e.message : String(e)) } finally { setBusySheet(false) }
  }
  async function exportProducts(ids?: string[]) {
    setBusySheet(true)
    try {
      const response = await fetch('/api/redesign/products-sheet', {method:'POST',headers:{Authorization:`Bearer ${session.token}`,'Content-Type':'application/json'},body:JSON.stringify({action:'export',ids:ids||[]})})
      await fileResponse(response,ids?.length?'productos-seleccionados.xlsx':'productos-comercio-lleno.xlsx');setExportOpen(false)
    } catch(e){message(e instanceof Error?e.message:String(e))} finally{setBusySheet(false)}
  }
  async function importProducts() {
    if (!importFile) { message('Seleccioná un archivo Excel para importar.'); return }
    setBusySheet(true)
    try {
      const form=new FormData();form.append('action','import');form.append('file',importFile)
      const response=await fetch('/api/redesign/products-sheet',{method:'POST',headers:{Authorization:`Bearer ${session.token}`},body:form});const result=await response.json().catch(()=>({}))
      if(!response.ok||!result?.ok)throw new Error(result?.error||'No se pudo importar el archivo.')
      await refresh();setImportOpen(false);setImportFile(null);if(fileRef.current)fileRef.current.value='';message(`${result.processed} productos procesados correctamente.`)
    }catch(e){message(e instanceof Error?e.message:String(e))}finally{setBusySheet(false)}
  }

  const editMargin = editingId && draft ? (numericValue(numbers.price) ? ((numericValue(numbers.price)-numericValue(numbers.cost))/numericValue(numbers.price))*100 : 0) : 0
  const numInput=(key:NumberKey,promoLocked=false)=><input className={`${styles.inlineNumber} ${promoLocked?styles.promoInputLocked:''}`} disabled={promoLocked} type="number" min="0" step={key==='stock'||key==='min_stock'||key==='target_stock'?'1':'0.01'} value={numbers[key]} onFocus={()=>cleanZero(key)} onChange={e=>patchNumber(key,e.target.value)} />

  return <>
    <Head><div className={styles.actions} style={{flexWrap:'wrap'}}>
      <button className={core.secondary} disabled={!canImportExport} onClick={()=>setImportOpen(true)}>↑ Importar</button>
      <button className={core.secondary} disabled={!canImportExport} onClick={()=>setExportOpen(true)}>↓ Exportar</button>
      <button className={core.secondary} disabled={!selectedRows.length} onClick={()=>printLabels(selectedRows)}>▦ Imprimir etiquetas</button>
      <button className={core.secondary} disabled={!canEdit} onClick={()=>setBulkOpen(true)}>↗ Aumento masivo</button>
      <button className={core.primary} disabled={!canEdit} onClick={()=>setCreating(true)}>+ Agregar producto</button>
    </div></Head>

    <div className={core.tableTools} style={{display:'flex',gap:8,alignItems:'center'}}>
      <div className={core.searchSlim} style={{flex:1}}><span>⌕</span><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Buscar producto, código o categoría…"/></div>
      <button className={core.primary} style={{whiteSpace:'nowrap'}} disabled={!dirty||savingInline} onClick={()=>void saveCurrent()}>{savingInline?'Guardando…':savedInline?'✓ Guardado':'Guardar cambios'}</button>
    </div>
    {editingId&&<div className={styles.editingToolbar}><b>Editando un producto</b><span>Los cambios se guardan automáticamente cuando pasás a otro producto. También podés usar “Guardar cambios”.</span></div>}

    <div className={`${core.table} ${styles.productTable}`}>
      <div className={`${core.tableRow} ${core.tableHead} ${styles.productRow}`}><span></span><span><SortHeader field="name">Producto</SortHeader></span><span>Código</span><span>Categoría</span><span><SortHeader field="cost">Costo</SortHeader></span><span><SortHeader field="price">Minorista</SortHeader></span><span><SortHeader field="wholesale_price">Mayorista</SortHeader></span><span>Margen</span><span><SortHeader field="stock">Stock</SortHeader></span><span>Mín.</span><span>Objetivo</span></div>
      {rows.map(p=>{
        const editing=editingId===p.id&&draft;const promo=promoByProduct.get(p.id);const margin=editing?editMargin:(p.price?((p.price-n(p.cost))/p.price)*100:0)
        return <div className={`${core.tableRow} ${styles.productRow} ${editing?styles.editModeRow:styles.clickableProductRow}`} key={p.id} onClick={()=>{if(!editing)void chooseProduct(p)}} onBlurCapture={e=>{if(editing&&dirty&&!e.currentTarget.contains(e.relatedTarget as Node|null))void saveCurrent(true)}}>
          <span onClick={e=>e.stopPropagation()}><input type="checkbox" checked={(selected[p.id]||0)>0} onChange={e=>toggle(p.id,e.target.checked)}/></span>
          <span>{editing?<><input data-product-name={p.id} className={styles.inlineInput} value={draft!.name} onChange={e=>patchText({name:e.target.value})}/><select className={styles.inlineSubInput} value={draft!.unit||'unidad'} onChange={e=>patchText({unit:e.target.value})}><option>unidad</option><option>kg</option><option>litro</option><option>pack</option><option>caja</option></select></>:<><b>{p.name} {promo&&<em className={styles.promoBadge}>% {Number(promo.discount_percent||0)}</em>}</b><small>{p.unit||'unidad'}{promo?' · EN PROMOCIÓN':''}</small></>}</span>
          <span>{editing?<input className={styles.inlineInput} value={draft!.barcode||''} onChange={e=>patchText({barcode:e.target.value})}/>:p.barcode||'—'}</span>
          <span>{editing?<input className={styles.inlineInput} value={draft!.category||''} onChange={e=>patchText({category:e.target.value})}/>:p.category||'General'}</span>
          <span>{editing?numInput('cost'):money.format(n(p.cost))}</span>
          <span>{editing?numInput('price',Boolean(promo)):<b className={promo?styles.promoPrice:''}>{money.format(p.price)}{promo&&<small className={styles.promoSaving}> oferta</small>}</b>}</span>
          <span>{editing?numInput('wholesale_price'):money.format(n(p.wholesale_price))}</span>
          <span className={margin>=25?styles.good:styles.warn}>{margin.toFixed(1)}%</span>
          <span>{editing?numInput('stock'):p.stock}</span><span>{editing?numInput('min_stock'):n(p.min_stock)}</span><span>{editing?numInput('target_stock'):n(p.target_stock)}</span>
        </div>
      })}
    </div>

    {selectedRows.length>0&&<div className={styles.labelBar}><b>Etiquetas / selección</b><span>{selectedRows.length} productos seleccionados</span><div className={styles.labelQtys}>{selectedRows.map(x=><label key={x.product.id}>{x.product.name}<input type="number" min="1" max="99" value={x.qty} onChange={e=>setSelected(s=>({...s,[x.product.id]:Math.max(1,Math.min(99,Number(e.target.value)||1))}))}/></label>)}</div><button onClick={()=>printLabels(selectedRows)}>Imprimir seleccionadas</button></div>}
    {creating&&<ProductModal product={null} session={session} close={()=>setCreating(false)} saved={async()=>{setCreating(false);await refresh();message('Producto guardado.')}}/>}

    {bulkOpen&&<div className={styles.modal} onMouseDown={e=>e.currentTarget===e.target&&setBulkOpen(false)}><div className={styles.modalCard}><div className={styles.modalHead}><div><span>PRECIOS</span><h2>Aumento masivo</h2></div><button onClick={()=>setBulkOpen(false)}>×</button></div><p>Actualiza todos los productos activos del comercio de una sola vez. Las promociones vigentes se recalculan sin perder su porcentaje.</p><div className={styles.formGrid}><label>Precio a aumentar<select value={bulkTarget} onChange={e=>setBulkTarget(e.target.value as 'retail'|'wholesale')}><option value="retail">Precio minorista</option><option value="wholesale">Precio mayorista</option></select></label><label>Porcentaje %<input autoFocus inputMode="decimal" value={bulkPercent} onChange={e=>setBulkPercent(e.target.value)} placeholder="Ej: 10"/></label></div><div className={styles.modalActions}><button onClick={()=>setBulkOpen(false)}>Cancelar</button><button className={styles.save} disabled={bulkBusy||!bulkPercent.trim()} onClick={()=>void bulkIncrease()}>{bulkBusy?'Actualizando…':bulkSaved?'✓ Actualizado':'✓ Aplicar aumento'}</button></div></div></div>}

    {importOpen&&<div className={styles.modal} onMouseDown={e=>e.currentTarget===e.target&&setImportOpen(false)}><div className={styles.modalCard}><div className={styles.modalHead}><div><span>IMPORTACIÓN</span><h2>Importar productos y stock</h2></div><button onClick={()=>setImportOpen(false)}>×</button></div><p>Descargá primero el formato modelo. Incluye las columnas del sistema y listas de categorías, unidades y proveedores.</p><div style={{display:'flex',gap:10,flexWrap:'wrap',margin:'14px 0'}}><button className={core.secondary} disabled={busySheet} onClick={downloadModel}>↓ Descargar formato modelo</button></div><label style={{display:'grid',gap:8,fontWeight:700}}>Archivo Excel (.xlsx)<input ref={fileRef} type="file" accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" onChange={e=>setImportFile(e.target.files?.[0]||null)}/></label>{importFile&&<small style={{display:'block',marginTop:8}}>{importFile.name} · {(importFile.size/1024).toFixed(0)} KB</small>}<div className={styles.modalActions}><button onClick={()=>setImportOpen(false)}>Cancelar</button><button className={styles.save} disabled={busySheet||!importFile} onClick={()=>void importProducts()}>{busySheet?'Procesando…':'Importar al stock'}</button></div></div></div>}
    {exportOpen&&<div className={styles.modal} onMouseDown={e=>e.currentTarget===e.target&&setExportOpen(false)}><div className={styles.modalCard}><div className={styles.modalHead}><div><span>EXPORTACIÓN</span><h2>Exportar productos</h2></div><button onClick={()=>setExportOpen(false)}>×</button></div><p>Podés descargar todo el catálogo o solamente los productos marcados.</p><div className={styles.modalActions}><button disabled={busySheet} onClick={()=>void exportProducts()}>Exportar todos</button><button className={styles.save} disabled={busySheet||!selectedIds.length} onClick={()=>void exportProducts(selectedIds)}>Exportar seleccionados ({selectedIds.length})</button></div></div></div>}
  </>
}

function ProductModal({ product, session, close, saved }: { product: Product | null; session: TenantSession; close: () => void; saved: () => Promise<void> }) {
  const [suppliers,setSuppliers]=useState<Supplier[]>([]),[name,setName]=useState(product?.name||''),[barcode,setBarcode]=useState(product?.barcode||''),[category,setCategory]=useState(product?.category||'General'),[unit,setUnit]=useState(product?.unit||'unidad'),[supplierId,setSupplierId]=useState(product?.supplier_id||'')
  const [numbers,setNumbers]=useState<Record<NumberKey,string>>({cost:'',price:'',wholesale_price:'',stock:'',min_stock:'',target_stock:''}),[busy,setBusy]=useState(false),[error,setError]=useState('')
  useEffect(()=>{loadSuppliers(session).then(setSuppliers).catch(()=>{})},[session])
  async function submit(e:FormEvent){e.preventDefault();if(!name.trim())return;setBusy(true);setError('');const d:Product={id:product?.id||'',name:name.trim(),barcode,category:category||'General',unit,supplier_id:supplierId||null,cost:numericValue(numbers.cost),price:numericValue(numbers.price),wholesale_price:numericValue(numbers.wholesale_price),stock:numericValue(numbers.stock),min_stock:numericValue(numbers.min_stock),target_stock:numericValue(numbers.target_stock),active:true};try{if(product)await updateProduct(session,d);else await createProduct(session,d);await saved()}catch(e){setError(e instanceof Error?e.message:String(e));setBusy(false)}}
  const input=(key:NumberKey,label:string)=><label>{label}<input type="number" min="0" step="0.01" value={numbers[key]} onChange={e=>setNumbers(v=>({...v,[key]:e.target.value}))}/></label>
  return <div className={styles.modal} onMouseDown={e=>e.currentTarget===e.target&&close()}><form className={styles.modalCard} onSubmit={submit}><div className={styles.modalHead}><div><span>PRODUCTO</span><h2>Agregar producto</h2></div><button type="button" onClick={close}>×</button></div><div className={styles.formGrid}><label>Producto<input value={name} onChange={e=>setName(e.target.value)}/></label><label>Código de barras<input value={barcode} onChange={e=>setBarcode(e.target.value)}/></label><label>Categoría<input value={category} onChange={e=>setCategory(e.target.value)}/></label><label>Unidad<select value={unit} onChange={e=>setUnit(e.target.value)}><option>unidad</option><option>kg</option><option>litro</option><option>pack</option><option>caja</option></select></label>{input('cost','Costo')}{input('price','Precio minorista')}{input('wholesale_price','Precio mayorista')}{input('stock','Stock')}{input('min_stock','Stock mínimo')}{input('target_stock','Stock objetivo')}<label className={styles.wide}>Proveedor<select value={supplierId} onChange={e=>setSupplierId(e.target.value)}><option value="">Sin proveedor</option>{suppliers.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></label></div>{error&&<div className={styles.formError}>{error}</div>}<div className={styles.modalActions}><button type="button" onClick={close}>Cancelar</button><button className={styles.save} disabled={busy}>{busy?'Guardando…':'Guardar cambios'}</button></div></form></div>
}

function checksumEAN13(value:string){const d=value.slice(0,12).split('').map(Number);let sum=0;for(let i=0;i<12;i++)sum+=d[i]*(i%2?3:1);return String((10-sum%10)%10)}
function eanBits(value:string){let s=value.replace(/\D/g,'');if(s.length===12)s+=checksumEAN13(s);if(s.length!==13)return null;const L=['0001101','0011001','0010011','0111101','0100011','0110001','0101111','0111011','0110111','0001011'],G=['0100111','0110011','0011011','0100001','0011101','0111001','0000101','0010001','0001001','0010111'],R=['1110010','1100110','1101100','1000010','1011100','1001110','1010000','1000100','1001000','1110100'],P=['LLLLLL','LLGLGG','LLGGLG','LLGGGL','LGLLGG','LGGLLG','LGGGLL','LGLGLG','LGLGGL','LGGLGL'];let bits='101',parity=P[Number(s[0])];for(let i=1;i<=6;i++)bits+=parity[i-1]==='L'?L[Number(s[i])]:G[Number(s[i])];bits+='01010';for(let i=7;i<=12;i++)bits+=R[Number(s[i])];bits+='101';return{s,bits}}
function esc(s:string){return s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]||c))}
function printLabels(items:Array<{product:Product;qty:number}>){const labels:string[]=[];const date=new Date().toLocaleDateString('es-AR');items.forEach(({product:p,qty})=>{for(let q=0;q<Math.max(1,Math.min(99,qty));q++){const code=eanBits(String(p.barcode||''));const svg=code?`<svg viewBox="0 0 ${code.bits.length} 52" preserveAspectRatio="none"><g>${code.bits.split('').map((b,i)=>b==='1'?`<rect x="${i}" y="0" width="1" height="42"/>`:'').join('')}</g><text x="0" y="51" font-size="7">${code.s}</text></svg>`:'';labels.push(`<article class="label"><div class="name">${esc(p.name)}</div><div class="price">${money.format(p.price)}</div>${svg?`<div class="barcode">${svg}</div>`:'<div class="nocode">SIN CÓDIGO</div>'}<div class="date">${date}</div></article>`)}});const sheets:string[]=[];for(let i=0;i<labels.length;i+=21)sheets.push(`<main class="sheet">${labels.slice(i,i+21).join('')}</main>`);const w=window.open('','_blank','width=1000,height=800');if(!w){alert('Permití ventanas emergentes para imprimir etiquetas.');return}w.document.write(`<!doctype html><html><head><title>Etiquetas</title><style>@page{size:A4 portrait;margin:0}*{box-sizing:border-box}body{margin:0;font-family:Arial}.sheet{width:210mm;height:297mm;display:grid;grid-template-columns:repeat(3,70mm);grid-template-rows:repeat(7,42.42mm);break-after:page}.label{width:70mm;height:42.42mm;border:1px dashed #aaa;padding:3mm 4mm;display:flex;flex-direction:column;align-items:center;overflow:hidden}.name{font-size:10px;font-weight:700;text-transform:uppercase;text-align:center;height:9mm}.price{font-size:22px;font-weight:800}.barcode{width:50mm;height:14mm}.barcode svg{width:50mm;height:14mm}.nocode{height:14mm;display:grid;place-items:center;font-size:10px}.date{font-size:7px;align-self:flex-start}</style></head><body>${sheets.join('')}<script>onload=()=>setTimeout(()=>print(),250)<\/script></body></html>`);w.document.close()}
