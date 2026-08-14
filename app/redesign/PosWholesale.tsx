'use client'

import { useState, type ComponentProps, type CSSProperties } from 'react'
import { openCashRegister } from '@/lib/comercio/api'
import { readTenantSession } from '@/lib/comercio/session'
import { readCachedSalesSettings, saveSalesSettings, type CashMode } from '@/lib/comercio/sales-settings'
import PosEnhanced from './PosEnhanced'

const WHOLESALE_MIN_QTY = 3

type Props = ComponentProps<typeof PosEnhanced>
type PriceableProduct = { price: number; wholesale_price?: number | null }
type CheckoutMode = 'fiscal' | 'internal'

const ui: Record<string, CSSProperties> = {
  backdrop:{position:'fixed',inset:0,zIndex:10050,background:'rgba(14,28,22,.58)',backdropFilter:'blur(5px)',display:'grid',placeItems:'center',padding:18},
  modal:{width:'min(760px,96vw)',background:'#fff',borderRadius:24,boxShadow:'0 30px 90px rgba(0,0,0,.28)',border:'1px solid #dce7e1',overflow:'hidden'},
  head:{padding:'24px 26px 18px',borderBottom:'1px solid #e7eeea',display:'flex',justifyContent:'space-between',gap:18,alignItems:'flex-start'},
  eyebrow:{fontSize:10,fontWeight:950,letterSpacing:'1.6px',color:'#178652',textTransform:'uppercase'},
  title:{fontSize:24,fontWeight:950,margin:'5px 0 5px',color:'#14251d'},
  intro:{fontSize:13,lineHeight:1.5,color:'#52625a',margin:0,maxWidth:590},
  close:{width:38,height:38,borderRadius:12,border:'1px solid #dce5e0',background:'#fff',fontSize:20,cursor:'pointer',fontWeight:800},
  body:{padding:22,display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))',gap:14},
  card:{borderRadius:20,padding:18,display:'flex',flexDirection:'column',gap:10,minHeight:235,boxShadow:'0 8px 24px rgba(24,52,39,.06)'},
  cardTop:{display:'flex',alignItems:'center',justifyContent:'space-between',gap:10},
  badge:{fontSize:10,fontWeight:950,letterSpacing:'.7px',padding:'7px 10px',borderRadius:999},
  cardTitle:{fontSize:20,fontWeight:950,margin:0},
  desc:{fontSize:12,lineHeight:1.52,margin:0},
  bullets:{fontSize:11,lineHeight:1.55,margin:'0 0 2px',paddingLeft:18},
  input:{width:'100%',height:43,borderRadius:11,border:'1px solid #e0c3c1',padding:'0 12px',fontWeight:850,fontSize:13,outline:'none',background:'#fff'},
  action:{marginTop:'auto',height:46,border:0,borderRadius:13,color:'#fff',fontWeight:950,fontSize:12,cursor:'pointer',boxShadow:'0 8px 18px rgba(0,0,0,.12)'},
  foot:{padding:'0 22px 20px',fontSize:11,color:'#607068',lineHeight:1.45},
  error:{margin:'0 22px 18px',padding:'10px 12px',borderRadius:11,background:'#fff0ef',border:'1px solid #f0c3bf',color:'#a3362e',fontWeight:800,fontSize:11},
}

function unitPriceForQty(product: PriceableProduct, qty: number, enabled: boolean) {
  const retail = Number(product.price || 0)
  const wholesale = Number(product.wholesale_price || 0)
  return enabled && qty >= WHOLESALE_MIN_QTY && wholesale > 0 ? wholesale : retail
}

