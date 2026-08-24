'use client'

import { useEffect, useRef, useState } from 'react'
import { loadCommerceSnapshot } from '@/lib/comercio/api'
import { loadSalesSettings, readCachedSalesSettings, type CashMode } from '@/lib/comercio/sales-settings'
import { readTenantSession } from '@/lib/comercio/session'
import type { Product, TenantSession } from '@/lib/comercio/types'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://wtcntclzcubkbtcsqkzc.supabase.co'
const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? 'sb_publishable_02U2KDLDTR42KxdcFHtfYw_IDM00Deb'

type BranchRow = { id:string; name?:string|null; is_primary?:boolean }

function cleanText(node: Element | null) {
  return (node?.textContent || '').replace(/\s+/g, ' ').trim()
}
function normalize(value:string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().toLowerCase()
}
function numberFrom(value:string) {
  const cleaned=value.replace(/[^0-9,.-]/g,'').replace(/\./g,'').replace(',','.')
  return Number(cleaned)||0
}
function localProductKey(companyId:string){return `cl_mobile_preview_products_${companyId}`}
function effectiveCashMode(mode:CashMode):'manual'|'automatic'{return mode==='manual'?'manual':'automatic'}

async function rest<T>(session:TenantSession,path:string,init:RequestInit={}){
  const response=await fetch(`${SUPABASE_URL}/rest/v1/${path}`,{
    ...init,
    headers:{
      apikey:PUBLISHABLE_KEY,
      Authorization:`Bearer ${session.token}`,
      'Content-Type':'application/json',
      ...(init.headers||{}),
    },
    cache:'no-store',
  })
  const text=await response.text()
  let data:unknown=null
  try{data=text?JSON.parse(text):null}catch{data=text}
  if(!response.ok){
    const message=typeof data==='object'&&data&&'message' in data?String((data as {message?:unknown}).message):text||`HTTP ${response.status}`
    throw new Error(message)
  }
  return data as T
}

async function resolveBranch(session:TenantSession){
  const rows=await rest<BranchRow[]>(session,`branches?select=id,name,is_primary&company_id=eq.${encodeURIComponent(session.companyId)}&active=eq.true&order=is_primary.desc,created_at.asc`)
  const stored=typeof window!=='undefined'?localStorage.getItem('cl_branch_id')||'':''
  const selected=rows.find(row=>row.id===stored)||rows.find(row=>row.is_primary)||rows[0]
  if(!selected?.id)throw new Error('No encontramos una sucursal activa para guardar el producto.')
  if(typeof window!=='undefined'){
    localStorage.setItem('cl_branch_id',selected.id)
    if(selected.name)localStorage.setItem('cl_branch_name',selected.name)
  }
  return selected.id
}

async function createCloudProduct(session:TenantSession,branchId:string,input:{name:string;price:number;category:string;stock:number}){
  const rows=await rest<Product[]>(session,'products',{
    method:'POST',
    headers:{Prefer:'return=representation'},
    body:JSON.stringify({
      company_id:session.companyId,
      branch_id:branchId,
      name:input.name.trim(),
      barcode:'',
      category:input.category||'General',
      unit:'unidad',
      cost:0,
      price:Number(input.price||0),
      wholesale_price:0,
      stock:Number(input.stock||0),
      min_stock:0,
      target_stock:0,
      supplier_id:null,
      active:true,
      updated_at:new Date().toISOString(),
    }),
  })
  if(!rows?.[0])throw new Error('El producto no quedó confirmado en la base de datos.')
  return rows[0]
}

async function updateCloudProduct(session:TenantSession,id:string,input:{name:string;price:number;category:string;stock:number}){
  await rest(session,`products?id=eq.${encodeURIComponent(id)}&company_id=eq.${encodeURIComponent(session.companyId)}`,{
    method:'PATCH',
    headers:{Prefer:'return=minimal'},
    body:JSON.stringify({
      name:input.name.trim(),
      category:input.category||'General',
      price:Number(input.price||0),
      stock:Number(input.stock||0),
      updated_at:new Date().toISOString(),
    }),
  })
}

