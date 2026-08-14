'use client'

import { useEffect, useState } from 'react'
import styles from './landing.module.css'

type Scene = {
  kind: 'video' | 'image'
  src: string
  poster?: string
  label: string
  detail: string
}

const scenes: Scene[] = [
  {
    kind: 'video',
    src: 'https://videos.pexels.com/video-files/4121754/4121754-uhd_3840_2160_25fps.mp4',
    poster: 'https://images.pexels.com/videos/4121754/barcode-buying-cashier-consumerism-4121754.jpeg?auto=compress&fit=crop&w=1800',
    label: 'Comercios de cercanía',
    detail: 'Cobro ágil y control diario',
  },
  {
    kind: 'video',
    src: 'https://videos.pexels.com/video-files/5103988/5103988-uhd_3840_2160_30fps.mp4',
    poster: 'https://images.pexels.com/videos/5103988/pexels-photo-5103988.jpeg?auto=compress&fit=crop&w=1800',
    label: 'Supermercados y almacenes',
    detail: 'Ventas, caja y stock en un mismo lugar',
  },
  {
    kind: 'video',
    src: 'https://videos.pexels.com/video-files/4292582/4292582-uhd_3840_2160_25fps.mp4',
    poster: 'https://images.pexels.com/videos/4292582/pexels-photo-4292582.jpeg?auto=compress&fit=crop&w=1800',
    label: 'Stock e inventario',
    detail: 'Control desde el salón y el celular',
  },
  {
    kind: 'image',
    src: 'https://images.pexels.com/videos/7697072/pexels-photo-7697072.jpeg?auto=compress&fit=crop&w=1800',
    label: 'Servicios',
    detail: 'También para peluquerías y negocios por atención',
  },
  {
    kind: 'image',
    src: 'https://images.pexels.com/videos/4824291/pexels-photo-4824291.jpeg?auto=compress&fit=crop&w=1800',
    label: 'Mueblerías y showrooms',
    detail: 'Productos, precios, clientes y ventas',
  },
]

const promoStyle = {
  position: 'absolute' as const,
  zIndex: 6,
  right: 38,
  top: 28,
  width: 300,
  padding: '14px 16px',
  borderRadius: 16,
  color: '#fff',
  background: 'rgba(9,15,20,.62)',
  border: '1px solid rgba(255,255,255,.2)',
  backdropFilter: 'blur(16px)',
  boxShadow: '0 18px 45px rgba(0,0,0,.22)',
}

export default function HeroMerchantRotator() {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const timer = window.setInterval(() => setCurrent((value) => (value + 1) % scenes.length), 6500)
    return () => window.clearInterval(timer)
  }, [])

  const scene = scenes[current]

  return (
    <div className={styles.heroMedia}>
      <div className={styles.heroMediaFrame} key={`${current}-${scene.src}`}>
        {scene.kind === 'video' ? (
          <video className={styles.heroMediaAsset} src={scene.src} poster={scene.poster} autoPlay muted playsInline loop preload="metadata" />
        ) : (
          <img className={styles.heroMediaAsset} src={scene.src} alt="Comerciante trabajando en su local" />
        )}
      </div>
      <div className={styles.heroMediaShade} />
      <div style={promoStyle}>
        <span style={{fontSize:8,fontWeight:900,letterSpacing:'.14em',color:'#78e2ae'}}>OFERTA DE LANZAMIENTO</span>
        <div style={{display:'flex',alignItems:'baseline',gap:10,marginTop:5}}><del style={{fontSize:16,color:'#adb8b3'}}>$39.900</del><strong style={{fontSize:28,letterSpacing:'-1px'}}>$14.900</strong><small style={{fontSize:9,color:'#cbd4d0'}}>/ mes</small></div>
        <p style={{fontSize:9,lineHeight:1.45,color:'#d4dcd8',margin:'5px 0 0'}}>Ahorrás $25.000 por mes durante tus primeros 3 meses.</p>
        <b style={{display:'block',fontSize:9,color:'#7ce3ae',marginTop:6}}>Además, empezás con 14 días gratis.</b>
      </div>
      <div className={styles.heroSceneCaption}><span>{scene.label}</span><strong>{scene.detail}</strong></div>
      <div className={styles.heroSceneRail} aria-label="Rubros que usan Comercio Lleno">
        {scenes.map((item, index) => (
          <button type="button" aria-label={`Ver ${item.label}`} aria-current={index === current ? 'true' : undefined} className={index === current ? styles.heroSceneActive : styles.heroSceneDot} onClick={() => setCurrent(index)} key={item.label} />
        ))}
      </div>
    </div>
  )
}
