'use client'

import { FormEvent,useEffect,useMemo,useRef,useState } from 'react'
import { createPortal } from 'react-dom'
import { readTenantSession } from '@/lib/comercio/session'
import { createStaffAdmin,loadTenantAdmin,removeBranchAssignment,saveBranch,setBranchAssignment,type BranchAdmin,type BranchAssignment,type StaffRole } from '@/lib/comercio/tenant-admin-api'
import type { StaffProfile } from '@/lib/comercio/api'
import type { UserPermissions } from '@/lib/comercio/types'
import styles from './branch-settings.module.css'

const roleLabels:Record<StaffRole,string>={seller:'Vendedor',manager:'Encargado',cashier:'Cajero',supervisor:'Supervisor'}
const roleDefaults:Record<StaffRole,UserPermissions>={
  seller:{can_sell:true,can_manage_customers:true,can_edit_customers:false,can_view_reports:false,can_open_close_cash:false,can_manage_stock:false,can_manage_finances:false},
  cashier:{can_sell:true,can_open_close_cash:true,can_manage_customers:true,can_view_reports:false,can_manage_stock:false,can_manage_finances:false},
  manager:{can_sell:true,can_open_close_cash:true,can_view_reports:true,can_manage_stock:true,can_edit_products:true,can_import_export_products:true,can_manage_suppliers:true,can_manage_purchases:true,can_manage_customers:true,can_edit_customers:true,can_manage_promotions:true,can_manage_finances:true},
  supervisor:{can_sell:true,can_open_close_cash:true,can_view_reports:true,can_manage_stock:true,can_edit_products:true,can_import_export_products:true,can_manage_suppliers:true,can_manage_purchases:true,can_manage_customers:true,can_edit_customers:true,can_manage_promotions:true,can_manage_finances:true,can_delete_sales:false,can_delete_customers:false},
}
const strongPassword=(v:string)=>v.length>=8&&/[A-Z]/.test(v)&&/\d/.test(v)&&/[^A-Za-z0-9]/.test(v)

function locateLegacyBranchArea(){
  const heading=Array.from(document.querySelectorAll('h3')).find(x=>(x.textContent||'').trim()==='Sucursales')
  if(!heading)return null
  const subhead=heading.parentElement?.parentElement as HTMLElement|null
  const list=subhead?.nextElementSibling as HTMLElement|null
  if(!subhead||!list)return null
  return{subhead,list}
}

export default function BranchSettingsRuntime(){
  const[host,setHost]=useState<HTMLElement|null>(null)
  const hidden=useRef<{subhead:HTMLElement;list:HTMLElement}|null>(null)
  useEffect(()=>{
    const locate=()=>{
      if(host&&document.contains(host))return
      const area=locateLegacyBranchArea()
      if(!area)return
      if(hidden.current&&hidden.current.subhead!==area.subhead){hidden.current.subhead.style.display='';hidden.current.list.style.display=''}
      area.subhead.style.display='none';area.list.style.display='none'
      hidden.current=area
      const mount=document.createElement('div');mount.dataset.branchSettingsRuntime='true';area.list.after(mount);setHost(mount)
    }
    locate()
    const observer=new MutationObserver(locate);observer.observe(document.body,{childList:true,subtree:true})
    return()=>{observer.disconnect();hidden.current?.subhead&&(hidden.current.subhead.style.display='');hidden.current?.list&&(hidden.current.list.style.display='');if(host?.isConnected)host.remove()}
  },[host])
  return host?createPortal(<BranchManager/>,host):null
}

