'use client'

// Preview landing: assets locales verificados 2026-08-15
import { useEffect, useState } from 'react'
import styles from './landing.module.css'

type Scene={kind:'image';src:string;poster:string;label:string;detail:string}

const scenes:Scene[]=[
  {kind:'image',src:'/landing/ferreteria.webp',poster:'/landing/ferreteria.webp',label:'Ferreterías y casas de herramientas',detail:'Ventas, caja y productos en un mismo lugar'},
  {kind:'image',src:'/landing/supermercado.webp',poster:'/landing/supermercado.webp',label:'Supermercados y almacenes',detail:'Stock, precios y operación diaria'},
  {kind:'image',src:'/landing/cafeteria-sutil.webp',poster:'/landing/cafeteria-sutil.webp',label:'Cafeterías y panaderías',detail:'Cobro ágil y control del mostrador'},
  {kind:'image',src:'/landing/queseria.webp',poster:'/landing/queseria.webp',label:'Fiambrerías y comercios de alimentos',detail:'Productos, stock y ventas sin vueltas'},
  {kind:'image',src:'/landing/cafeteria.webp',poster:'/landing/cafeteria.webp',label:'Locales de cercanía',detail:'Todo el negocio desde una misma cuenta'},
]

const photoOverrides:Array<[string,string]>=[
  ['13061609','/landing/cafeteria-sutil.webp'],
  ['12326636','/landing/ferreteria.webp'],
  ['3184465','/landing/supermercado.webp'],
  ['5103992','/landing/queseria.webp'],
  ['33752264','/landing/cafeteria.webp'],
]

const promoStyle={position:'absolute' as const,zIndex:6,right:38,top:28,width:310,padding:'14px 16px',borderRadius:16,color:'#fff',background:'rgba(9,15,20,.62)',border:'1px solid rgba(255,255,255,.2)',backdropFilter:'blur(16px)',boxShadow:'0 18px 45px rgba(0,0,0,.22)'}

export default function HeroMerchantRotator(){
  const[current,setCurrent]=useState(0)
  const scene=scenes[current]

  useEffect(()=>{const timer=window.setInterval(()=>setCurrent(value=>(value+1)%scenes.length),7200);return()=>window.clearInterval(timer)},[])

  useEffect(()=>{
    const applyPreviewPhotos=()=>{
      document.querySelectorAll<HTMLImageElement>('img').forEach(img=>{
        const original=img.getAttribute('src')||''
        const match=photoOverrides.find(([needle])=>original.includes(needle))
        if(match&&original!==match[1])img.setAttribute('src',match[1])
      })
    }
    applyPreviewPhotos()
    const observer=new MutationObserver(applyPreviewPhotos)
    observer.observe(document.body,{childList:true,subtree:true})
    return()=>observer.disconnect()
  },[])

  return <div className={styles.heroMedia}>
    <div className={styles.heroMediaFrame} key={`scene-${current}`}>
      <img className={styles.heroMediaAsset} src={scene.poster} alt="Comerciante trabajando en su local"/>
    </div>
    <div className={styles.heroMediaShade}/>
    <div className="clHeroPromo" style={promoStyle}>
      <span style={{fontSize:8,fontWeight:900,letterSpacing:'.14em',color:'#78e2ae'}}>50% DE DESCUENTO · 3 MESES</span>
      <div style={{display:'flex',alignItems:'baseline',gap:10,marginTop:5}}><del style={{fontSize:16,color:'#adb8b3'}}>$29.800</del><strong style={{fontSize:28,letterSpacing:'-1px'}}>$14.900</strong><small style={{fontSize:9,color:'#cbd4d0'}}>/ mes</small></div>
      <p style={{fontSize:9,lineHeight:1.45,color:'#d4dcd8',margin:'5px 0 0'}}>Ahorrás $14.900 por mes durante tus primeros 3 meses.</p>
      <b style={{display:'block',fontSize:9,color:'#7ce3ae',marginTop:6}}>Además, empezás con 14 días gratis antes del primer cobro.</b>
    </div>

    <div className="clMobileHeroContent">
      <p className="clMobileHeroKicker">SISTEMA POS PARA COMERCIOS EN ARGENTINA</p>
      <h1>Vendé más simple.<br/>Ordená todo desde <span>un solo lugar.</span></h1>
      <p className="clMobileHeroLead">Cobrá, facturá, controlá stock, seguí tu caja y entendé tus números con un sistema pensado para el ritmo real del comercio.</p>
      <div className="clMobileHeroActions">
        <a href="/redesign/access">Ingresar</a>
        <a href="/prueba-gratis">Probar 14 días gratis</a>
      </div>
      <p className="clMobileHeroHuman">Soporte humano disponible cuando una configuración necesita una persona de verdad.</p>
      <div className="clMobileHeroProof">
        <div><strong>150+</strong><span>comercios en Argentina</span></div>
        <div><strong>Sin límites</strong><span>productos y stock</span></div>
        <div><strong>2 sucursales</strong><span>incluidas</span></div>
      </div>
    </div>

    <div className="clMobileHeroQuickActions" aria-label="Accesos rápidos">
      <a href="/prueba-gratis">Probar gratis 14 días</a>
      <a href="/redesign/access">Ingresar</a>
    </div>
    <div className={styles.heroSceneCaption}><span>{scene.label}</span><strong>{scene.detail}</strong></div>
    <div className={styles.heroSceneRail} aria-label="Rubros que usan Comercio Lleno">{scenes.map((item,index)=><button type="button" aria-label={`Ver ${item.label}`} aria-current={index===current?'true':undefined} className={index===current?styles.heroSceneActive:styles.heroSceneDot} onClick={()=>setCurrent(index)} key={item.label}/>)}</div>
  </div>
}