function readPendingProducts(companyId:string):Product[]{
  try{
    const rows=JSON.parse(localStorage.getItem(localProductKey(companyId))||'[]')
    return Array.isArray(rows)?rows:[]
  }catch{return[]}
}
function writePendingProducts(companyId:string,rows:Product[]){
  localStorage.setItem(localProductKey(companyId),JSON.stringify(rows))
}

export default function MobileReliabilityFix(){
  const[message,setMessage]=useState('')
  const busyProduct=useRef(false)
  const snapshotRef=useRef<Awaited<ReturnType<typeof loadCommerceSnapshot>>|null>(null)
  const branchRef=useRef('')
  const editingIdRef=useRef('')
  const editingNameRef=useRef('')
  const cashOpenRef=useRef<boolean|null>(null)
  const cashModeRef=useRef<'manual'|'automatic'>('automatic')

  useEffect(()=>{
    const session=readTenantSession()
    if(!session)return
    let disposed=false
    let frame=0
    const timers=new Set<number>()

    const later=(fn:()=>void,ms:number)=>{
      const id=window.setTimeout(()=>{timers.delete(id);if(!disposed)fn()},ms)
      timers.add(id)
      return id
    }
    const show=(value:string,ms=2600)=>{
      if(disposed)return
      setMessage(value)
      later(()=>setMessage(''),ms)
    }
    const ensureSnapshot=async()=>{
      const snapshot=await loadCommerceSnapshot(session)
      snapshotRef.current=snapshot
      cashOpenRef.current=snapshot.cashRegister?.status==='open'
      return snapshot
    }
    const ensureBranch=async()=>{
      if(branchRef.current)return branchRef.current
      branchRef.current=await resolveBranch(session)
      return branchRef.current
    }

    async function migratePendingProducts(){
      const pending=readPendingProducts(session.companyId)
      if(!pending.length)return
      try{
        const snapshot=await ensureSnapshot()
        const branchId=await ensureBranch()
        const kept:Product[]=[]
        let migrated=0
        for(const product of pending){
          try{
            const name=String(product.name||'').trim()
            const price=Number(product.price||0)
            if(!name||price<=0){kept.push(product);continue}
            const category=String(product.category||'General')||'General'
            const stock=Math.max(0,Number(product.stock||0))
            const byId=snapshot.products.find(row=>row.id===product.id)
            if(byId&&!String(product.id).startsWith('preview-')){
              await updateCloudProduct(session,product.id,{name,price,category,stock})
              Object.assign(byId,{name,price,category,stock})
              migrated+=1
              continue
            }
            if(String(product.id).startsWith('preview-')){
              const duplicate=snapshot.products.find(row=>normalize(row.name)===normalize(name)&&Math.abs(Number(row.price||0)-price)<0.01&&normalize(String(row.category||'General'))===normalize(category))
              if(!duplicate){
                const created=await createCloudProduct(session,branchId,{name,price,category,stock})
                snapshot.products.push(created)
              }
              migrated+=1
              continue
            }
            kept.push(product)
          }catch{kept.push(product)}
        }
        if(migrated){
          writePendingProducts(session.companyId,kept)
          show(`${migrated} producto${migrated===1?'':'s'} pendiente${migrated===1?'':'s'} quedó${migrated===1?'':'aron'} guardado${migrated===1?'':'s'} en el comercio.`,3200)
          later(()=>window.location.reload(),900)
        }
      }catch{}
    }

    function rememberEditedProduct(target:EventTarget|null){
      const row=(target as Element|null)?.closest?.('button[class*="catalogRow"]') as HTMLButtonElement|null
      if(!row)return
      const name=cleanText(row.querySelector('b'))
      const price=numberFrom(cleanText(row.querySelector('strong')))
      editingNameRef.current=name
      const snapshot=snapshotRef.current
      const match=snapshot?.products.find(product=>normalize(product.name)===normalize(name)&&Math.abs(Number(product.price||0)-price)<0.01)||snapshot?.products.find(product=>normalize(product.name)===normalize(name))
      editingIdRef.current=match?.id||''
    }

    async function saveProductForm(event:Event){
      const form=event.target as HTMLFormElement|null
      if(!form?.matches?.('form[class*="modalCard"]'))return
      const title=cleanText(form.querySelector('h3'))
      if(title!=='Crear producto'&&title!=='Editar producto')return
      event.preventDefault()
      event.stopPropagation()
      ;(event as Event&{stopImmediatePropagation?:()=>void}).stopImmediatePropagation?.()
      if(busyProduct.current)return

      const inputs=Array.from(form.querySelectorAll('input')) as HTMLInputElement[]
      const name=(inputs[0]?.value||'').trim()
      const price=Math.max(0,Number(String(inputs[1]?.value||'').replace(',','.'))||0)
      const category=(inputs[2]?.value||'').trim()||'General'
      if(!name||price<=0){show('Completá nombre y precio para guardar el producto.');return}

      const snapshot=snapshotRef.current||await ensureSnapshot()
      const existingId=title==='Editar producto'?editingIdRef.current:''
      const existing=existingId?snapshot.products.find(product=>product.id===existingId):null
      const stockInput=inputs[3]?.value
      const stock=stockInput==null||stockInput===''?Math.max(0,Number(existing?.stock||0)):Math.max(0,Number(stockInput)||0)
      const submit=form.querySelector('button[type="submit"]') as HTMLButtonElement|null
      const originalText=submit?.textContent||''
      busyProduct.current=true
      if(submit){submit.disabled=true;submit.textContent='Guardando…'}
      try{
        const branchId=await ensureBranch()
        if(existingId)await updateCloudProduct(session,existingId,{name,price,category,stock})
        else await createCloudProduct(session,branchId,{name,price,category,stock})

        const pending=readPendingProducts(session.companyId).filter(product=>{
          if(existingId&&product.id===existingId)return false
          if(editingNameRef.current&&normalize(product.name)===normalize(editingNameRef.current))return false
          return !(normalize(product.name)===normalize(name)&&Math.abs(Number(product.price||0)-price)<0.01)
        })
        writePendingProducts(session.companyId,pending)
        show(existingId?'Producto actualizado y guardado.':'Producto creado y guardado.',1800)
        later(()=>window.location.reload(),450)
      }catch(error){
        show(error instanceof Error?`No se pudo guardar: ${error.message}`:'No se pudo guardar el producto.',4200)
      }finally{
        busyProduct.current=false
        if(submit){submit.disabled=false;submit.textContent=originalText}
      }
    }

    function processingCheckout(){
      return Array.from(document.querySelectorAll('div')).some(node=>/^(Registrando y facturando…|Registrando venta…|Abriendo caja…)$/.test(cleanText(node)))
    }
    function hasSaleItems(){
      const lines=document.querySelector('[class*="cartLines"]') as HTMLElement|null
      const total=document.querySelector('[class*="totalRow"] b')
      const title=document.querySelector('[class*="cartTitle"]')
      return Boolean(lines?.children.length)||numberFrom(cleanText(total))>0||/\b\d+\s+ítem/i.test(cleanText(title))
    }
    function paintButton(button:HTMLButtonElement|null,kind:'invoice'|'sale',enabled:boolean){
      if(!button)return
      const active=kind==='invoice'
        ?'linear-gradient(135deg,#8b3dff 0%,#7027ea 54%,#5a16c9 100%)'
        :'linear-gradient(135deg,#ff7b4e 0%,#f35b2b 55%,#de4318 100%)'
      const inactive=kind==='invoice'
        ?'linear-gradient(135deg,#5b4d69,#4b4057)'
        :'linear-gradient(135deg,#6b514d,#5a433f)'
      button.style.setProperty('background',enabled?active:inactive,'important')
      button.style.setProperty('color','#fff','important')
      button.style.setProperty('opacity',enabled?'1':'.42','important')
      button.style.setProperty('filter',enabled?'saturate(1.12)':'saturate(.55)','important')
      button.style.setProperty('box-shadow',enabled?(kind==='invoice'?'0 10px 24px rgba(117,44,235,.34)':'0 10px 24px rgba(239,83,36,.30)'):'none','important')
      button.style.setProperty('cursor',enabled?'pointer':'not-allowed','important')
      button.style.setProperty('transition','background .18s ease,opacity .18s ease,box-shadow .18s ease,filter .18s ease','important')
    }
    function syncCheckoutButtons(){
      if(disposed)return
      const invoice=(document.querySelector('button[data-mobile-checkout-kind="invoice"]')||document.querySelector('button[class*="invoiceButton"]')) as HTMLButtonElement|null
      const sale=document.querySelector('button[data-mobile-checkout-kind="sale"]') as HTMLButtonElement|null
      if(!invoice)return
      const items=hasSaleItems()
      const blocked=cashModeRef.current==='manual'&&cashOpenRef.current!==true
      const processing=processingCheckout()
      const shouldEnable=items&&!blocked&&!processing
      if(shouldEnable){invoice.disabled=false;if(sale)sale.disabled=false}
      else if(!items||blocked||processing){invoice.disabled=true;if(sale)sale.disabled=true}
      paintButton(invoice,'invoice',!invoice.disabled)
      paintButton(sale,'sale',Boolean(sale&&!sale.disabled))
    }
    function scheduleSync(){
      if(disposed||frame)return
      frame=window.requestAnimationFrame(()=>{frame=0;syncCheckoutButtons()})
    }

    const onCashStatus=(event:Event)=>{
      const open=(event as CustomEvent<{open?:boolean}>).detail?.open
      if(typeof open==='boolean')cashOpenRef.current=open
      scheduleSync()
    }
    const onSettings=(event:Event)=>{
      const mode=(event as CustomEvent<{cashMode?:CashMode}>).detail?.cashMode
      if(mode)cashModeRef.current=effectiveCashMode(mode)
      scheduleSync()
    }
    const onClick=(event:Event)=>rememberEditedProduct(event.target)

    document.addEventListener('submit',saveProductForm,true)
    document.addEventListener('click',onClick,true)
    window.addEventListener('comercio:mobile-cash-status',onCashStatus)
    window.addEventListener('comercio:sales-settings',onSettings)
    const observer=new MutationObserver(scheduleSync)
    observer.observe(document.body,{childList:true,subtree:true,characterData:true})
    const interval=window.setInterval(scheduleSync,500)

    void Promise.all([
      ensureSnapshot().catch(()=>null),
      loadSalesSettings(session).catch(()=>readCachedSalesSettings(session.companyId)),
    ]).then(([,settings])=>{
      if(settings)cashModeRef.current=effectiveCashMode(settings.cashMode)
      scheduleSync()
      void migratePendingProducts()
    })

    return()=>{
      disposed=true
      document.removeEventListener('submit',saveProductForm,true)
      document.removeEventListener('click',onClick,true)
      window.removeEventListener('comercio:mobile-cash-status',onCashStatus)
      window.removeEventListener('comercio:sales-settings',onSettings)
      observer.disconnect()
      window.clearInterval(interval)
      if(frame)window.cancelAnimationFrame(frame)
      timers.forEach(id=>window.clearTimeout(id))
    }
  },[])

  return message?<div style={{position:'fixed',zIndex:12080,left:'50%',top:18,transform:'translateX(-50%)',maxWidth:'calc(100vw - 28px)',padding:'11px 15px',borderRadius:14,background:'#171218',color:'#fff',fontSize:12,fontWeight:900,boxShadow:'0 12px 34px rgba(0,0,0,.28)',textAlign:'center'}}>{message}</div>:null
}
