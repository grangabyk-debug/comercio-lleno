'use client'

import { useEffect, useState } from 'react'
import styles from './landing.module.css'

type Scene={kind:'image';src:string;poster:string;label:string;detail:string}

// Fotos documentales de Pexels: personas reales trabajando/atendiendo en comercios.
// En el preview evitamos renders de IA y priorizamos escenas espontáneas, mostradores y clientes.
const shopConversation='https://images.pexels.com/photos/6545444/pexels-photo-6545444.jpeg?auto=compress&cs=tinysrgb&w=1800'
const retailCashier='https://images.pexels.com/photos/3735168/pexels-photo-3735168.jpeg?auto=compress&cs=tinysrgb&w=1800'
const bakeryService='https://images.pexels.com/photos/6205541/pexels-photo-6205541.jpeg?auto=compress&cs=tinysrgb&w=1800'
const localGrocery='https://images.pexels.com/photos/35704478/pexels-photo-35704478/free-photo-of-shopkeeper-standing-in-local-grocery-store.jpeg?auto=compress&cs=tinysrgb&w=1800'
const cardPayment='https://images.pexels.com/photos/4921262/pexels-photo-4921262.jpeg?auto=compress&cs=tinysrgb&w=1800'
const friendlyShop='https://images.pexels.com/photos/7772173/pexels-photo-7772173.jpeg?auto=compress&cs=tinysrgb&w=1800'

const scenes:Scene[]=[
  {kind:'image',src:shopConversation,poster:shopConversation,label:'Locales de cercanía',detail:'Atención real, clientes reales y todo el negocio ordenado'},
  {kind:'image',src:retailCashier,poster:retailCashier,label:'Comercios y mostradores',detail:'Ventas, caja y productos en una operación simple'},
  {kind:'image',src:bakeryService,poster:bakeryService,label:'Cafeterías y panaderías',detail:'Una atención ágil cuando el local está en movimiento'},
  {kind:'image',src:localGrocery,poster:localGrocery,label:'Almacenes y autoservicios',detail:'Stock y precios pensados para el trabajo de todos los días'},
  {kind:'image',src:cardPayment,poster:cardPayment,label:'Cobros en el punto de venta',detail:'Una experiencia clara para quien vende y quien compra'},
]

// También renovamos las fotos editoriales existentes de la landing sólo en este preview.
const photoOverrides:Array<[string,string]>=[
  ['13061609',bakeryService],
  ['12326636',localGrocery],
  ['3184465',shopConversation],
  ['5103992',friendlyShop],
  ['33752264',retailCashier],
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
        if(match&&original!==match[1]){
          img.setAttribute('src',match[1])
          img.setAttribute('loading','lazy')
          img.setAttribute('decoding','async')
        }
      })
    }
    applyPreviewPhotos()
    const observer=new MutationObserver(applyPreviewPhotos)
    observer.observe(document.body,{childList:true,subtree:true})
    return()=>observer.disconnect()
  },[])

  return <div className={styles.heroMedia}>
    <div className={styles.heroMediaFrame} key={`scene-${current}`}>
      <img className={styles.heroMediaAsset} src={scene.poster} alt="Personas trabajando y comprando en un comercio" fetchPriority={current===0?'high':'auto'} decoding="async"/>
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
