import type { PaymentPart, Sale } from './types'

export const PAYMENT_METHODS = ['Efectivo', 'Débito', 'Crédito', 'Transferencia', 'Mercado Pago', 'Billetera Virtual'] as const

export function normalizePaymentParts(parts: PaymentPart[] | null | undefined, total: number): PaymentPart[] {
  const safeTotal = Math.max(0, Number(total || 0))
  const clean = (parts || [])
    .map(part => ({ method: String(part?.method || '').trim(), amount: Math.max(0, Number(part?.amount || 0)) }))
    .filter(part => part.method && part.amount > 0)

  if (!clean.length) return []
  if (clean.length === 1) return [{ ...clean[0], amount: safeTotal || clean[0].amount }]

  const first = { ...clean[0], amount: Math.min(safeTotal, clean[0].amount) }
  const second = { ...clean[1], amount: Math.max(0, safeTotal - first.amount) }
  return second.amount > 0 ? [first, second] : [first]
}

export function paymentPartsForSale(sale: Sale): PaymentPart[] {
  const raw = sale.details?.payment_parts
  if (Array.isArray(raw)) {
    const normalized = normalizePaymentParts(raw as PaymentPart[], sale.total)
    if (normalized.length) return normalized
  }
  return [{ method: sale.payment || 'Sin especificar', amount: Number(sale.total || 0) }]
}

export function paymentAmountForSale(sale: Sale, method: string | RegExp) {
  return paymentPartsForSale(sale).reduce((sum, part) => {
    const matches = typeof method === 'string'
      ? part.method.toLowerCase() === method.toLowerCase()
      : method.test(part.method)
    return sum + (matches ? Number(part.amount || 0) : 0)
  }, 0)
}

export function paymentLabelForSale(sale: Sale) {
  const parts = paymentPartsForSale(sale)
  return parts.length > 1 ? parts.map(part => part.method).join(' + ') : parts[0]?.method || sale.payment
}

export function paymentTotalsByMethod(sales: Sale[]) {
  const result = new Map<string, { amount: number; operations: number }>()
  for (const sale of sales) {
    const seen = new Set<string>()
    for (const part of paymentPartsForSale(sale)) {
      const current = result.get(part.method) || { amount: 0, operations: 0 }
      current.amount += Number(part.amount || 0)
      if (!seen.has(part.method)) {
        current.operations += 1
        seen.add(part.method)
      }
      result.set(part.method, current)
    }
  }
  return result
}
