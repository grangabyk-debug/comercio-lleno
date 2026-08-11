import type { DeviceSettings, TenantSession } from './types'

const DEFAULT_DEVICE: DeviceSettings = {
  paper: '80',
  autoPrint: false,
  printerMode: 'browser',
  printerName: '',
  receiptCopies: 1,
}

export function readTenantSession(): TenantSession | null {
  if (typeof window === 'undefined') return null
  const token = localStorage.getItem('cl_access_token') || ''
  const companyId = localStorage.getItem('cl_company_id') || ''
  if (!token || !companyId) return null
  return {
    token,
    companyId,
    companyName: localStorage.getItem('cl_company_name') || 'Mi comercio',
    role: localStorage.getItem('cl_user_role') || 'owner',
  }
}

function deviceKey(companyId: string) {
  return `cl_device_settings_${companyId}`
}

export function readDeviceSettings(companyId: string): DeviceSettings {
  if (typeof window === 'undefined') return DEFAULT_DEVICE
  try {
    const parsed = JSON.parse(localStorage.getItem(deviceKey(companyId)) || 'null')
    return { ...DEFAULT_DEVICE, ...(parsed || {}) }
  } catch {
    return DEFAULT_DEVICE
  }
}

export function writeDeviceSettings(companyId: string, settings: DeviceSettings) {
  if (typeof window === 'undefined') return
  localStorage.setItem(deviceKey(companyId), JSON.stringify(settings))
}

export function cacheSnapshot(companyId: string, key: string, value: unknown) {
  if (typeof window === 'undefined') return
  localStorage.setItem(`cl_v2_${companyId}_${key}`, JSON.stringify(value))
}

export function readCachedSnapshot<T>(companyId: string, key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  try {
    const parsed = JSON.parse(localStorage.getItem(`cl_v2_${companyId}_${key}`) || 'null')
    return parsed == null ? fallback : parsed as T
  } catch {
    return fallback
  }
}
