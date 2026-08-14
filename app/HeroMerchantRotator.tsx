'use client'

import { useEffect, useState } from 'react'
import styles from './landing.module.css'

type Scene = {
  kind: 'video' | 'image'
  src: string
  poster?: string
  label: string
  detail: string
  credit: string
}

const scenes: Scene[] = [
  {
    kind: 'video',
    src: 'https://videos.pexels.com/video-files/6539945/6539945-uhd_3840_2160_25fps.mp4',
    poster: 'https://images.pexels.com/videos/6539945/free-video-6539945.jpg?auto=compress&fit=crop&w=1800',
    label: 'Comercios de cercanía',
    detail: 'Cobro ágil y control diario',
    credit: 'Pexels',
  },
  {
    kind: 'video',
    src: 'https://videos.pexels.com/video-files/13061609/13061609-hd_1920_1080_60fps.mp4',
    poster: 'https://images.pexels.com/videos/13061609/buying-cashier-check-out-chocolate-store-13061609.jpeg?auto=compress&fit=crop&w=1800',
    label: 'Panaderías y locales',
    detail: 'Ventas, caja y stock en un mismo lugar',
    credit: 'Pexels',
  },
  {
    kind: 'video',
    src: 'https://videos.pexels.com/video-files/5103992/5103992-uhd_3840_2160_30fps.mp4',
    poster: 'https://images.pexels.com/videos/5103992/pexels-photo-5103992.jpeg?auto=compress&fit=crop&w=1800',
    label: 'Stock e inventario',
    detail: 'Control desde el salón y el celular',
    credit: 'Pexels',
  },
  {
    kind: 'image',
    src: 'https://images.pexels.com/videos/7697072/pexels-photo-7697072.jpeg?auto=compress&fit=crop&w=1800',
    label: 'Servicios',
    detail: 'También para peluquerías y negocios por atención',
    credit: 'Pexels',
  },
  {
    kind: 'image',
    src: 'https://images.pexels.com/videos/4824291/pexels-photo-4824291.jpeg?auto=compress&fit=crop&w=1800',
    label: 'Mueblerías y showrooms',
    detail: 'Productos, precios, clientes y ventas',
    credit: 'Pexels',
  },
]

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
          <video
            className={styles.heroMediaAsset}
            src={scene.src}
            poster={scene.poster}
            autoPlay
            muted
            playsInline
            loop
            preload="metadata"
          />
        ) : (
          <img className={styles.heroMediaAsset} src={scene.src} alt="Comerciante trabajando en su local" />
        )}
      </div>
      <div className={styles.heroMediaShade} />
      <div className={styles.heroSceneCaption}>
        <span>{scene.label}</span>
        <strong>{scene.detail}</strong>
      </div>
      <div className={styles.heroSceneRail} aria-label="Rubros que usan Comercio Lleno">
        {scenes.map((item, index) => (
          <button
            type="button"
            aria-label={`Ver ${item.label}`}
            aria-current={index === current ? 'true' : undefined}
            className={index === current ? styles.heroSceneActive : styles.heroSceneDot}
            onClick={() => setCurrent(index)}
            key={item.label}
          />
        ))}
      </div>
    </div>
  )
}
