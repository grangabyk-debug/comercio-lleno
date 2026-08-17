'use client'

import { useLayoutEffect,type ComponentProps } from 'react'
import ProductsInventory from './ProductsInventory'

type Props=ComponentProps<typeof ProductsInventory>

export default function ProductsInventoryFixed(props:Props){
  useLayoutEffect(()=>{
    const original=window.fetch.bind(window)
    window.fetch=(async(input:RequestInfo|URL,init?:RequestInit)=>{
      const raw=typeof input==='string'?input:input instanceof URL?input.toString():input.url
      const method=(init?.method||(input instanceof Request?input.method:'GET')).toUpperCase()
      const isProductPatch=method==='PATCH'&&/\/rest\/v1\/products(?:\?|$)/.test(raw)
      const response=await original(input,init)
      if(isProductPatch&&response.ok)window.setTimeout(()=>{void props.refresh()},60)
      return response
    }) as typeof window.fetch
    return()=>{window.fetch=original as typeof window.fetch}
  },[props.refresh])
  return <ProductsInventory {...props}/>
}
