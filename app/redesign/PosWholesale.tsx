'use client'

import type { ComponentProps } from 'react'
import { readCachedSalesSettings } from '@/lib/comercio/sales-settings'
import PosEnhanced from './PosEnhanced'

const WHOLESALE_MIN_QTY = 3

type Props = ComponentProps<typeof PosEnhanced>
type PriceableProduct = { price: number; wholesale_price?: number | null }

function unitPriceForQty(product: PriceableProduct, qty: number) {
  const retail = Number(product.price || 0)
  const wholesale = Number(product.wholesale_price || 0)
  return qty >= WHOLESALE_MIN_QTY && wholesale > 0 ? wholesale : retail
}

export default function PosWholesale(props: Props) {
  function allowNegativeStock() {
    return readCachedSalesSettings(props.data.company.id).allowNegativeStock
  }

  function preparePrice(id: string, nextQty: number) {
    const line = props.cart.find(item => item.id === id)
    const product = props.data.products.find(item => item.id === id)
    if (!line || !product) return
    line.price = unitPriceForQty(product, nextQty)
  }

  function addProduct(id: string) {
    const line = props.cart.find(item => item.id === id)
    const product = props.data.products.find(item => item.id === id)
    if (line && product) {
      const nextQty = allowNegativeStock()
        ? line.qty + 1
        : Math.min(line.qty + 1, Number(product.stock || 0))
      preparePrice(id, nextQty)
    }
    props.addProduct(id)
  }

  function changeQty(id: string, delta: number) {
    const line = props.cart.find(item => item.id === id)
    const product = props.data.products.find(item => item.id === id)
    if (line && product) {
      const nextQty = Math.max(
        1,
        allowNegativeStock()
          ? line.qty + delta
          : Math.min(Number(product.stock || 0), line.qty + delta),
      )
      preparePrice(id, nextQty)
    }
    props.changeQty(id, delta)
  }

  return <PosEnhanced {...props} addProduct={addProduct} changeQty={changeQty} />
}
