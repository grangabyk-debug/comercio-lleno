'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import styles from './LandingMobileInnovation.module.css'

type IconName='phone'|'scan'|'ai'|'arca'|'cash'|'sale'|'products'|'moves'|'home'

function Icon({name}:{name:IconName}){
  const common={width:20,height:20,viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:1.8,strokeLinecap:'round' as const,strokeLinejoin:'round' as const,'aria-hidden':true}
  if(name==='phone')return <svg {...common}><rect x="7" y="2.5" width="10" height="19" rx="2.5"/><path d="M10 5h4M11 18.5h2"/></svg>
  if(name==='scan')return <svg {...common}><path d="M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3M7 12h10M9 9v6M12 9v6M15 9v6"/></svg>
  if(name==='ai')return <svg {...common}><path d="M12 3l1.4 4.1L17.5 8.5l-4.1 1.4L12 14l-1.4-4.1-4.1-1.4 4.1-1.4L12 3Z"/><path d="M18.5 13.5l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8.8-2.2Z"/></svg>
  if(name==='arca')return <svg {...common}><path d="M4 7.5 12 3l8 4.5v9L12 21l-8-4.5v-9Z"/><path d="M8 9.5h8M8 13h8M10 16.5h4"/></svg>
  if(name==='cash')return <svg {...common}><circle cx="12" cy="12" r="8"/><path d="M14.5 8.5h-3a2 2 0 0 0 0 4h1a2 2 0 0 1 0 4h-3M12 6.5v11"/></svg>
  if(name==='sale')return <svg {...common}><path d="M12 5v14M5 12h14"/></svg>
  if(name==='products')return <svg {...common}><path d="M5 5h14v14H5zM9.5 5v14M14.5 5v14M5 9.5h14M5 14.5h14"/></svg>
  if(name==='moves')return <svg {...common}><path d="M7 7h10M14 4l3 3-3 3M17 17H7M10 14l-3 3 3 3"/></svg>
  return <svg {...common}><path d="m4 11 8-6 8 6v8H7v-6h10v6"/></svg>
}

function MobileDashboardMock(){
  return <div className={styles.phoneWrap}>
    <div className={styles.phoneGlow}/>
    <div className={styles.phone}>
      <div className={styles.phoneTop}>
        <div className={styles.miniLogo}>CL</div>
        <div><strong>Comercio Lleno</strong><span>La Económica</span></div>
        <div className={styles.settingsDot}/>
      </div>
      <div className={styles.planBar}>PLAN SIMPLE · MÓVIL</div>
      <div className={styles.todayRow}>
        <div><span>HOY</span><strong>$ 428.650</strong><small>36 ventas registradas</small></div>
        <div className={styles.autoCash}><Icon name="cash"/><b>Caja automática</b></div>
      </div>
      <div className={styles.newSale}><div><Icon name="sale"/></div><span><b>Nueva venta</b><small>Elegí productos y facturá</small></span><strong>›</strong></div>
      <div className={styles.quickGrid}>
        <div><span><Icon name="products"/></span><b>Productos</b><small>Ver, crear y editar</small></div>
        <div><span><Icon name="moves"/></span><b>Movimientos</b><small>Resumen de lo vendido hoy</small></div>
      </div>
      <div className={styles.dayCard}>
        <div className={styles.dayHead}><span><small>RESUMEN DE HOY</small><b>Cómo viene el día</b></span><strong>En vivo</strong></div>
        <div><span>Ventas</span><b>36</b></div>
        <div><span>Total vendido</span><b>$ 428.650</b></div>
        <div><span>Productos</span><b>811</b></div>
      </div>
      <div className={styles.mobileTools}>
        <div className={styles.aiOrb}><Icon name="ai"/><span>IA</span></div>
        <div className={styles.scanButton}><Icon name="scan"/><span>Escáner</span></div>
      </div>
      <div className={styles.bottomNav}>
        <span className={styles.activeNav}><Icon name="home"/><small>Inicio</small></span>
        <span><Icon name="sale"/><small>Venta</small></span>
        <span><Icon name="products"/><small>Productos</small></span>
        <span><Icon name="moves"/><small>Movimientos</small></span>
      </div>
    </div>
    <div className={`${styles.floatingBadge} ${styles.badgeAi}`}><span><Icon name="ai"/></span><div><b>IA integrada</b><small>Consultá ventas y stock</small></div></div>
    <div className={`${styles.floatingBadge} ${styles.badgeArca}`}><span><Icon name="arca"/></span><div><b>ARCA directo</b><small>Facturá desde el teléfono</small></div></div>
    <div className={`${styles.floatingBadge} ${styles.badgeScan}`}><span><Icon name="scan"/></span><div><b>Lector por cámara</b><small>Sin hardware extra</small></div></div>
  </div>
}

function MobileInnovationSection(){
  return <section className={styles.section} aria-labelledby="mobile-innovation-title">
    <div className={styles.texture}/>
    <div className={styles.shell}>
      <div className={styles.copy}>
        <p className={styles.eyebrow}>COMERCIO LLENO MÓVIL · UNA FORMA MÁS ÁGIL DE VENDER</p>
        <h2 id="mobile-innovation-title">Tu comercio completo, <span>también en el teléfono.</span></h2>
        <p className={styles.lead}>Pensado para quienes quieren trabajar sin depender de una computadora. Desde el celular podés vender, controlar productos, escanear códigos y <strong>facturar conectado directamente con ARCA.</strong></p>
        <div className={styles.featureGrid}>
          <article><span><Icon name="ai"/></span><div><b>Inteligencia artificial</b><p>Preguntá por ventas, stock y movimiento del negocio desde el mismo sistema.</p></div></article>
          <article><span><Icon name="scan"/></span><div><b>Lector de códigos en cámara</b><p>Usá el teléfono como scanner para buscar productos y agilizar la operación.</p></div></article>
          <article><span><Icon name="cash"/></span><div><b>Caja automática</b><p>Menos pasos para empezar a vender y un resumen claro de lo que pasa hoy.</p></div></article>
          <article><span><Icon name="arca"/></span><div><b>Facturación ARCA desde el celular</b><p>Cobrá y facturá desde el teléfono una vez configurada la integración fiscal.</p></div></article>
        </div>
        <div className={styles.noPcCallout}><span><Icon name="phone"/></span><div><b>No necesitás tener una PC para empezar.</b><p>La experiencia móvil está diseñada para ser simple, rápida y cómoda incluso si el teléfono es tu herramienta principal de trabajo.</p></div></div>
      </div>
      <MobileDashboardMock/>
    </div>
  </section>
}

export default function LandingMobileInnovation(){
  const[host,setHost]=useState<HTMLElement|null>(null)
  useEffect(()=>{
    let mounted=true
    let portal:HTMLDivElement|null=null
    const mount=()=>{
      const target=document.querySelector('section[aria-label="Integraciones y compatibilidades"]')
      if(!target||!target.parentElement||!mounted)return false
      portal=document.createElement('div')
      portal.dataset.mobileInnovation='true'
      target.insertAdjacentElement('afterend',portal)
      setHost(portal)
      return true
    }
    if(!mount()){
      const observer=new MutationObserver(()=>{if(mount())observer.disconnect()})
      observer.observe(document.body,{childList:true,subtree:true})
      const timer=window.setTimeout(()=>observer.disconnect(),5000)
      return()=>{mounted=false;window.clearTimeout(timer);observer.disconnect();portal?.remove()}
    }
    return()=>{mounted=false;portal?.remove()}
  },[])
  return host?createPortal(<MobileInnovationSection/>,host):null
}
