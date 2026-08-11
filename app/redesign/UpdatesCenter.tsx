'use client'

import { useCallback, useEffect, useState } from 'react'
import type { TenantSession } from '@/lib/comercio/types'
import styles from './updates-center.module.css'

type Release = {
  id: string
  version: string
  title: string
  notes: string[]
  createdAt?: string | null
  branch?: string | null
  commitSha?: string | null
  url?: string | null
}

type UpdatesPayload = {
  ok: boolean
  configured: boolean
  production: boolean
  current: Release | null
  available: Release | null
  previous: Release | null
  history: Release[]
  reason?: string | null
}

const fallbackPayload: UpdatesPayload = {
  ok: true,
  configured: false,
  production: false,
  current: null,
  available: null,
  previous: null,
  history: [],
}

function formatDate(value?: string | null) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export default function UpdatesCenter({ session, buildVersion, message }: { session: TenantSession; buildVersion: string; message: (text: string) => void }) {
  const [data, setData] = useState<UpdatesPayload>(fallbackPayload)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState<'install' | 'rollback' | ''>('')
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const response = await fetch('/api/redesign/updates', {
        headers: { Authorization: `Bearer ${session.token}` },
        cache: 'no-store',
      })
      const payload = await response.json().catch(() => null)
      if (!response.ok || !payload) throw new Error(payload?.error || `No se pudo consultar actualizaciones (${response.status})`)
      setData(payload as UpdatesPayload)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setLoading(false)
    }
  }, [session.token])

  useEffect(() => { void load() }, [load])

  async function run(action: 'install' | 'rollback', release: Release | null) {
    if (!release || busy) return
    const text = action === 'install'
      ? `¿Instalar ${release.version}? El sistema se actualizará y después tendrás que recargar la página.`
      : `¿Volver a ${release.version}? Esto restaura la versión anterior del sistema. Las ventas, productos y datos del comercio no se modifican.`
    if (!window.confirm(text)) return
    setBusy(action)
    setError('')
    try {
      const response = await fetch('/api/redesign/updates', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action, deploymentId: release.id }),
      })
      const payload = await response.json().catch(() => null)
      if (!response.ok || !payload?.ok) throw new Error(payload?.error || `No se pudo ${action === 'install' ? 'instalar' : 'restaurar'} la versión.`)
      message(action === 'install' ? 'Actualización aceptada. Esperá unos segundos y tocá “Actualizar página”.' : 'Versión anterior restaurada. Esperá unos segundos y tocá “Actualizar página”.')
      window.setTimeout(() => { void load() }, 4500)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setBusy('')
    }
  }

  const current = data.current || {
    id: 'current',
    version: buildVersion || 'actual',
    title: 'Versión instalada',
    notes: [],
  }

  return <div className={styles.wrap}>
    <div className={styles.hero}>
      <div>
        <div className={styles.kicker}>CENTRO DE ACTUALIZACIONES</div>
        <h3>Actualizaciones del sistema</h3>
        <p>Las mejoras se preparan aparte y solo se instalan cuando el propietario las acepta.</p>
      </div>
      <button className={styles.refreshButton} onClick={() => window.location.reload()} title="Equivale a recargar la página">↻ Actualizar página</button>
    </div>

    {error && <div className={styles.error}>{error}</div>}

    <div className={styles.currentCard}>
      <div className={styles.statusIcon}>✓</div>
      <div className={styles.currentCopy}>
        <span>VERSIÓN ACTUAL</span>
        <strong>Comercio Lleno · {current.version}</strong>
        <small>{data.configured ? 'Centro conectado al sistema de versiones.' : 'El centro ya está preparado para recibir versiones publicables.'}</small>
      </div>
      <div className={styles.statePill}>{loading ? 'Buscando…' : data.available ? 'Nueva versión disponible' : 'Sistema actualizado'}</div>
    </div>

    {data.available ? <div className={styles.updateCard}>
      <div className={styles.updateTop}>
        <div>
          <span className={styles.availableLabel}>ACTUALIZACIÓN DISPONIBLE</span>
          <h4>{data.available.version} · {data.available.title}</h4>
          <small>Preparada {formatDate(data.available.createdAt)}</small>
        </div>
        <button className={styles.installButton} disabled={busy !== '' || !data.production} onClick={() => run('install', data.available)}>{busy === 'install' ? 'Instalando…' : 'Instalar actualización'}</button>
      </div>
      {data.available.notes.length > 0 && <ul>{data.available.notes.map((note, index) => <li key={`${note}-${index}`}>{note}</li>)}</ul>}
      {!data.production && <div className={styles.safeNote}>Esta vista está en modo de prueba. El botón de instalación se habilita únicamente desde la versión de producción.</div>}
    </div> : <div className={styles.emptyCard}>
      <div className={styles.emptyIcon}>↻</div>
      <div><b>No hay actualizaciones pendientes</b><span>Cuando preparemos una versión nueva, aparecerá acá con sus mejoras antes de instalarla.</span></div>
      <button onClick={() => void load()} disabled={loading}>{loading ? 'Buscando…' : 'Buscar actualizaciones'}</button>
    </div>}

    <div className={styles.rollbackCard}>
      <div>
        <span className={styles.rollbackLabel}>VERSIÓN ANTERIOR</span>
        <h4>{data.previous ? `${data.previous.version} · ${data.previous.title}` : 'Sin versión anterior disponible'}</h4>
        <p>Si una actualización genera un problema, podés volver a la versión anterior sin borrar ventas, productos, stock ni clientes.</p>
      </div>
      <button className={styles.rollbackButton} disabled={!data.previous || busy !== '' || !data.production} onClick={() => run('rollback', data.previous)}>{busy === 'rollback' ? 'Volviendo atrás…' : 'Volver a versión anterior'}</button>
    </div>

    <div className={styles.history}>
      <div className={styles.historyHead}><div><span>HISTORIAL</span><h4>Versiones recientes</h4></div><button onClick={() => void load()} disabled={loading}>↻</button></div>
      <div className={styles.historyRows}>
        {(data.history.length ? data.history : [current]).slice(0, 5).map((release, index) => <div className={styles.historyRow} key={`${release.id}-${index}`}>
          <span className={index === 0 ? styles.dotCurrent : styles.dot}></span>
          <div><b>{release.version}</b><small>{release.title}</small></div>
          <time>{formatDate(release.createdAt)}</time>
          <em>{index === 0 ? 'Actual' : 'Anterior'}</em>
        </div>)}
      </div>
    </div>

    <div className={styles.securityNote}><b>Actualización segura</b><span>Solo el Propietario puede instalar o restaurar versiones. La actualización cambia el software, no los datos del comercio.</span></div>
  </div>
}
