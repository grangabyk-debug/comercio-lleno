'use client'

import type { ComponentProps } from 'react'
import ProductsInventory from './ProductsInventory'

type Props = ComponentProps<typeof ProductsInventory>

export default function ProductsInventoryFixed(props: Props){
  function message(value:string){
    props.message(value)
    if(value==='Producto actualizado.') window.setTimeout(()=>{void props.refresh()},40)
  }
  return <ProductsInventory {...props} message={message}/>
}