function BranchManager(){
  const session=useMemo(()=>readTenantSession(),[])
  const[branches,setBranches]=useState<BranchAdmin[]>([]),[staff,setStaff]=useState<StaffProfile[]>([]),[assignments,setAssignments]=useState<BranchAssignment[]>([])
  const[loading,setLoading]=useState(true),[error,setError]=useState(''),[createOpen,setCreateOpen]=useState(false),[manageId,setManageId]=useState<string|null>(null)
  const admin=Boolean(session&&(session.role==='owner'||session.role==='supervisor'))
  async function reload(){if(!session)return;setLoading(true);setError('');try{const data=await loadTenantAdmin(session);setBranches(data.branches||[]);setStaff(data.staff||[]);setAssignments(data.assignments||[])}catch(e){setError(e instanceof Error?e.message:String(e))}finally{setLoading(false)}}
  useEffect(()=>{void reload()},[session?.companyId])
  if(!session)return null
  const active=[...branches].sort((a,b)=>Number(b.is_primary)-Number(a.is_primary)||String(a.created_at||'').localeCompare(String(b.created_at||'')))

  return <section className={styles.branchSection}>
    <div className={styles.sectionHead}>
      <div className={styles.sectionCopy}><span className={styles.eyebrow}>LOCALES Y ACCESOS</span><h3>Sucursales</h3><p>Administrá cada local y definí quién puede trabajar en cada uno.</p></div>
      <div className={styles.sectionActions}><span className={styles.counter}><b>{active.length}</b><small>de 5 sucursales</small></span>{admin&&<button type="button" disabled={active.length>=5} onClick={()=>setCreateOpen(true)}>Agregar sucursal</button>}</div>
    </div>

    <div className={styles.planNote}>
      <span className={styles.planNumber}>2</span>
      <div><b>Dos sucursales están incluidas sin costo extra.</b><span>Desde la tercera se aplica un costo adicional. Productos y carga de stock siguen siendo ilimitados. Máximo 5 sucursales por comercio.</span></div>
    </div>

    {error&&<div className={styles.error}>{error}</div>}
    {loading?<div className={styles.empty}>Cargando sucursales…</div>:<div className={styles.branchList}>{active.map((branch,index)=>{
      const assigned=assignments.filter(a=>a.branch_id===branch.id&&a.active)
      const complete=assigned.length>0
      return <article className={styles.branchItem} key={branch.id}>
        <div className={styles.branchMain}>
          <div className={styles.badgeRow}><span className={branch.is_primary?styles.primaryBadge:styles.branchBadge}>{branch.is_primary?'Principal':`Sucursal ${index+1}`}</span><span className={index<2?styles.included:styles.extra}>{index<2?'Incluida':'Adicional'}</span></div>
          <h4>{branch.name}</h4>
          <p>{branch.address||'Dirección pendiente'}</p>
        </div>

        <div className={styles.branchTeam}>
          <span className={styles.teamLabel}>Personas con acceso</span>
          {assigned.length?<div className={styles.people}>{assigned.slice(0,3).map(a=>{const person=staff.find(s=>s.id===a.profile_id);return <span key={a.profile_id}><b>{person?.full_name||person?.username||'Usuario'}</b><small>{roleLabels[a.role]||a.role}</small></span>})}{assigned.length>3&&<span className={styles.morePeople}>+{assigned.length-3}</span>}</div>:<div className={styles.noPeople}><b>Sin personas asignadas</b><span>Asigná un usuario para terminar la configuración.</span></div>}
        </div>

        <div className={styles.branchControl}>
          <span className={complete?styles.ready:styles.pending}>{complete?'Configurada':'Falta configurar'}</span>
          {admin?<button type="button" className={complete?styles.secondary:styles.primaryAction} onClick={()=>setManageId(branch.id)}>{complete?'Administrar':'Terminar configuración'}</button>:<small>Acceso definido por el propietario o supervisor.</small>}
        </div>
      </article>
    })}</div>}

    {createOpen&&<CreateBranch session={session} index={active.length} close={()=>setCreateOpen(false)} saved={async()=>{setCreateOpen(false);await reload()}}/>}
    {manageId&&<ManageBranch session={session} branch={active.find(x=>x.id===manageId)!} staff={staff} assignments={assignments.filter(a=>a.branch_id===manageId&&a.active)} close={()=>setManageId(null)} saved={reload}/>} 
  </section>
}

function CreateBranch({session,index,close,saved}:{session:NonNullable<ReturnType<typeof readTenantSession>>;index:number;close:()=>void;saved:()=>Promise<void>}){
  const[name,setName]=useState(''),[address,setAddress]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState('')
  async function submit(e:FormEvent){e.preventDefault();setBusy(true);setError('');try{await saveBranch(session,{name,address,is_primary:false});await saved()}catch(e){setError(e instanceof Error?e.message:String(e));setBusy(false)}}
  const extra=index>=2
  return <div className={styles.modal} onMouseDown={e=>e.currentTarget===e.target&&close()}><form className={styles.modalBox} onSubmit={submit}><header><div><span>NUEVA SUCURSAL</span><h3>Agregar local</h3></div><button type="button" onClick={close}>×</button></header>{extra&&<div className={styles.extraNotice}><b>Sucursal adicional</b><span>Las primeras 2 están incluidas. Esta sucursal tendrá un costo adicional, todavía sin monto definido.</span></div>}<label>Nombre de la sucursal<input autoFocus required value={name} onChange={e=>setName(e.target.value)} placeholder="Ej: Sucursal Centro"/></label><label>Dirección<input value={address} onChange={e=>setAddress(e.target.value)} placeholder="Opcional"/></label>{error&&<div className={styles.error}>{error}</div>}<footer><button type="button" onClick={close}>Cancelar</button><button className={styles.save} disabled={busy}>{busy?'Creando…':'Crear sucursal'}</button></footer></form></div>
}

