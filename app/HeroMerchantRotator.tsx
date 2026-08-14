'use client'

import { useEffect, useMemo, useState } from 'react'
import styles from './landing.module.css'

type Scene={kind:'video'|'image';src:string;poster:string;label:string;detail:string}

const scenes:Scene[]=[
  {kind:'video',src:'https://videos.pexels.com/video-files/4121754/4121754-hd_1920_1080_25fps.mp4',poster:'https://images.pexels.com/videos/4121754/barcode-buying-cashier-consumerism-4121754.jpeg?auto=compress&fit=crop&w=1800',label:'Comercios de cercanía',detail:'Cobro ágil y control diario'},
  {kind:'video',src:'https://videos.pexels.com/video-files/5103988/5103988-hd_1920_1080_30fps.mp4',poster:'https://images.pexels.com/videos/5103988/pexels-photo-5103988.jpeg?auto=compress&fit=crop&w=1800',label:'Supermercados y almacenes',detail:'Ventas, caja y stock en un mismo lugar'},
  {kind:'video',src:'https://videos.pexels.com/video-files/4292582/4292582-hd_1920_1080_25fps.mp4',poster:'https://images.pexels.com/videos/4292582/pexels-photo-4292582.jpeg?auto=compress&fit=crop&w=1800',label:'Stock e inventario',detail:'Control desde el salón y el celular'},
  {kind:'image',src:'https://images.pexels.com/photos/7697320/pexels-photo-7697320.jpeg?auto=compress&cs=tinysrgb&w=1800',poster:'https://images.pexels.com/photos/7697320/pexels-photo-7697320.jpeg?auto=compress&cs=tinysrgb&w=1800',label:'Servicios',detail:'También para peluquerías y negocios por atención'},
  {kind:'image',src:'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=1800',poster:'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=1800',label:'Showrooms y locales',detail:'Productos, precios, clientes y ventas'},
]

const promoStyle={position:'absolute' as const,zIndex:6,right:38,top:28,width:310,padding:'14px 16px',borderRadius:16,color:'#fff',background:'rgba(9,15,20,.62)',border:'1px solid rgba(255,255,255,.2)',backdropFilter:'blur(16px)',boxShadow:'0 18px 45px rgba(0,0,0,.22)'}

export default function HeroMerchantRotator(){
  const[current,setCurrent]=useState(0)
  const[videoReady,setVideoReady]=useState(false)
  const scene=scenes[current]
  const next=useMemo(()=>scenes[(current+1)%scenes.length],[current])

  useEffect(()=>{setVideoReady(scene.kind==='image')},[current,scene.kind])
  useEffect(()=>{const timer=window.setInterval(()=>setCurrent(value=>(value+1)%scenes.length),7200);return()=>window.clearInterval(timer)},[])

  return <div className={styles.heroMedia}>
    <div className={styles.heroMediaFrame} key={`scene-${current}`}>
      <img className={styles.heroMediaAsset} src={scene.poster} alt="Comerciante trabajando en su local"/>
      {scene.kind==='video'&&<video className={styles.heroMediaAsset} src={scene.src} poster={scene.poster} autoPlay muted playsInline loop preload="auto" onCanPlay={()=>setVideoReady(true)} onLoadedData={()=>setVideoReady(true)} style={{opacity:videoReady?1:0,transition:'opacity 700ms ease'}}/>}
    </div>
    {next.kind==='video'&&<video aria-hidden="true" src={next.src} muted playsInline preload="metadata" style={{position:'absolute',width:1,height:1,opacity:0,pointerEvents:'none'}}/>}
    <div className={styles.heroMediaShade}/>
    <div className="clHeroPromo" style={promoStyle}>
      <span style={{fontSize:8,fontWeight:900,letterSpacing:'.14em',color:'#78e2ae'}}>OPORTUNIDAD ESPECIAL</span>
      <div style={{display:'flex',alignItems:'baseline',gap:10,marginTop:5}}><del style={{fontSize:16,color:'#adb8b3'}}>$39.900</del><strong style={{fontSize:28,letterSpacing:'-1px'}}>$14.900</strong><small style={{fontSize:9,color:'#cbd4d0'}}>/ mes</small></div>
      <p style={{fontSize:9,lineHeight:1.45,color:'#d4dcd8',margin:'5px 0 0'}}>Ahorrás $25.000 por mes durante tus primeros 3 meses.</p>
      <b style={{display:'block',fontSize:9,color:'#7ce3ae',marginTop:6}}>Además, empezás con 14 días gratis antes del primer cobro.</b>
    </div>
    <div className={styles.heroSceneCaption}><span>{scene.label}</span><strong>{scene.detail}</strong></div>
    <div className={styles.heroSceneRail} aria-label="Rubros que usan Comercio Lleno">{scenes.map((item,index)=><button type="button" aria-label={`Ver ${item.label}`} aria-current={index===current?'true':undefined} className={index===current?styles.heroSceneActive:styles.heroSceneDot} onClick={()=>setCurrent(index)} key={item.label}/>)}</div>
  </div>
}
