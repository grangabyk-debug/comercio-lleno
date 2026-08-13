'use client'

import { useEffect, useRef, useState } from 'react'
import { loadCommerceSnapshot } from '@/lib/comercio/api'
import { readTenantSession } from '@/lib/comercio/session'
import type { Product } from '@/lib/comercio/types'
import styles from './mobile-scanner.module.css'

const money=new Intl.NumberFormat('es-AR',{style:'currency',currency:'ARS',maximumFractionDigits:0})
type ScannerControls={stop:()=>void}

export default function MobileScanner(){
  const[open,setOpen]=useState(false),[error,setError]=useState(''),[code,setCode]=useState(''),[product,setProduct]=useState<Product|null>(null),[notFound,setNotFound]=useState(false),[busy,setBusy]=useState(false),[manual,setManual]=useState('')
  const videoRef=useRef<HTMLVideoElement|null>(null),controlsRef=useRef<ScannerControls|null>(null),productsRef=useRef<Product[]>([]),lastRef=useRef('')

  function stop(){try{controlsRef.current?.stop()}catch{}controlsRef.current=null;if(videoRef.current){const stream=videoRef.current.srcObject as MediaStream|null;stream?.getTracks().forEach(track=>track.stop());videoRef.current.srcObject=null}}
  function resolve(raw:string){const value=raw.trim();if(!value)return;setCode(value);const hit=productsRef.current.find(p=>String(p.barcode||'').trim()===value);setProduct(hit||null);setNotFound(!hit);if(value!==lastRef.current){lastRef.current=value;navigator.vibrate?.(80)}}

  async function start(){
    setBusy(true);setError('');setProduct(null);setNotFound(false);setCode('');lastRef.current=''
    try{
      const session=readTenantSession();if(!session)throw new Error('Iniciá sesión para usar el escáner.')
      const data=await loadCommerceSnapshot(session);productsRef.current=data.products
      if(!navigator.mediaDevices?.getUserMedia)throw new Error('Este navegador no permite usar la cámara. Podés ingresar el código manualmente.')
      const video=videoRef.current;if(!video)throw new Error('No se pudo preparar la vista de cámara.')
      const { BrowserMultiFormatReader }=await import('@zxing/browser')
      const reader=new BrowserMultiFormatReader()
      const controls=await reader.decodeFromConstraints({video:{facingMode:{ideal:'environment'},width:{ideal:1280},height:{ideal:720}},audio:false},video,(result)=>{
        const value=result?.getText?.();if(value)resolve(value)
      })
      controlsRef.current=controls as ScannerControls
    }catch(e){setError(e instanceof Error?e.message:String(e))}finally{setBusy(false)}
  }

  function close(){stop();setOpen(false);setError('');setManual('')}
  function openScanner(){setOpen(true);window.setTimeout(()=>void start(),100)}
  useEffect(()=>()=>stop(),[])

  return <>
    <button className={styles.fab} onClick={openScanner} aria-label="Escanear producto"><span>▣</span><b>Escáner</b></button>
    {open&&<div className={styles.backdrop}><div className={styles.sheet}>
      <div className={styles.head}><div><span>CONSULTA DE PRECIO</span><h2>Escáner de productos</h2></div><button onClick={close}>×</button></div>
      <div className={styles.camera}><video ref={videoRef} playsInline muted/><div className={styles.frame}/><div className={styles.hint}>{busy?'Preparando cámara…':'Apuntá al código de barras'}</div></div>
      {error&&<div className={styles.warning}>{error}</div>}
      <div className={styles.manual}><input inputMode="numeric" value={manual} onChange={e=>setManual(e.target.value)} onKeyDown={e=>e.key==='Enter'&&resolve(manual)} placeholder="Ingresar código manualmente"/><button onClick={()=>resolve(manual)}>Buscar</button></div>
      {product&&<div className={styles.result}><span>PRODUCTO ENCONTRADO</span><h3>{product.name}</h3><strong>{money.format(product.price)}</strong><div><p><b>Código</b>{product.barcode||'—'}</p><p><b>Categoría</b>{product.category||'General'}</p><p><b>Stock</b>{product.stock}</p><p><b>Unidad</b>{product.unit||'unidad'}</p></div><button onClick={()=>{setProduct(null);setNotFound(false);setCode('');lastRef.current=''}}>Escanear otro</button></div>}
      {notFound&&!product&&<div className={styles.notFound}><b>Producto no encontrado</b><span>Código leído: {code}</span><p>Ese código no está cargado en este comercio.</p></div>}
      <small className={styles.privacy}>La cámara se usa solamente mientras el escáner está abierto. No guarda fotos ni video.</small>
    </div></div>}
  </>
}
