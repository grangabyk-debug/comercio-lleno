'use client'

import { FormEvent, useMemo, useState } from 'react'
import core from './page.module.css'
import parity from './parity.module.css'
import styles from './management.module.css'
import { createCustomer } from '@/lib/comercio/api'
import { deleteCustomer, updateCustomer } from '@/lib/comercio/customer-ops'
import type { CommerceSnapshot, Customer, TenantSession } from '@/lib/comercio/types'

const customerGrid = { gridTemplateColumns: '1.25fr .9fr 1.35fr .9fr 1fr' }

export default function CustomersEnhanced({data,session,refresh,message}:{data:CommerceSnapshot;session:TenantSession;refresh:()=>Promise<void>;message:(m:string)=>void}) {
  const [q,setQ]=useState('')
  const [show,setShow]=useState(false)
  const [edit,setEdit]=useState<Customer|null>(null)
  const [name,setName]=useState('')
  const [phone,setPhone]=useState('')
  const [email,setEmail]=useState('')
  const [tax,setTax]=useState('')
  const [busy,setBusy]=useState(false)
  const [dir,setDir]=useState<'asc'|'desc'>('asc')

  const rows=useMemo(()=>data.customers
    .filter(c=>`${c.name} ${c.phone||''} ${c.email||''} ${c.tax_id||''}`.toLowerCase().includes(q.toLowerCase()))
    .sort((a,b)=>dir==='asc'?a.name.localeCompare(b.name,'es',{sensitivity:'base'}):b.name.localeCompare(a.name,'es',{sensitivity:'base'})),[data.customers,q,dir])

  async function submit(e:FormEvent){
    e.preventDefault(); if(!name.trim())return
    setBusy(true)
    try{
      await createCustomer(session,{name:name.trim(),phone,email,tax_id:tax})
      setName('');setPhone('');setEmail('');setTax('');setShow(false)
      await refresh();message('Cliente agregado.')
    }catch(e){message(e instanceof Error?e.message:String(e))}finally{setBusy(false)}
  }

  async function saveEdit(e:FormEvent){
    e.preventDefault(); if(!edit)return
    setBusy(true)
    try{await updateCustomer(session,edit);setEdit(null);await refresh();message('Cliente actualizado.')}catch(e){message(e instanceof Error?e.message:String(e))}finally{setBusy(false)}
  }

  async function remove(c:Customer){
    if(!window.confirm(`¿Desea eliminar al cliente ${c.name}?`))return
    setBusy(true)
    try{await deleteCustomer(session,c.id);if(edit?.id===c.id)setEdit(null);await refresh();message('Cliente eliminado.')}catch(e){message(e instanceof Error?e.message:String(e))}finally{setBusy(false)}
  }

  return <>
    <div className={core.pageHead}><div><div className={core.eyebrow}>GESTIÓN</div><h1>Clientes</h1><p>{data.customers.length} contactos asociados al comercio.</p></div><button className={core.primary} onClick={()=>setShow(x=>!x)}>+ Agregar cliente</button></div>
    {show&&<form className={parity.customerForm} onSubmit={submit}><input placeholder="Nombre" value={name} onChange={e=>setName(e.target.value)}/><input placeholder="Teléfono" value={phone} onChange={e=>setPhone(e.target.value)}/><input placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)}/><input placeholder="CUIT / DNI" value={tax} onChange={e=>setTax(e.target.value)}/><button disabled={busy}>{busy?'Guardando…':'Guardar'}</button></form>}
    <div className={core.tableTools}><div className={core.searchSlim}><span>⌕</span><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Buscar nombre, teléfono, email o CUIT…"/></div></div>
    <div className={`${core.table} ${core.customerTable}`}>
      <div className={`${core.tableRow} ${core.tableHead}`} style={customerGrid}><span><button type="button" onClick={()=>setDir(d=>d==='asc'?'desc':'asc')} style={{border:0,background:'transparent',padding:0,font:'inherit',fontWeight:800,cursor:'pointer',color:'inherit'}}>Nombre {dir==='asc'?'↑':'↓'}</button></span><span>Teléfono</span><span>Email</span><span>CUIT/DNI</span><span>Acciones</span></div>
      {rows.map(c=><div className={core.tableRow} style={customerGrid} key={c.id}><span><b>{c.name}</b></span><span>{c.phone||'—'}</span><span>{c.email||'—'}</span><span>{c.tax_id||'—'}</span><span style={{display:'flex',gap:8,flexWrap:'wrap'}}><button className={core.secondary} onClick={()=>setEdit({...c})}>Editar</button><button className={core.ghostDanger} disabled={busy} onClick={()=>void remove(c)}>Eliminar</button></span></div>)}
    </div>

    {edit&&<div className={styles.modal} onMouseDown={e=>e.currentTarget===e.target&&setEdit(null)}><form className={styles.modalCard} onSubmit={saveEdit}><div className={styles.modalHead}><div><span>CLIENTE</span><h2>Editar cliente</h2></div><button type="button" onClick={()=>setEdit(null)}>×</button></div><div className={styles.formGrid}><label>Nombre<input value={edit.name} onChange={e=>setEdit({...edit,name:e.target.value})}/></label><label>Teléfono<input value={edit.phone||''} onChange={e=>setEdit({...edit,phone:e.target.value})}/></label><label>Email<input value={edit.email||''} onChange={e=>setEdit({...edit,email:e.target.value})}/></label><label>CUIT / DNI<input value={edit.tax_id||''} onChange={e=>setEdit({...edit,tax_id:e.target.value})}/></label></div><div className={styles.modalActions}><button type="button" onClick={()=>setEdit(null)}>Cancelar</button><button className={styles.save} disabled={busy}>{busy?'Guardando…':'Guardar cambios'}</button></div></form></div>}
  </>
}
