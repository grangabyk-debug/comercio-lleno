'use client'

import {useMemo,useState} from 'react'
import styles from './preview-sucursales.module.css'

type Role='Propietario'|'Supervisor'|'Encargado'|'Cajero'|'Vendedor'
type Branch={id:number;name:string;address:string;configured:boolean;included:boolean}
type Person={id:number;name:string;user:string;role:Role;branches:number[]}

const initialBranches:Branch[]=[
  {id:1,name:'Sucursal Centro',address:'Av. Mitre 1234 · Berazategui',configured:true,included:true},
  {id:2,name:'Sucursal Hudson',address:'Calle 52 740 · Hudson',configured:false,included:true},
]

const initialPeople:Person[]=[
  {id:1,name:'Gabriel',user:'gabriel',role:'Propietario',branches:[1,2]},
  {id:2,name:'Martina López',user:'martina',role:'Supervisor',branches:[1,2]},
  {id:3,name:'Juan Pérez',user:'juan.perez',role:'Encargado',branches:[1]},
  {id:4,name:'Sofía Gómez',user:'sofia.g',role:'Cajero',branches:[1]},
  {id:5,name:'Tomás Ruiz',user:'tomas.r',role:'Vendedor',branches:[2]},
]

const nav=['Inicio','Ventas','Caja','Productos','Stock','Clientes','Reportes','Configuración']
const roles:Role[]=['Supervisor','Encargado','Cajero','Vendedor']

