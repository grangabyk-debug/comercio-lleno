'use client'

import { useEffect,useState,type ComponentProps } from 'react'
import PromotionsEnhanced from './PromotionsEnhanced'
import { loadSalesSettings,saveSalesSettings } from '@/lib/comercio/sales-settings'
import core from './page.module.css'

type Props=ComponentProps<typeof PromotionsEnhanced>

export default function PromotionsWithCashDiscount(props:Props){
  const[value,setValue]=useState('0')
  const[saving,setSaving]=useState(false)
  const[message,setMessage]=useState('')
  const canManage=props.session.role==='owner'||props.session.permissions?.can_manage_promotions===true||(props.session.permissions?.can_manage_promotions==null&&props.session.role==='supervisor')
  useEffect(()=>{void loadSalesSettings(props.session).then(s=>setValue(String(s.cashDiscountPercent||0))).catch(()=>{})},[props.session.companyId,props.session.token])
  async function save(){
    if(!canManage)return
    const percent=Math.max(0,Math.min(99,Number(String(value).replace(',','.'))||0))
    setSaving(true);setMessage('')
    try{const current=await loadSalesSettings(props.session);const saved=await saveSalesSettings(props.session,{...current,cashDiscountPercent:percent});setValue(String(saved.cashDiscountPercent||0));setMessage(percent>0?`Listo: al elegir Efectivo se aplicará automáticamente ${percent}% de descuento.`:'Descuento automático en efectivo desactivado.')}
    catch(e){setMessage(e instanceof Error?e.message:String(e))}finally{setSaving(false)}
  }
  return <>
    <section className={core.card} style={{marginBottom:16,padding:18}}>
      <div style={{display:'flex',gap:18,alignItems:'center',justifyContent:'space-between',flexWrap:'wrap'}}>
        <div style={{maxWidth:650}}><div className={core.eyebrow}>PAGO EN EFECTIVO</div><h2 style={{margin:'4px 0 6px',fontSize:18}}>Descuento automático en efectivo</h2><p style={{margin:0,fontSize:12,color:'#68766f',lineHeight:1.5}}>Definí un porcentaje y, cuando en Nueva venta se elija <b>Efectivo</b>, Comercio Lleno lo aplicará automáticamente sobre el total. Si elegís otro medio de pago, el descuento automático se quita.</p></div>
        <div style={{display:'flex',gap:8,alignItems:'end'}}><label style={{fontSize:11,fontWeight:800}}>Descuento (%)<input style={{display:'block',width:110,height:42,marginTop:5,border:'1px solid #dce5e0',borderRadius:10,padding:'0 11px',fontWeight:850}} type="number" min="0" max="99" step="0.1" value={value} disabled={!canManage||saving} onChange={e=>setValue(e.target.value)}/></label><button type="button" className={core.primary} disabled={!canManage||saving} onClick={()=>void save()}>{saving?'Guardando…':'Guardar'}</button></div>
      </div>
      {message&&<div style={{marginTop:10,fontSize:11,fontWeight:750}}>{message}</div>}
    </section>
    <PromotionsEnhanced {...props}/>
  </>
}
