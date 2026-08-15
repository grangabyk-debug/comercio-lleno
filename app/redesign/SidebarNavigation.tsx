'use client'

import { useEffect, useRef, useState } from 'react'
import type { TenantSession, ViewKey } from '@/lib/comercio/types'
import UiIcon, { type UiIconName } from './UiIcon'
import styles from './page.module.css'
import parity from './parity.module.css'
import enh from './enhancements.module.css'
import nav from './SidebarNavigation.module.css'
import layout from './ShellLayout.module.css'

type Props = {
  tenant: TenantSession
  view: ViewKey
  buildVersion: string
  canView: (view: ViewKey) => boolean
  onNavigate: (view: ViewKey) => void
}

type ManagementItem = {
  key: ViewKey | 'finances'
  icon: UiIconName
  label: string
  allowed: boolean
}

type MainItem = {
  key: ViewKey
  icon: UiIconName
  label: string
  special?: 'sale'|'assistant'
}

const EXACT_VIEWS: ViewKey[] = ['dashboard','pos','products','cash','settings','assistant','sales','reports','customers','profitability','accounts','returns','promotions','purchases','suppliers'] as ViewKey[]

function tourKey(key:ViewKey){
  if(key==='pos')return 'sale'
  if(key==='products')return 'products'
  if(key==='cash')return 'cash'
  if(key==='settings')return 'settings'
  return undefined
}

export default function SidebarNavigation({ tenant, view, buildVersion, canView, onNavigate }: Props) {
  const [managementOpen, setManagementOpen] = useState(false)
  const managementRef = useRef<HTMLDivElement | null>(null)

  const mainNav: MainItem[] = [
    {key:'dashboard',icon:'home',label:'Inicio'},
    {key:'pos',icon:'sale',label:'Nueva venta',special:'sale'},
    {key:'products',icon:'products',label:'Productos'},
    {key:'cash',icon:'cash',label:'Caja diaria'},
    {key:'settings',icon:'settings',label:'Configuración'},
    {key:'assistant',icon:'sparkles',label:'Asistente IA',special:'assistant'},
  ]

  const management: ManagementItem[] = [
    { key: 'sales', icon: 'sales', label: 'Ventas', allowed: canView('sales') },
    { key: 'reports', icon: 'reports', label: 'Reportes', allowed: canView('reports') },
    { key: 'customers', icon: 'customers', label: 'Clientes', allowed: canView('customers') },
    { key: 'profitability', icon: 'profit', label: 'Rentabilidad', allowed: canView('profitability') },
    { key: 'accounts', icon: 'accounts', label: 'Cuentas corrientes', allowed: canView('accounts') },
    { key: 'returns', icon: 'returns', label: 'Devoluciones', allowed: canView('returns') },
    { key: 'promotions', icon: 'promotions', label: 'Promociones', allowed: canView('promotions') },
    { key: 'purchases', icon: 'purchases', label: 'Compras', allowed: canView('purchases') },
    { key: 'suppliers', icon: 'suppliers', label: 'Proveedores', allowed: canView('suppliers') },
    { key: 'finances', icon: 'banknote', label: 'Finanzas', allowed: tenant.role === 'owner' || tenant.permissions?.can_manage_finances === true },
  ]

  const closeFinances = () => window.dispatchEvent(new Event('comercio:close-finance'))

  useEffect(() => {
    const navigateExact = (event: Event) => {
      const next = (event as CustomEvent<ViewKey>).detail
      if (!next || !EXACT_VIEWS.includes(next) || !canView(next)) return
      closeFinances()
      setManagementOpen(false)
      onNavigate(next)
    }
    window.addEventListener('comercio:navigate-view', navigateExact)
    return () => window.removeEventListener('comercio:navigate-view', navigateExact)
  }, [canView, onNavigate])

  useEffect(() => {
    if (!managementOpen) return
    const closeOutside = (event: MouseEvent) => {
      const target = event.target as Node | null
      if (target && managementRef.current?.contains(target)) return
      setManagementOpen(false)
    }
    const closeEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setManagementOpen(false)
    }
    document.addEventListener('mousedown', closeOutside)
    document.addEventListener('keydown', closeEscape)
    return () => {
      document.removeEventListener('mousedown', closeOutside)
      document.removeEventListener('keydown', closeEscape)
    }
  }, [managementOpen])

  const openManagementItem = (item: ManagementItem) => {
    setManagementOpen(false)
    if (item.key === 'finances') {
      window.dispatchEvent(new Event('comercio:open-finance'))
      return
    }
    closeFinances()
    onNavigate(item.key)
  }

  return <aside className={`${styles.sidebar} ${layout.sidebar}`}>
    <div className={styles.navLabel}>OPERACIÓN</div>
    {mainNav.map(item => canView(item.key) && <button
      key={item.key}
      data-tour={tourKey(item.key)}
      data-tour-context={tourKey(item.key)}
      className={`${styles.navButton} ${view === item.key ? styles.navActive : ''} ${item.special === 'assistant' ? parity.supportAssistant : ''} ${item.special === 'sale' ? enh.saleNav : ''}`}
      onClick={() => { closeFinances(); setManagementOpen(false); onNavigate(item.key) }}
    ><span className={nav.mainIcon}>{item.key==='pos'?<b className={nav.saleSymbol}>$</b>:<UiIcon name={item.icon} size={17}/>}</span><b className={nav.mainLabel}>{item.label}</b></button>)}

    <div className={nav.managementGroup} ref={managementRef}>
      <button
        type="button"
        className={`${nav.managementButton} ${managementOpen ? nav.managementButtonOpen : ''}`}
        aria-expanded={managementOpen}
        aria-haspopup="menu"
        onClick={() => { closeFinances(); setManagementOpen(open => !open) }}
      >
        <span className={nav.managementIcon}><UiIcon name="management" size={17}/></span>
        <span className={nav.managementLabel}>Gestión</span>
      </button>

      {managementOpen && <div className={nav.flyout} role="menu" aria-label="Gestión">
        <div className={nav.flyoutTitle}>GESTIÓN</div>
        {management.filter(item => item.allowed).map(item => <button
          type="button"
          role="menuitem"
          key={item.key}
          className={`${nav.managementItem} ${item.key !== 'finances' && view === item.key ? nav.managementItemActive : ''}`}
          onClick={() => openManagementItem(item)}
        >
          <span><UiIcon name={item.icon} size={17}/></span>{item.label}
        </button>)}
      </div>}
    </div>

    <div className={styles.sidebarBottom}>
      <b>Comercio Lleno</b>
      <span>Vista operativa · {buildVersion}</span>
      <small>{tenant.role === 'owner' ? 'Propietario' : tenant.role}</small>
    </div>
  </aside>
}
