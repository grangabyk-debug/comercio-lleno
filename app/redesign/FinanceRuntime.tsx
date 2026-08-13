'use client'

import { FormEvent,useEffect,useMemo,useState } from 'react'
import { deleteFinanceExpense,loadFinance,saveFinanceExpense,setFinanceExpensePaid,type Branch,type FinanceExpense,type FinanceSale } from '@/lib/comercio/finance-api'
import { readTenantSession } from '@/lib/comercio/session'
import type { TenantSession } from '@/lib/comercio/types'
import styles from './finance.module.css'

const money=new Intl.NumberFormat('es-AR',{style:'currency',currency:'ARS',maximumFractionDigits:0})
const categories=[['rent','Alquiler'],['tax','Impuestos / ARCA'],['electricity','Luz'],['water','Agua'],['gas','Gas'],['internet','Internet / teléfono'],['salary','Sueldos'],['services','Servicios'],['maintenance','Mantenimiento'],['other','Otros']]
function monthKey(value:string|Date){const d=value instanceof Date?value:new Date(value);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`}
function labelMonth(key:string){const [y,m]=key.split('-').map(Number);return new Date(y,m-1,1).toLocaleDateString('es-AR',{month:'short',year:'2-digit'})}

export default function FinanceRuntime(){
  const[open,setOpen]=useState(false),[session,setSession]=useState<TenantSession|null>(null),[expenses,setExpenses]=useState<FinanceExpense[]>([]),[sales,setSales]=useState<FinanceSale[]>([]),[branches,setBranches]=useState<Branch[]>([])
  const[loading,setLoading]=useState(false),[error,setError]=useState(''),[modal,setModal]=useState(false),[query,setQuery]=useState(''),[month,setMonth]=useState(()=>monthKey(new Date()))
  const[form,setForm]=useState({description:'',amount:'',category:'rent',due_date:new Date().toISOString().slice(0,10),recurrence:'monthly',branch_id:'',notes:''})

  async function reload(s=session){if(!s)return;setLoading(true);setError('');try{const d=await loadFinance(s);setExpenses(d.expenses);setSales(d.sales);setBranches(d.branches)}catch(e){setError(e instanceof Error?e.message:String(e))}finally{setLoading(false)}}
  useEffect(()=>{
    const s=readTenantSession();setSession(s)
    const allowed=s&&(s.role==='owner'||s.permissions?.can_manage_finances===true)
    if(!allowed)return
    const openHandler=()=>{setOpen(true);void reload(s)}
    const closeHandler=()=>{setModal(false);setOpen(false)}
    window.addEventListener('comercio:open-finance',openHandler)
    window.addEventListener('comercio:close-finance',closeHandler)
    return()=>{
      window.removeEventListener('comercio:open-finance',openHandler)
      window.removeEventListener('comercio:close-finance',closeHandler)
    }
  },[])

  const monthSales=useMemo(()=>sales.filter(s=>monthKey(s.sold_at)===month).reduce((a,s)=>a+s.total,0),[sales,month])
  const monthExpenses=useMemo(()=>expenses.filter(e=>monthKey(e.due_date||e.created_at)===month).reduce((a,e)=>a+e.amount,0),[expenses,month])
  const paidExpenses=useMemo(()=>expenses.filter(e=>monthKey(e.due_date||e.created_at)===month&&e.status==='paid').reduce((a,e)=>a+e.amount,0),[expenses,month])
  const result=monthSales-monthExpenses,ratio=monthSales?monthExpenses/monthSales*100:0
  const chart=useMemo(()=>{const keys=Array.from({length:6},(_,i)=>{const d=new Date();d.setMonth(d.getMonth()-(5-i));return monthKey(d)});return keys.map(k=>({key:k,sales:sales.filter(s=>monthKey(s.sold_at)===k).reduce((a,s)=>a+s.total,0),expenses:expenses.filter(e=>monthKey(e.due_date||e.created_at)===k).reduce((a,e)=>a+e.amount,0)}))},[sales,expenses])
  const chartMax=Math.max(1,...chart.flatMap(x=>[x.sales,x.expenses]))
  const rows=useMemo(()=>expenses.filter(e=>monthKey(e.due_date||e.created_at)===month&&`${e.description} ${e.category}`.toLowerCase().includes(query.toLowerCase())).sort((a,b)=>String(b.due_date||b.created_at).localeCompare(String(a.due_date||a.created_at))),[expenses,month,query])

  async function submit(e:FormEvent){e.preventDefault();if(!session||!form.description.trim()||Number(form.amount)<=0)return;try{await saveFinanceExpense(session,{description:form.description,amount:Number(form.amount.replace(',','.')),category:form.category,due_date:form.due_date,recurrence:form.recurrence as 'once'|'monthly'|'yearly',branch_id:form.branch_id||null,notes:form.notes,status:'pending'});setModal(false);setForm(f=>({...f,description:'',amount:'',notes:''}));await reload(session)}catch(e){setError(e instanceof Error?e.message:String(e))}}
  if(!open)return null
  return <div className={styles.overlay}>
    <div className={styles.head}><div><span>GESTIÓN INTERNA</span><h1>Finanzas</h1><p>Gastos del local, servicios e impuestos cruzados con las ventas reales.</p></div><div className={styles.headActions}><input type="month" value={month} onChange={e=>setMonth(e.target.value)}/><button className={styles.add} onClick={()=>setModal(true)}>+ Cargar gasto</button><button className={styles.close} onClick={()=>setOpen(false)}>×</button></div></div>
    {error&&<div className={styles.error}>{error}</div>}
    <div className={styles.kpis}><div><span>Ventas del mes</span><b>{money.format(monthSales)}</b></div><div><span>Gastos cargados</span><b>{money.format(monthExpenses)}</b><small>{money.format(paidExpenses)} pagados</small></div><div className={result>=0?styles.good:styles.bad}><span>Resultado operativo</span><b>{money.format(result)}</b></div><div><span>Gastos / ventas</span><b>{ratio.toFixed(1)}%</b><small>{monthExpenses?`Ventas cubren ${(monthSales/monthExpenses).toFixed(1)}× los gastos`:'Sin gastos cargados'}</small></div></div>
    <div className={styles.grid}>
      <section className={styles.panel}><div className={styles.panelHead}><div><b>Ventas vs. gastos</b><small>Últimos 6 meses</small></div><div className={styles.legend}><i/>Ventas <i/>Gastos</div></div><div className={styles.chart}>{chart.map(x=><div className={styles.monthBar} key={x.key}><div className={styles.bars}><i style={{height:`${Math.max(2,x.sales/chartMax*100)}%`}}/><i style={{height:`${Math.max(2,x.expenses/chartMax*100)}%`}}/></div><span>{labelMonth(x.key)}</span></div>)}</div></section>
      <section className={styles.panel}><div className={styles.panelHead}><div><b>Lectura rápida</b><small>Indicadores para decidir</small></div></div><div className={styles.insights}><div><span>Necesario para cubrir gastos</span><b>{money.format(monthExpenses)}</b></div><div><span>Disponible después de gastos</span><b>{money.format(Math.max(0,result))}</b></div><div><span>Estado</span><b>{monthSales===0?'Sin ventas registradas':result>=0?'Ventas por encima de gastos':'Gastos por encima de ventas'}</b></div></div></section>
    </div>
    <section className={styles.panel}><div className={styles.panelHead}><div><b>Gastos de {labelMonth(month)}</b><small>{rows.length} registros</small></div><input className={styles.search} value={query} onChange={e=>setQuery(e.target.value)} placeholder="Buscar alquiler, luz, impuesto…"/></div>
      <div className={styles.table}><div className={styles.rowHead}><span>Concepto</span><span>Categoría</span><span>Vencimiento</span><span>Estado</span><span>Importe</span><span></span></div>{loading?<div className={styles.empty}>Cargando finanzas…</div>:rows.length?rows.map(r=><div className={styles.row} key={r.id}><span><b>{r.description}</b><small>{r.recurrence==='monthly'?'Mensual':r.recurrence==='yearly'?'Anual':'Único'}</small></span><span>{categories.find(c=>c[0]===r.category)?.[1]||'Otros'}</span><span>{r.due_date?new Date(`${r.due_date}T12:00:00`).toLocaleDateString('es-AR'):'—'}</span><span><button className={r.status==='paid'?styles.paid:styles.pending} onClick={async()=>{if(session){await setFinanceExpensePaid(session,r.id,r.status!=='paid');await reload(session)}}}>{r.status==='paid'?'Pagado':'Pendiente'}</button></span><span><b>{money.format(r.amount)}</b></span><span><button className={styles.trash} onClick={async()=>{if(session&&confirm('¿Eliminar este gasto?')){await deleteFinanceExpense(session,r.id);await reload(session)}}}>×</button></span></div>):<div className={styles.empty}>No hay gastos cargados para este mes.</div>}</div>
    </section>
    {modal&&<div className={styles.modal} onMouseDown={e=>e.currentTarget===e.target&&setModal(false)}><form className={styles.modalCard} onSubmit={submit}><header><div><span>NUEVO GASTO</span><h2>Cargar gasto interno</h2></div><button type="button" onClick={()=>setModal(false)}>×</button></header><div className={styles.formGrid}><label>Concepto<input autoFocus required value={form.description} onChange={e=>setForm({...form,description:e.target.value})} placeholder="Ej: Alquiler agosto"/></label><label>Importe<input required inputMode="decimal" value={form.amount} onChange={e=>setForm({...form,amount:e.target.value})} placeholder="$ 0"/></label><label>Categoría<select value={form.category} onChange={e=>setForm({...form,category:e.target.value})}>{categories.map(c=><option key={c[0]} value={c[0]}>{c[1]}</option>)}</select></label><label>Vencimiento<input type="date" value={form.due_date} onChange={e=>setForm({...form,due_date:e.target.value})}/></label><label>Frecuencia<select value={form.recurrence} onChange={e=>setForm({...form,recurrence:e.target.value})}><option value="once">Una vez</option><option value="monthly">Mensual</option><option value="yearly">Anual</option></select></label><label>Sucursal<select value={form.branch_id} onChange={e=>setForm({...form,branch_id:e.target.value})}><option value="">Local principal</option>{branches.map(b=><option value={b.id} key={b.id}>{b.name}</option>)}</select></label><label className={styles.wide}>Notas<input value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} placeholder="Opcional"/></label></div><footer><button type="button" onClick={()=>setModal(false)}>Cancelar</button><button className={styles.add}>Guardar gasto</button></footer></form></div>}
  </div>
}