export default function PreviewSucursales(){
  const[branches,setBranches]=useState(initialBranches)
  const[people,setPeople]=useState(initialPeople)
  const[currentBranch,setCurrentBranch]=useState(1)
  const[branchMenu,setBranchMenu]=useState(false)
  const[activeView,setActiveView]=useState<'dashboard'|'settings'>('settings')
  const[selectedBranch,setSelectedBranch]=useState<number|null>(2)
  const[modal,setModal]=useState<'existing'|'new'|'extra'|null>(null)
  const[role,setRole]=useState<Role>('Encargado')
  const[selectedPerson,setSelectedPerson]=useState(3)
  const[toast,setToast]=useState('')

  const branch=branches.find(item=>item.id===currentBranch)??branches[0]
  const configBranch=branches.find(item=>item.id===selectedBranch)??branches[0]
  const branchPeople=people.filter(person=>person.branches.includes(configBranch.id))
  const includedCount=Math.min(branches.length,2)
  const canAdd=branches.length<5

  const stats=useMemo(()=>currentBranch===1
    ? [{label:'Ventas de hoy',value:'$ 284.500',delta:'+12%'},{label:'Caja',value:'Abierta',delta:'Turno mañana'},{label:'Stock bajo',value:'8',delta:'productos'},{label:'Clientes hoy',value:'47',delta:'+6'}]
    : [{label:'Ventas de hoy',value:'$ 96.300',delta:'+4%'},{label:'Caja',value:'Abierta',delta:'Turno tarde'},{label:'Stock bajo',value:'3',delta:'productos'},{label:'Clientes hoy',value:'19',delta:'+2'}]
  ,[currentBranch])

  function flash(message:string){setToast(message);window.setTimeout(()=>setToast(''),2400)}

  function assignExisting(){
    setPeople(rows=>rows.map(person=>person.id===selectedPerson&&!person.branches.includes(configBranch.id)?{...person,role,branches:[...person.branches,configBranch.id]}:person))
    setModal(null);flash('Usuario asignado a la sucursal en este preview.')
  }

  function createDemoUser(){
    const id=Math.max(...people.map(person=>person.id))+1
    setPeople(rows=>[...rows,{id,name:'Nuevo usuario',user:'nuevo.usuario',role,branches:[configBranch.id]}])
    setModal(null);flash('Usuario de ejemplo creado y asignado.')
  }

  function finishBranch(){
    setBranches(rows=>rows.map(item=>item.id===configBranch.id?{...item,configured:true}:item))
    flash('Sucursal marcada como configurada.')
  }

  function addExtraBranch(){
    if(!canAdd)return
    if(branches.length>=2){setModal('extra');return}
    const id=branches.length+1
    setBranches(rows=>[...rows,{id,name:`Sucursal ${id}`,address:'Dirección pendiente',configured:false,included:true}])
    setSelectedBranch(id)
  }

  function confirmExtra(){
    const id=branches.length+1
    setBranches(rows=>[...rows,{id,name:`Sucursal ${id}`,address:'Dirección pendiente',configured:false,included:false}])
    setSelectedBranch(id);setModal(null);flash('Sucursal adicional agregada al preview.')
  }

  return <div className={styles.page}>
    <aside className={styles.sidebar}>
      <div className={styles.brand}><span>CL</span><div><b>Comercio Lleno</b><small>Preview sucursales</small></div></div>
      <nav>{nav.map(item=><button key={item} onClick={()=>{if(item==='Configuración')setActiveView('settings');else if(item==='Inicio')setActiveView('dashboard')}} className={(item==='Configuración'&&activeView==='settings')||(item==='Inicio'&&activeView==='dashboard')?styles.navActive:''}><i>{item==='Inicio'?'⌂':item==='Configuración'?'⚙':'•'}</i>{item}</button>)}</nav>
      <div className={styles.planCard}><small>PLAN MULTISUCURSAL</small><b>{branches.length}/5 sucursales</b><span>{includedCount}/2 incluidas sin costo</span><div className={styles.progress}><i style={{width:`${branches.length/5*100}%`}}/></div></div>
    </aside>

    <main className={styles.main}>
      <header className={styles.topbar}>
        <div className={styles.mobileBrand}>Comercio Lleno</div>
        <div className={styles.branchWrap}>
          <span className={styles.branchCaption}>Sucursal operativa</span>
          <button className={styles.branchButton} onClick={()=>setBranchMenu(value=>!value)}><span className={styles.pin}>⌖</span><div><b>{branch.name}</b><small>{branch.address}</small></div><strong>⌄</strong></button>
          {branchMenu&&<div className={styles.branchMenu}>
            <div className={styles.menuTitle}><b>Elegir sucursal</b><span>Propietario · acceso total</span></div>
            {branches.map(item=><button key={item.id} onClick={()=>{setCurrentBranch(item.id);setBranchMenu(false);flash(`Ahora estás operando ${item.name}.`)}} className={item.id===currentBranch?styles.branchSelected:''}><span>{item.id===currentBranch?'✓':'○'}</span><div><b>{item.name}</b><small>{item.address}</small></div>{!item.configured&&<em>Falta configurar</em>}</button>)}
            <button className={styles.manageShortcut} onClick={()=>{setActiveView('settings');setBranchMenu(false)}}>⚙ Administrar sucursales</button>
          </div>}
        </div>
        <div className={styles.user}><span>G</span><div><b>Gabriel</b><small>Propietario</small></div></div>
      </header>

      {toast&&<div className={styles.toast}>✓ {toast}</div>}

      {activeView==='dashboard'?<section className={styles.content}>
        <div className={styles.hero}><div><small>DASHBOARD · {branch.name.toUpperCase()}</small><h1>Resumen de la sucursal</h1><p>Todos los números y operaciones cambian al seleccionar otra sucursal.</p></div><button onClick={()=>setBranchMenu(true)}>Cambiar sucursal</button></div>
        <div className={styles.stats}>{stats.map(item=><article key={item.label}><small>{item.label}</small><b>{item.value}</b><span>{item.delta}</span></article>)}</div>
        <div className={styles.dashboardGrid}><article><div className={styles.cardHead}><b>Actividad de hoy</b><span>En vivo</span></div><div className={styles.chart}><i/><i/><i/><i/><i/><i/><i/><i/></div></article><article><div className={styles.cardHead}><b>Contexto actual</b><span>{branch.name}</span></div><div className={styles.context}><p><strong>Ventas, caja y stock</strong><span>Filtrados por esta sucursal</span></p><p><strong>Usuarios con acceso</strong><span>{people.filter(person=>person.branches.includes(branch.id)).length} personas</span></p><p><strong>Estado</strong><span>{branch.configured?'Configurada':'Falta terminar configuración'}</span></p></div></article></div>
      </section>:<section className={styles.content}>
        <div className={styles.hero}><div><small>CONFIGURACIÓN · SUCURSALES</small><h1>Administrá tus sucursales</h1><p>El propietario y el supervisor pueden crear sucursales, asignar personas y definir el rol de acceso.</p></div><button onClick={addExtraBranch} disabled={!canAdd}>+ Nueva sucursal</button></div>

        <div className={styles.billingStrip}><div><span>✓</span><p><b>2 sucursales incluidas</b><small>Las primeras dos no tienen costo adicional.</small></p></div><div><span>+</span><p><b>Sucursales 3 a 5</b><small>Requieren habilitar un adicional. El monto se definirá más adelante.</small></p></div><div><span>5</span><p><b>Máximo por comercio</b><small>Hasta cinco sucursales por empresa.</small></p></div></div>

        <div className={styles.settingsLayout}>
          <section className={styles.branchList}>
            <div className={styles.sectionTitle}><div><b>Mis sucursales</b><small>{branches.length} creadas · {includedCount} incluidas</small></div></div>
            {branches.map((item,index)=><button key={item.id} onClick={()=>setSelectedBranch(item.id)} className={item.id===configBranch.id?styles.configSelected:''}>
              <span className={styles.branchNumber}>{index+1}</span><div><b>{item.name}</b><small>{item.address}</small><em className={item.configured?styles.complete:styles.pending}>{item.configured?'✓ Configurada':'! Terminar configuración'}</em></div><strong>{index<2?'Incluida':'Adicional'}</strong>
            </button>)}
            {branches.length<5&&<button className={styles.addBranchCard} onClick={addExtraBranch}>+ Agregar sucursal <small>{branches.length>=2?'Requiere adicional':'Incluida en tu plan'}</small></button>}
          </section>

          <section className={styles.configPanel}>
            <div className={styles.configHeader}><div><span className={configBranch.configured?styles.okDot:styles.warnDot}/><div><small>SUCURSAL {configBranch.id}</small><h2>{configBranch.name}</h2><p>{configBranch.address}</p></div></div><em className={configBranch.configured?styles.completeBadge:styles.pendingBadge}>{configBranch.configured?'Configurada':'Falta terminar'}</em></div>

            {!configBranch.configured&&<div className={styles.setupBanner}><span>1</span><div><b>Terminá de configurar tu sucursal</b><p>Asigná al menos una persona con un rol operativo. Podés reutilizar un usuario existente o crear uno nuevo.</p></div></div>}

            <div className={styles.personSection}>
              <div className={styles.personHead}><div><b>Personas con acceso</b><small>Solo verán esta sucursal si no tienen otras asignadas.</small></div><div><button onClick={()=>setModal('existing')}>Asignar existente</button><button className={styles.primarySmall} onClick={()=>setModal('new')}>+ Nuevo usuario</button></div></div>
              <div className={styles.peopleTable}>
                <div className={styles.tableHeader}><span>Persona</span><span>Rol</span><span>Acceso a sucursales</span><span/></div>
                {branchPeople.map(person=><div className={styles.personRow} key={person.id}><span><i>{person.name.charAt(0)}</i><div><b>{person.name}</b><small>@{person.user}</small></div></span><span><em>{person.role}</em></span><span>{person.branches.length===1?configBranch.name:`${person.branches.length} sucursales`}</span><button>•••</button></div>)}
              </div>
            </div>

            <div className={styles.permissionBox}><b>Permisos de administración</b><div><span>✓ <strong>Propietario</strong> — ve y administra todas las sucursales.</span><span>✓ <strong>Supervisor</strong> — puede crear/configurar sucursales y usuarios.</span><span>• <strong>Encargado, Cajero y Vendedor</strong> — solo ven las sucursales que tienen asignadas.</span></div></div>

            {!configBranch.configured&&<div className={styles.finishBar}><div><b>¿La sucursal ya tiene una persona asignada?</b><span>Guardá la configuración para dejarla operativa.</span></div><button disabled={!branchPeople.length} onClick={finishBranch}>Terminar configuración</button></div>}
          </section>
        </div>
      </section>}
    </main>

    {modal&&<div className={styles.overlay} onMouseDown={event=>{if(event.target===event.currentTarget)setModal(null)}}><div className={styles.modal}>
      {modal==='extra'?<><div className={styles.modalIcon}>+</div><h2>Sucursal adicional</h2><p>Tu plan incluye hasta <b>2 sucursales sin costo adicional</b>. La sucursal {branches.length+1} requiere habilitar un adicional.</p><div className={styles.pricePending}><span>Adicional por sucursal</span><b>Precio a definir</b></div><small>Podés tener hasta 5 sucursales en total.</small><div className={styles.modalActions}><button onClick={()=>setModal(null)}>Cancelar</button><button className={styles.modalPrimary} onClick={confirmExtra}>Continuar con sucursal {branches.length+1}</button></div></>:
      <><div className={styles.modalTop}><div><small>{modal==='existing'?'ASIGNAR PERSONA':'NUEVO USUARIO'}</small><h2>{modal==='existing'?'Usar un usuario existente':'Crear usuario para esta sucursal'}</h2><p>{configBranch.name}</p></div><button onClick={()=>setModal(null)}>×</button></div>
      {modal==='existing'?<div className={styles.form}><label>Elegí una persona<select value={selectedPerson} onChange={event=>setSelectedPerson(Number(event.target.value))}>{people.filter(person=>!person.branches.includes(configBranch.id)&&!['Propietario'].includes(person.role)).map(person=><option key={person.id} value={person.id}>{person.name} · actualmente {person.role}</option>)}</select></label><label>Rol en esta sucursal<select value={role} onChange={event=>setRole(event.target.value as Role)}>{roles.map(item=><option key={item}>{item}</option>)}</select></label><div className={styles.tip}>La misma cuenta y contraseña funcionarán en ambas sucursales. Al iniciar sesión podrá elegir a cuál entrar.</div><button className={styles.modalPrimary} onClick={assignExisting}>Asignar a {configBranch.name}</button></div>:
      <div className={styles.form}><div className={styles.twoCols}><label>Nombre<input defaultValue="Nuevo empleado"/></label><label>Rol<select value={role} onChange={event=>setRole(event.target.value as Role)}>{roles.map(item=><option key={item}>{item}</option>)}</select></label></div><label>Usuario<input defaultValue="nuevo.usuario"/></label><label>Contraseña<input type="password" defaultValue="comercio123"/></label><div className={styles.tip}>Este usuario quedará asignado inicialmente solo a <b>{configBranch.name}</b>. Después podés darle acceso a otras sucursales.</div><button className={styles.modalPrimary} onClick={createDemoUser}>Crear y asignar usuario</button></div>}</>}
    </div></div>}

    <div className={styles.previewBadge}>PREVIEW · no modifica datos reales</div>
  </div>
}
