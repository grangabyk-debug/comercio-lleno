import type { CommerceSnapshot, Sale } from './types'

const DB_NAME = 'comercio-lleno-offline'
const DB_VERSION = 1
const SNAPSHOT_STORE = 'snapshots'
const QUEUE_STORE = 'sale_queue'

export type OfflineSaleQueueItem = {
  id: string
  companyId: string
  sale: Sale
  createdAt: string
  attempts: number
  lastError?: string | null
}

type SnapshotRecord = {
  companyId: string
  snapshot: CommerceSnapshot
  savedAt: string
}

function available() {
  return typeof window !== 'undefined' && 'indexedDB' in window
}

function normalizeSnapshot(snapshot: CommerceSnapshot): CommerceSnapshot {
  return {
    ...snapshot,
    company: snapshot?.company || { id: '', name: 'Mi comercio' },
    products: Array.isArray(snapshot?.products) ? snapshot.products : [],
    sales: Array.isArray(snapshot?.sales) ? snapshot.sales : [],
    customers: Array.isArray(snapshot?.customers) ? snapshot.customers : [],
    cashRegister: snapshot?.cashRegister || null,
    cashMovements: Array.isArray(snapshot?.cashMovements) ? snapshot.cashMovements : [],
  }
}

function openDb(): Promise<IDBDatabase> {
  if (!available()) return Promise.reject(new Error('IndexedDB no disponible'))
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(SNAPSHOT_STORE)) db.createObjectStore(SNAPSHOT_STORE, { keyPath: 'companyId' })
      if (!db.objectStoreNames.contains(QUEUE_STORE)) {
        const store = db.createObjectStore(QUEUE_STORE, { keyPath: 'id' })
        store.createIndex('companyId', 'companyId', { unique: false })
      }
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error || new Error('No se pudo abrir el almacenamiento offline'))
  })
}

async function tx<T>(storeName: string, mode: IDBTransactionMode, action: (store: IDBObjectStore, resolve: (value: T) => void, reject: (reason?: unknown) => void) => void): Promise<T> {
  const db = await openDb()
  return new Promise<T>((resolve, reject) => {
    const transaction = db.transaction(storeName, mode)
    const store = transaction.objectStore(storeName)
    action(store, resolve, reject)
    transaction.onerror = () => reject(transaction.error || new Error('Error de almacenamiento offline'))
    transaction.oncomplete = () => db.close()
  })
}

export function getOfflineDeviceId(companyId: string) {
  if (typeof window === 'undefined') return 'server'
  const key = `cl_offline_device_${companyId}`
  let id = localStorage.getItem(key)
  if (!id) {
    id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`
    localStorage.setItem(key, id)
  }
  return id
}

export async function saveOfflineSnapshot(companyId: string, snapshot: CommerceSnapshot) {
  if (!available()) return
  await tx<void>(SNAPSHOT_STORE, 'readwrite', (store, resolve, reject) => {
    const request = store.put({ companyId, snapshot: normalizeSnapshot(snapshot), savedAt: new Date().toISOString() } satisfies SnapshotRecord)
    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}

export async function loadOfflineSnapshot(companyId: string): Promise<CommerceSnapshot | null> {
  if (!available()) return null
  return tx<CommerceSnapshot | null>(SNAPSHOT_STORE, 'readonly', (store, resolve, reject) => {
    const request = store.get(companyId)
    request.onsuccess = () => {
      const snapshot = (request.result as SnapshotRecord | undefined)?.snapshot
      resolve(snapshot ? normalizeSnapshot(snapshot) : null)
    }
    request.onerror = () => reject(request.error)
  })
}

export async function queueOfflineSale(companyId: string, sale: Sale) {
  const item: OfflineSaleQueueItem = {
    id: sale.id,
    companyId,
    sale,
    createdAt: new Date().toISOString(),
    attempts: 0,
    lastError: null,
  }
  await tx<void>(QUEUE_STORE, 'readwrite', (store, resolve, reject) => {
    const request = store.put(item)
    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}

export async function listOfflineSales(companyId: string): Promise<OfflineSaleQueueItem[]> {
  if (!available()) return []
  return tx<OfflineSaleQueueItem[]>(QUEUE_STORE, 'readonly', (store, resolve, reject) => {
    const index = store.index('companyId')
    const request = index.getAll(IDBKeyRange.only(companyId))
    request.onsuccess = () => resolve((request.result as OfflineSaleQueueItem[]).sort((a, b) => a.createdAt.localeCompare(b.createdAt)))
    request.onerror = () => reject(request.error)
  })
}

export async function removeOfflineSale(id: string) {
  if (!available()) return
  await tx<void>(QUEUE_STORE, 'readwrite', (store, resolve, reject) => {
    const request = store.delete(id)
    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}

export async function markOfflineSaleError(item: OfflineSaleQueueItem, error: string) {
  const next: OfflineSaleQueueItem = { ...item, attempts: item.attempts + 1, lastError: error }
  await tx<void>(QUEUE_STORE, 'readwrite', (store, resolve, reject) => {
    const request = store.put(next)
    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}

export function applyLocalSale(snapshot: CommerceSnapshot, sale: Sale): CommerceSnapshot {
  const safe = normalizeSnapshot(snapshot)
  const alreadyPresent = safe.sales.some(s => s.id === sale.id)
  if (alreadyPresent) {
    return { ...safe, sales: [sale, ...safe.sales.filter(s => s.id !== sale.id)] }
  }
  const qtyByProduct = new Map<string, number>()
  const saleItems = Array.isArray(sale.details?.items) ? sale.details.items : []
  for (const item of saleItems) qtyByProduct.set(item.product_id, (qtyByProduct.get(item.product_id) || 0) + Number(item.qty || 0))
  return {
    ...safe,
    sales: [sale, ...safe.sales],
    products: safe.products.map(product => {
      const qty = qtyByProduct.get(product.id) || 0
      return qty ? { ...product, stock: Math.max(0, Number(product.stock || 0) - qty) } : product
    }),
  }
}

export function overlayOfflineSales(snapshot: CommerceSnapshot, queued: OfflineSaleQueueItem[]) {
  return queued.reduce((current, item) => applyLocalSale(current, item.sale), normalizeSnapshot(snapshot))
}

export async function registerOfflineServiceWorker() {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return null
  try {
    const registrations = await navigator.serviceWorker.getRegistrations()
    await Promise.all(registrations.map(registration => {
      const script = registration.active?.scriptURL || registration.waiting?.scriptURL || registration.installing?.scriptURL || ''
      const rootScope = registration.scope === `${window.location.origin}/`
      if (rootScope && script.endsWith('/comercio-sw.js')) return registration.unregister()
      return Promise.resolve(false)
    }))
    const registration = await navigator.serviceWorker.register('/comercio-sw.js', { scope: '/redesign/' })
    const worker = registration.active || registration.waiting || registration.installing
    worker?.postMessage({ type: 'CACHE_REDESIGN' })
    if ('storage' in navigator && navigator.storage?.persist) navigator.storage.persist().catch(() => false)
    return registration
  } catch {
    return null
  }
}
