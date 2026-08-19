'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import styles from './FloatingWhatsApp.module.css'

const whatsappUrl='https://wa.me/5491140540970?text=Hola%2C%20quiero%20consultar%20por%20Comercio%20Lleno.'

export default function FloatingWhatsApp(){
  const pathname=usePathname()
  const[visible,setVisible]=useState(false)

  useEffect(()=>{
    const host=location.hostname.toLowerCase()
    const postula=host==='postulamejor.com'||host==='www.postulamejor.com'
    setVisible(pathname==='/'&&!postula)
  },[pathname])

  if(!visible)return null
  return <a
    className={styles.button}
    href={whatsappUrl}
    target="_blank"
    rel="noopener noreferrer"
    aria-label="Hablar por WhatsApp con Comercio Lleno"
    title="Hablar por WhatsApp"
  >
    <svg viewBox="0 0 32 32" aria-hidden="true">
      <path d="M16 4.25c-6.48 0-11.75 5.08-11.75 11.34 0 2.18.64 4.31 1.86 6.13L4 28l6.55-2.03A12 12 0 0 0 16 27.25c6.48 0 11.75-5.08 11.75-11.34S22.48 4.25 16 4.25Zm0 20.93c-1.76 0-3.47-.46-4.96-1.34l-.36-.21-3.89 1.21 1.27-3.69-.24-.37a9.24 9.24 0 0 1-1.49-5.03c0-5.1 4.34-9.25 9.67-9.25s9.67 4.15 9.67 9.25S21.33 25.18 16 25.18Z"/>
      <path d="M21.46 18.35c-.3-.14-1.75-.84-2.02-.93-.27-.09-.47-.14-.67.14-.2.28-.77.93-.94 1.12-.17.19-.35.21-.64.07-.3-.14-1.25-.45-2.38-1.43a9 9 0 0 1-1.65-1.98c-.17-.28-.02-.43.13-.57.13-.13.3-.33.44-.5.15-.16.2-.28.3-.47.1-.19.05-.35-.02-.5-.08-.14-.67-1.56-.91-2.14-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.35-.27.28-1.04 1-1.04 2.42s1.06 2.8 1.21 2.99c.15.19 2.09 3.08 5.06 4.32.71.3 1.26.48 1.69.61.71.22 1.36.19 1.87.12.57-.08 1.75-.7 2-1.37.25-.68.25-1.25.17-1.37-.07-.12-.27-.19-.57-.33Z"/>
    </svg>
  </a>
}
