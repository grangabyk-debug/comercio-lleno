'use client'

import { FormEvent, useEffect, useRef, useState } from 'react'
import { createProduct, loadCommerceSnapshot, updateProduct } from '@/lib/comercio/api'
import { loadMobileSettings, readCachedMobileSettings } from '@/lib/comercio/mobile-settings'
import { readTenantSession } from '@/lib/comercio/session'
import type { Product, TenantSession } from '@/lib/comercio/types'
import styles from './mobile-scanner.module.css'

const money=new Intl.NumberFormat('es-AR',{style:'currency',currency:'ARS',maximumFractionDigits:0})
type ScannerControls={stop:()=>void}
type AudioWindow=Window & typeof globalThis & {webkitAudioContext?:typeof AudioContext}

export default function MobileScanner(){
  const[open,setOpen]=useState(false),[error,setError]=useState(''),[code,setCode]=useState(''),[product,setProduct]=useState<Product|null>(null),[notFound,setNotFound]=useState(false),[busy,setBusy]=useState(false),[manual,setManual]=useState('')
  const[enabled,setEnabled]=useState(false),[appReady,setAppReady]=useState(false),[editPrice,setEditPrice]=useState(''),[editStock,setEditStock]=useState(''),[saving,setSaving]=useState(false)
  const[addOpen,setAddOpen]=useState(false),[newName,setNewName]=useState(''),[newPrice,setNewPrice]=useState(''),[newStock,setNewStock]=useState('')
  const videoRef=useRef<HTMLVideoElement|null>(null),controlsRef=useRef<ScannerControls|null>(null),productsRef=useRef<Product[]>([]),lastRef=useRef(''),sessionRef=useRef<TenantSession|null>(null),audioRef=useRef<AudioContext|null>(null)

  function canEdit(session:TenantSession|null){return Boolean(session&&(session.role==='owner'||session.permissions?.can_edit_products===true||(session.permissions?.can_edit_products==null&&session.permissions?.can_manage_stock!==false)))}
  function stop(){try{controlsRef.current?.stop()}catch{}controlsRef.current=null;if(videoRef.current){const stream=videoRef.current.srcObject as MediaStream|null;stream?.getTracks().forEach(track=>track.stop());videoRef.current.srcObject=null}}
  function getAudioContext(){
    try{
      if(audioRef.current)return audioRef.current
      const AudioContextClass=window.AudioContext||(window as AudioWindow).webkitAudioContext
      if(!AudioContextClass)return null
      audioRef.current=new AudioContextClass()
      return audioRef.current
    }catch{return null}
  }
  function primeAudio(){const audio=getAudioContext();if(audio?.state==='suspended')void audio.resume().catch(()=>{})}
  function playSuccessBeep(){
    const audio=getAudioContext();if(!audio)return
    const play=()=>{
      try{
        const now=audio.currentTime,oscillator=audio.createOscillator(),gain=audio.createGain()
        oscillator.type='sine';oscillator.frequency.setValueAtTime(1050,now)
        gain.gain.setValueAtTime(0.0001,now);gain.gain.exponentialRampToValueAtTime(0.09,now+0.005);gain.gain.exponentialRampToValueAtTime(0.0001,now+0.08)
        oscillator.connect(gain);gain.connect(audio.destination);oscillator.start(now);oscillator.stop(now+0.085)
      }catch{}
    }
    if(audio.state==='suspended')void audio.resume().then(play).catch(()=>{});else play()
  }

  async function syncEnabled(){
    const session=readTenantSession();sessionRef.current=session
    if(!session){setEnabled(false);setOpen(false);stop();return}
    setEnabled(readCachedMobileSettings(session.companyId).scannerEnabled)
    try{const remote=await loadMobileSettings(session);setEnabled(remote.scannerEnabled)}catch{}
  }
  useEffect(()=>{
    void syncEnabled()
    const onSettings=(e:Event)=>{const detail=(e as CustomEvent<{scannerEnabled?:boolean}>).detail;if(detail)setEnabled(Boolean(readTenantSession())&&detail.scannerEnabled!==false)}
    window.addEventListener('comercio:mobile-settings',onSettings)
    const timer=window.setInterval(()=>{
      const current=readTenantSession()
      const previous=sessionRef.current
      if(!current){
        if(previous){sessionRef.current=null;setEnabled(false);setOpen(false);stop()}
        return
      }
      if(!previous||previous.companyId!==current.companyId)void syncEnabled()
    },800)
    return()=>{window.removeEventListener('comercio:mobile-settings',onSettings);window.clearInterval(timer)}
  },[])

  useEffect(()=>{
    let timer:number|undefined
    let shown=false
    const sync=()=>{
      const ready=Boolean(document.querySelector('main[class*="app"]'))
      if(!ready){
        if(timer!==undefined)window.clearTimeout(timer)
        timer=undefined
        shown=false
        setAppReady(false)
        return
      }
      if(shown||timer!==undefined)return
      timer=window.setTimeout(()=>{shown=true;timer=undefined;setAppReady(true)},320)
    }
    sync()
    const observer=new MutationObserver(sync)
    observer.observe(document.body,{childList:true,subtree:true})
    return()=>{observer.disconnect();if(timer!==undefined)window.clearTimeout(timer)}
  },[])

  function resolve(raw:string){
    const value=raw.trim();if(!value||value===lastRef.current)return
    lastRef.current=value;setCode(value);stop()
    const hit=productsRef.current.find(p=>String(p.barcode||'').trim()===value)
    setProduct(hit||null);setNotFound(!hit);setAddOpen(false);setError('')
    if(hit){setEditPrice(String(hit.price??''));setEditStock(String(hit.stock??''));playSuccessBeep()}
    else{setNewName('');setNewPrice('');setNewStock('')}
    navigator.vibrate?.(80)
  }

  async function start(){
    setBusy(true);setError('');setProduct(null);setNotFound(false);setCode('');setAddOpen(false);lastRef.current=''
    try{
      const session=readTenantSession();sessionRef.current=session;if(!session)throw new Error('Iniciá sesión para usar el escáner.')
      const mobile=await loadMobileSettings(session).catch(()=>readCachedMobileSettings(session.companyId));setEnabled(mobile.scannerEnabled)
      if(!mobile.scannerEnabled)throw new Error('El escáner con cámara está desactivado en Configuración para este comercio.')
      const data=await loadCommerceSnapshot(session);productsRef.current=data.products
      if(!navigator.mediaDevices?.getUserMedia)throw new Error('Este navegador no permite usar la cámara. Podés ingresar el código manualmente.')
      const video=videoRef.current;if(!video)throw new Error('No se pudo preparar la vista de cámara.')
      const { BrowserMultiFormatReader }=await import('@zxing/browser')
      const reader=new BrowserMultiFormatReader()
      const controls=await reader.decodeFromConstraints({video:{facingMode:{ideal:'environment'},width:{ideal:1280},height:{ideal:720}},audio:false},video,(result)=>{const value=result?.getText?.();if(value)resolve(value)})
      controlsRef.current=controls as ScannerControls
    }catch(e){setError(e instanceof Error?e.message:String(e))}finally{setBusy(false)}
  }

  async function openScanner(){
    primeAudio();await syncEnabled()
    const session=readTenantSession()
    if(!session)return
    const mobile=await loadMobileSettings(session).catch(()=>readCachedMobileSettings(session.companyId));if(!mobile.scannerEnabled){setEnabled(false);window.alert('El escáner está desactivado para este comercio. Podés activarlo desde Configuración.');return}
    setOpen(true);window.setTimeout(()=>void start(),90)
  }
  function close(){stop();setOpen(false);setError('');setManual('');setAddOpen(false)}
  function scanAgain(){setProduct(null);setNotFound(false);setCode('');setManual('');setAddOpen(false);lastRef.current='';window.setTimeout(()=>void start(),80)}

  async function saveExisting(e:FormEvent){
    e.preventDefault();const session=sessionRef.current||readTenantSession();if(!session||!product)return
    if(!canEdit(session)){setError('Tu usuario no tiene permiso para editar productos.');return}
    setSaving(true);setError('')
    try{
      const price=Math.max(0,Number(editPrice.replace(',','.'))||0),stock=Math.max(0,Number(editStock.replace(',','.'))||0)
      const next={...product,price,stock}
      await updateProduct(session,next);productsRef.current=productsRef.current.map(p=>p.id===next.id?next:p);setProduct(next)
    }catch(e){setError(e instanceof Error?e.message:String(e))}finally{setSaving(false)}
  }

  async function addProduct(e:FormEvent){
    e.preventDefault();const session=sessionRef.current||readTenantSession();if(!session)return
    if(!canEdit(session)){setError('Tu usuario no tiene permiso para agregar productos.');return}
    const name=newName.trim(),price=Math.max(0,Number(newPrice.replace(',','.'))||0),stock=Math.max(0,Number(newStock.replace(',','.'))||0)
    if(!name){setError('Ingresá el nombre del producto.');return}
    setSaving(true);setError('')
    try{
      const created=await createProduct(session,{name,barcode:code,category:'General',unit:'unidad',price,stock,cost:0,wholesale_price:0,min_stock:0,target_stock:0,active:true})
      productsRef.current=[created,...productsRef.current];setProduct(created);setNotFound(false);setAddOpen(false);setEditPrice(String(created.price||0));setEditStock(String(created.stock||0))
    }catch(e){setError(e instanceof Error?e.message:String(e))}finally{setSaving(false)}
  }

  useEffect(()=>()=>{stop();const audio=audioRef.current;audioRef.current=null;if(audio)void audio.close().catch(()=>{})},[])
  const editable=canEdit(sessionRef.current||readTenantSession())

  return <>
    {appReady&&enabled&&Boolean(readTenantSession())&&<button className={styles.fab} onClick={()=>void openScanner()} aria-label="Escanear producto"><span>▣</span><b>Escáner</b></button>}
    {open&&appReady&&Boolean(readTenantSession())&&<div className={styles.backdrop}><div className={styles.sheet}>
      <div className={styles.head}><div><span>CONSULTA Y EDICIÓN</span><h2>Escáner de productos</h2></div><button onClick={close}>×</button></div>
      <div className={styles.camera}><video ref={videoRef} playsInline muted/><div className={styles.frame}/><div className={styles.hint}>{busy?'Preparando cámara…':product||notFound?'Código leído':'Apuntá al código de barras'}</div></div>
      {error&&<div className={styles.warning}>{error}</div>}
      <div className={styles.manual}><input inputMode="numeric" value={manual} onChange={e=>setManual(e.target.value)} onKeyDown={e=>e.key==='Enter'&&resolve(manual)} placeholder="Ingresar código manualmente"/><button onClick={()=>resolve(manual)}>Buscar</button></div>

      {product&&<div className={styles.result}><span>PRODUCTO ENCONTRADO</span><h3>{product.name}</h3><strong>{money.format(product.price)}</strong><div className={styles.infoGrid}><p><b>Código</b>{product.barcode||'—'}</p><p><b>Categoría</b>{product.category||'General'}</p><p><b>Stock</b>{product.stock}</p><p><b>Unidad</b>{product.unit||'unidad'}</p></div>
        {editable&&<><form className={styles.quickEdit} onSubmit={saveExisting}><label>Precio<input inputMode="decimal" value={editPrice} onChange={e=>setEditPrice(e.target.value)}/></label><label>Stock<input inputMode="decimal" value={editStock} onChange={e=>setEditStock(e.target.value)}/></label><button disabled={saving}>{saving?'Guardando…':'Guardar precio y stock'}</button></form><small className={styles.privacy}>Los cambios de precio y stock se guardan directamente en este comercio.</small></>}
        <button className={styles.scanAgain} onClick={scanAgain}>Escanear otro</button>
      </div>}

      {notFound&&!product&&<div className={styles.notFound}><b>Este producto no está en tu stock</b><span>Código leído: {code}</span><p>Podés agregarlo con los datos básicos o descartarlo y seguir escaneando.</p>
        {!addOpen&&<div className={styles.notFoundActions}><button disabled={!editable} onClick={()=>setAddOpen(true)}>+ Agregar producto</button><button onClick={scanAgain}>Descartar</button></div>}
        {addOpen&&<form className={styles.addForm} onSubmit={addProduct}><label>Nombre<input autoFocus value={newName} onChange={e=>setNewName(e.target.value)} placeholder="Nombre del producto"/></label><label>Precio<input inputMode="decimal" value={newPrice} onChange={e=>setNewPrice(e.target.value)} placeholder="Precio"/></label><label>Stock<input inputMode="decimal" value={newStock} onChange={e=>setNewStock(e.target.value)} placeholder="Cantidad"/></label><div><button type="button" onClick={()=>setAddOpen(false)}>Cancelar</button><button disabled={saving}>{saving?'Agregando…':'Agregar al stock'}</button></div></form>}
      </div>}
      <small className={styles.privacy}>La cámara se usa solamente mientras el escáner está abierto. No guarda fotos ni video.</small>
    </div></div>}
  </>
}