export default function PosWholesale(props: Props) {
  const [cashPrompt,setCashPrompt]=useState(false)
  const [pendingCheckout,setPendingCheckout]=useState<CheckoutMode>('fiscal')
  const [openingAmount,setOpeningAmount]=useState('0')
  const [cashBusy,setCashBusy]=useState(false)
  const [cashError,setCashError]=useState('')

  function getSettings() {
    return readCachedSalesSettings(props.data.company.id)
  }

  function preparePrice(id: string, nextQty: number, enabled: boolean) {
    const line = props.cart.find(item => item.id === id)
    const product = props.data.products.find(item => item.id === id)
    if (!line || !product) return
    line.price = unitPriceForQty(product, nextQty, enabled)
  }

  function addProduct(id: string) {
    const line = props.cart.find(item => item.id === id)
    const product = props.data.products.find(item => item.id === id)
    const settings = getSettings()
    if (line && product) {
      const nextQty = settings.allowNegativeStock
        ? line.qty + 1
        : Math.min(line.qty + 1, Number(product.stock || 0))
      preparePrice(id, nextQty, settings.wholesalePricingEnabled)
    }
    props.addProduct(id)
  }

  function changeQty(id: string, delta: number) {
    const line = props.cart.find(item => item.id === id)
    const product = props.data.products.find(item => item.id === id)
    const settings = getSettings()
    if (line && product) {
      const nextQty = Math.max(
        1,
        settings.allowNegativeStock
          ? line.qty + delta
          : Math.min(Number(product.stock || 0), line.qty + delta),
      )
      preparePrice(id, nextQty, settings.wholesalePricingEnabled)
    }
    props.changeQty(id, delta)
  }

  function applyOpenedRegister(opened: NonNullable<Props['data']['cashRegister']>) {
    if (props.data.cashRegister) Object.assign(props.data.cashRegister, opened)
    else props.data.cashRegister = opened
  }

  async function openRegisterSilently(amount:number) {
    const session=readTenantSession()
    if(!session) throw new Error('Iniciá sesión nuevamente para configurar la caja.')
    if(typeof navigator!=='undefined'&&!navigator.onLine) throw new Error('Necesitás conexión a Internet para abrir la caja por primera vez.')
    const opened=await openCashRegister(session,props.data.cashRegister,amount)
    applyOpenedRegister(opened)
  }

  async function persistMode(mode:CashMode){
    const session=readTenantSession()
    if(!session)throw new Error('Iniciá sesión nuevamente para guardar la configuración de caja.')
    const current=getSettings()
    return saveSalesSettings(session,{...current,cashMode:mode})
  }

  async function checkout(mode:CheckoutMode='fiscal'){
    if(props.data.cashRegister?.status==='open'){
      props.checkout(mode)
      return
    }
    const settings=getSettings()
    if(settings.cashMode==='automatic'){
      setCashBusy(true);setCashError('')
      try{
        await openRegisterSilently(0)
        props.checkout(mode)
      }catch(e){
        setPendingCheckout(mode);setCashPrompt(true);setCashError(e instanceof Error?e.message:String(e))
      }finally{setCashBusy(false)}
      return
    }
    setPendingCheckout(mode)
    setOpeningAmount(String(props.data.cashRegister?.opening_amount||0))
    setCashError('')
    setCashPrompt(true)
  }

  async function chooseAutomatic(){
    if(cashBusy)return
    setCashBusy(true);setCashError('')
    try{
      await persistMode('automatic')
      await openRegisterSilently(0)
      setCashPrompt(false)
      props.checkout(pendingCheckout)
    }catch(e){setCashError(e instanceof Error?e.message:String(e))}
    finally{setCashBusy(false)}
  }

  async function chooseManual(){
    if(cashBusy)return
    setCashBusy(true);setCashError('')
    try{
      await persistMode('manual')
      const amount=Math.max(0,Number(String(openingAmount).replace(',','.'))||0)
      await openRegisterSilently(amount)
      setCashPrompt(false)
      props.checkout(pendingCheckout)
    }catch(e){setCashError(e instanceof Error?e.message:String(e))}
    finally{setCashBusy(false)}
  }

  return <>
    <PosEnhanced {...props} addProduct={addProduct} changeQty={changeQty} checkout={checkout} />
    {cashPrompt&&<div style={ui.backdrop} role="presentation" onMouseDown={e=>{if(e.target===e.currentTarget&&!cashBusy)setCashPrompt(false)}}>
      <section style={ui.modal} role="dialog" aria-modal="true" aria-label="Elegir modo de caja">
        <div style={ui.head}>
          <div><div style={ui.eyebrow}>Primera venta · configuración de caja</div><h2 style={ui.title}>Antes de cobrar, elegí cómo querés usar la caja</h2><p style={ui.intro}>La caja todavía no está abierta. Podés trabajar con apertura y cierre diario, o dejar que Comercio Lleno la gestione automáticamente.</p></div>
          <button type="button" style={ui.close} onClick={()=>!cashBusy&&setCashPrompt(false)} aria-label="Cerrar">×</button>
        </div>
        <div style={ui.body}>
          <article style={{...ui.card,background:'#fff6f5',border:'1.5px solid #efc3bf',color:'#6f2823'}}>
            <div style={ui.cardTop}><span style={{...ui.badge,background:'#ffe3e0',color:'#a9352d'}}>CONTROL DIARIO</span><span style={{fontSize:25}}>◷</span></div>
            <h3 style={ui.cardTitle}>Caja manual</h3>
            <p style={ui.desc}>Obliga a realizar una apertura antes de vender y un cierre al terminar la jornada.</p>
            <ul style={ui.bullets}><li>Ideal para controlar efectivo y diferencias.</li><li>Permite registrar un monto inicial de caja.</li><li>Al día siguiente se vuelve a abrir manualmente.</li></ul>
            <label style={{fontSize:10,fontWeight:900}}>Monto inicial<input style={ui.input} inputMode="decimal" value={openingAmount} onChange={e=>setOpeningAmount(e.target.value)} placeholder="$ 0"/></label>
            <button type="button" style={{...ui.action,background:'#cf3f37'}} disabled={cashBusy} onClick={()=>void chooseManual()}>{cashBusy?'Configurando…':'Abrir caja manual'}</button>
          </article>
          <article style={{...ui.card,background:'#f0fbf5',border:'1.5px solid #addbc3',color:'#164f35'}}>
            <div style={ui.cardTop}><span style={{...ui.badge,background:'#dff5e9',color:'#137447'}}>SIN APERTURA DIARIA</span><span style={{fontSize:25}}>✓</span></div>
            <h3 style={ui.cardTitle}>Caja automática</h3>
            <p style={ui.desc}>No necesitás abrir ni cerrar la caja todos los días. Comercio Lleno la mantiene operativa para que puedas vender directamente.</p>
            <ul style={ui.bullets}><li>Más simple para celular y ventas rápidas.</li><li>Las ventas siguen quedando registradas normalmente.</li><li>Podés volver a modo manual cuando quieras.</li></ul>
            <div style={{marginTop:'auto',padding:'11px 12px',borderRadius:12,background:'#fff',border:'1px solid #cfe8da',fontSize:10,lineHeight:1.45}}><b>Recomendado para uso simple:</b> vendés y facturás sin ocuparte de aperturas ni cierres.</div>
            <button type="button" style={{...ui.action,background:'#158653'}} disabled={cashBusy} onClick={()=>void chooseAutomatic()}>{cashBusy?'Configurando…':'Activar caja automática'}</button>
          </article>
        </div>
        {cashError&&<div style={ui.error}>{cashError}</div>}
        <div style={ui.foot}>Esta elección queda guardada para el comercio. La caja automática también se puede activar o desactivar desde la versión móvil.</div>
      </section>
    </div>}
  </>
}
