'use client'

import { useEffect, useRef, useState } from 'react'
import type { TenantSession, ViewKey } from '@/lib/comercio/types'
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
  icon: string
  label: string
  allowed: boolean
}

export default function SidebarNavigation({ tenant, view, buildVersion, canView, onNavigate }: Props) {
  const [managementOpen, setManagementOpen] = useState(false)
  const managementRef = useRef<HTMLDivElement | null>(null)

  const mainNav: Array<[ViewKey, string, string, string?]> = [
    ['dashboard', '⌂', 'Inicio'],
    ['pos', '🪙', 'Nueva venta', 'sale'],
    ['products', '▦', 'Productos'],
    ['cash', '◷', 'Caja diaria'],
    ['settings', '⚙', 'Configuración'],
    ['assistant', '✦', 'Asistente IA', 'assistant'],
  ]

  const management: ManagementItem[] = [
    { key: 'sales', icon: '▤', label: 'Ventas', allowed: canView('sales') },
    { key: 'reports', icon: '◔', label: 'Reportes', allowed: canView('reports') },
    { key: 'customers', icon: '♙', label: 'Clientes', allowed: canView('customers') },
    { key: 'profitability', icon: '↗', label: 'Rentabilidad', allowed: canView('profitability') },
    { key: 'accounts', icon: '¤', label: 'Cuentas corrientes', allowed: canView('accounts') },
    { key: 'returns', icon: '↩', label: 'Devoluciones', allowed: canView('returns') },
    { key: 'promotions', icon: '%', label: 'Promociones', allowed: canView('promotions') },
    { key: 'purchases', icon: '▦', label: 'Compras', allowed: canView('purchases') },
    { key: 'suppliers', icon: '♜', label: 'Proveedores', allowed: canView('suppliers') },
    { key: 'finances', icon: '$', label: 'Finanzas', allowed: tenant.role === 'owner' || tenant.permissions?.can_manage_finances === true },
  ]

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
    onNavigate(item.key)
  }

  return <aside className={`${styles.sidebar} ${layout.sidebar}`}>
    <div className={styles.navLabel}>OPERACIÓN</div>
    {mainNav.map(([key, icon, label, special]) => canView(key) && <button
      key={key}
      className={`${styles.navButton} ${view === key ? styles.navActive : ''} ${special === 'assistant' ? parity.supportAssistant : ''} ${special === 'sale' ? enh.saleNav : ''}`}
      onClick={() => { setManagementOpen(false); onNavigate(key) }}
    ><span>{icon}</span>{label}</button>)}

    <div className={nav.managementGroup} ref={managementRef}>
      <button
        type="button"
        className={`${nav.managementButton} ${managementOpen ? nav.managementButtonOpen : ''}`}
        aria-expanded={managementOpen}
        aria-haspopup="menu"
        onClick={() => setManagementOpen(open => !open)}
      >
        <span className={nav.managementIcon}>▦</span>
        <span className={nav.managementLabel}>Gestión</span>
        <span className={nav.managementChevron}>{managementOpen ? '⌃' : '⌄'}</span>
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
          <span>{item.icon}</span>{item.label}
        </button>)}
      </div>}
    </div>

    <div className={styles.sidebarBottom}>
      <b>Comercio Lleno</b>
      <span>Rediseño V2 · {buildVersion}</span>
      <small>Tenant {tenant.companyId.slice(0, 8)} · {tenant.role === 'owner' ? 'Propietario' : tenant.role}</small>
    </div>
  </aside>
}