function ManageBranch({session,branch,staff,assignments,close,saved}:{session:NonNullable<ReturnType<typeof readTenantSession>>;branch:BranchAdmin;staff:StaffProfile[];assignments:BranchAssignment[];close:()=>void;saved:()=>Promise<void>}){
  const[name,setName]=useState(branch.name),[address,setAddress]=useState(branch.address||''),[person,setPerson]=useState(''),[role,setRole]=useState<StaffRole>('cashier')
  const[newMode,setNewMode]=useState(false),[newName,setNewName]=useState(''),[username,setUsername]=useState(''),[password,setPassword]=useState(''),[newRole,setNewRole]=useState<StaffRole>('cashier')
  const[busy,setBusy]=useState(false),[error,setError]=useState('')
  const available=staff.filter(s=>s.active!==false&&s.role!=='owner'&&s.role!=='supervisor'&&!assignments.some(a=>a.profile_id===s.id))
  async function saveDetails(){setBusy(true);setError('');try{await saveBranch(session,{...branch,name,address});await saved()}catch(e){setError(e instanceof Error?e.message:String(e))}finally{setBusy(false)}}
  async function assignExisting(){if(!person)return;setBusy(true);setError('');try{await setBranchAssignment(session,{profile_id:person,branch_id:branch.id,role,permissions:roleDefaults[role]});setPerson('');await saved()}catch(e){setError(e instanceof Error?e.message:String(e))}finally{setBusy(false)}}
  async function createNew(e:FormEvent){e.preventDefault();if(!strongPassword(password)){setError('La contraseña debe tener mínimo 8 caracteres, una mayúscula, un número y un signo especial.');return}setBusy(true);setError('');try{await createStaffAdmin(session,{username,password,full_name:newName,role:newRole,permissions:roleDefaults[newRole],branch_id:branch.id});setNewMode(false);setNewName('');setUsername('');setPassword('');await saved()}catch(e){setError(e instanceof Error?e.message:String(e))}finally{setBusy(false)}}
  return <div className={styles.modal} onMouseDown={e=>e.currentTarget===e.target&&close()}><div className={`${styles.modalBox} ${styles.wide}`}><header><div><span>CONFIGURAR SUCURSAL</span><h3>{branch.name}</h3></div><button type="button" onClick={close}>×</button></header>
    <div className={styles.twoCols}><label>Nombre<input value={name} onChange={e=>setName(e.target.value)}/></label><label>Dirección<input value={address} onChange={e=>setAddress(e.target.value)}/></label></div><div className={styles.inlineSave}><span>Datos visibles de esta sucursal.</span><button disabled={busy} onClick={()=>void saveDetails()}>Guardar datos</button></div>
    <div className={styles.sectionTitle}><div><h4>Personas con acceso</h4><p>Un mismo usuario puede trabajar en varias sucursales con roles diferentes.</p></div><button onClick={()=>setNewMode(v=>!v)}>{newMode?'Usar existente':'+ Crear usuario'}</button></div>
    <div className={styles.assigned}>{assignments.length?assignments.map(a=>{const s=staff.find(x=>x.id===a.profile_id);return <div key={a.profile_id}><span><b>{s?.full_name||s?.username||'Usuario'}</b><small>{s?.username||''}</small></span><strong>{roleLabels[a.role]||a.role}</strong><button onClick={async()=>{if(confirm('¿Quitar el acceso de esta persona a la sucursal?')){setBusy(true);try{await removeBranchAssignment(session,a.profile_id,branch.id);await saved()}catch(e){setError(e instanceof Error?e.message:String(e))}finally{setBusy(false)}}}}>Quitar</button></div>}):<div className={styles.empty}>Asigná al menos una persona para terminar de configurar la sucursal.</div>}</div>
    {!newMode?<div className={styles.assignBox}><label>Usuario existente<select value={person} onChange={e=>setPerson(e.target.value)}><option value="">Seleccionar…</option>{available.map(s=><option key={s.id} value={s.id}>{s.full_name||s.username}</option>)}</select></label><label>Rol<select value={role} onChange={e=>setRole(e.target.value as StaffRole)}>{Object.entries(roleLabels).filter(([v])=>v!=='supervisor').map(([v,l])=><option value={v} key={v}>{l}</option>)}</select></label><button disabled={busy||!person} onClick={()=>void assignExisting()}>Asignar a sucursal</button>{!available.length&&<small>No quedan usuarios sin asignar. Podés crear uno nuevo.</small>}</div>:<form className={styles.assignBox} onSubmit={createNew}><label>Nombre<input value={newName} onChange={e=>setNewName(e.target.value)} placeholder="Nombre de la persona"/></label><label>Usuario<input required value={username} onChange={e=>setUsername(e.target.value)} placeholder="ej: caja2"/></label><label>Contraseña<input required type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="8+ · Mayúscula · número · signo"/></label><label>Rol<select value={newRole} onChange={e=>setNewRole(e.target.value as StaffRole)}>{Object.entries(roleLabels).map(([v,l])=><option value={v} key={v}>{l}</option>)}</select></label><button disabled={busy||!username.trim()||!strongPassword(password)}>Crear y asignar</button></form>}
    {error&&<div className={styles.error}>{error}</div>}<footer><span/><button className={styles.save} onClick={close}>Listo</button></footer>
  </div></div>
}
