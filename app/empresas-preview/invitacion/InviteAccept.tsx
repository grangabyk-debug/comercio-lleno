'use client'
import Link from 'next/link'
import {useSearchParams} from 'next/navigation'
import {useEffect,useState} from 'react'
import {cvAuthClient} from '../../cv-ia/cvAuth'

async function hash(v:string){const raw=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(v));return Array.from(new Uint8Array(raw),x=>x.toString(16).padStart(2,'0')).join('')}

export default function InviteAccept(){
 const p=useSearchParams(),token=p.get('token')||''
 const [state,setState]=useState<'checking'|'login'|'ready'|'done'|'error'>('checking'),[error,setError]=useState('')
 useEffect(()=>{cvAuthClient().auth.getSession().then(({data})=>setState(data.session?'ready':'login'))},[])
 async function accept(){setState('checking');try{if(!token)throw new Error('La invitación no es válida.');const h=await hash(token);const {data,error}=await cvAuthClient().rpc('pm_accept_company_invite',{p_token_hash:h});if(error||!data)throw error||new Error('No pudimos aceptar la invitación.');setState('done')}catch(e){setError(e instanceof Error?e.message:'No pudimos aceptar la invitación.');setState('error')}}
 const next=encodeURIComponent(`/empresas/invitacion?token=${token}`)
 return <section style={{maxWidth:680,margin:'0 auto',padding:'100px 20px 140px'}}><span style={{fontSize:10,fontWeight:900,letterSpacing:'.12em',color:'#63e4b7'}}>EQUIPO DE EMPRESA</span><h1 style={{fontSize:'clamp(42px,8vw,70px)',letterSpacing:'-.06em',lineHeight:.95}}>Tu acceso tiene un rol propio.</h1>{state==='checking'&&<p>Validando invitación…</p>}{state==='login'&&<><p>Ingresá con el mismo email al que llegó la invitación. Si todavía no tenés cuenta, creala gratis y volvé a este enlace.</p><Link href={`/acceso?rol=empresa&next=${next}`} style={{display:'inline-block',background:'#071827',color:'#fff',padding:'13px 16px',borderRadius:14,textDecoration:'none',fontWeight:900}}>Ingresar o crear cuenta</Link></>}{state==='ready'&&<><p>La invitación se vincula sólo si el email de tu cuenta coincide con el destinatario y todavía está vigente.</p><button onClick={accept} style={{border:0,background:'#d9ff59',color:'#071827',padding:'13px 17px',borderRadius:14,fontWeight:900,cursor:'pointer'}}>Aceptar invitación</button></>}{state==='done'&&<><p>Listo. Ya tenés acceso con el rol que te asignó la empresa.</p><Link href="/empresas/panel">Abrir panel →</Link></>}{state==='error'&&<><p style={{color:'#b1323c'}}>{error}</p><Link href="/empresas">Volver a Empresas</Link></>}</section>
}
