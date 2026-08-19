'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import styles from './LegalServiceActions.module.css'

const publicPaths=['/','/landing','/prueba-gratis','/soluciones','/terminos','/privacidad','/politica-de-privacidad','/politica-de-cookies']

export default function LegalServiceActions(){
  const pathname=usePathname()
  const[allowedHost,setAllowedHost]=useState(false)
  useEffect(()=>{
    const host=location.hostname.toLowerCase()
    setAllowedHost(host!=='postulamejor.com'&&host!=='www.postulamejor.com')
  },[])
  const visible=publicPaths.some(path=>path==='/'?pathname==='/':pathname===path||pathname.startsWith(`${path}/`))
  if(!allowedHost||!visible||pathname==='/gestionar-servicio')return null

  return <aside className={styles.wrap} aria-label="Gestiones de servicio">
    <Link href="/gestionar-servicio?tipo=arrepentimiento">BOTÓN DE ARREPENTIMIENTO</Link>
    <Link href="/gestionar-servicio?tipo=baja">BOTÓN DE BAJA DE SERVICIO</Link>
  </aside>
}
