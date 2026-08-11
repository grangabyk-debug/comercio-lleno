'use client'

import { useEffect } from 'react'

export default function LoginPage() {
  useEffect(() => {
    window.location.replace('/redesign/access')
  }, [])
  return <main style={{minHeight:'100vh',display:'grid',placeItems:'center',fontFamily:'system-ui',background:'#f4f7f6',color:'#17231d'}}>Abriendo acceso seguro de Comercio Lleno…</main>
}
