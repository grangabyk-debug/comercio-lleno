'use client'

import { useEffect, useState } from 'react'
import { cvAuthClient } from './cvAuth'

export default function AuthStatusLink(){
  const [logged,setLogged]=useState(false)
  useEffect(()=>{
    const client=cvAuthClient()
    client.auth.getSession().then(({data})=>setLogged(!!data.session))
    const {data}=client.auth.onAuthStateChange((_event,session)=>setLogged(!!session))
    return()=>data.subscription.unsubscribe()
  },[])
  return <a href={logged?'/cuenta':'/cuenta?modo=ingresar'} className="postulaAccountLink">{logged?'Mi cuenta':'Iniciar sesión'}</a>
}
