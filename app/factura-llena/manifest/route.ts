import { NextResponse } from 'next/server'

export function GET(){
  return NextResponse.json({
    name:'Factura Llena',
    short_name:'Factura Llena',
    description:'Facturación electrónica ARCA simple desde el celular.',
    start_url:'/factura-llena',
    scope:'/factura-llena',
    display:'standalone',
    background_color:'#0a0a0d',
    theme_color:'#0a0a0d',
    icons:[
      {src:'/comercio-lleno-favicon-v3.svg',sizes:'any',type:'image/svg+xml',purpose:'any maskable'}
    ]
  },{
    headers:{'Content-Type':'application/manifest+json; charset=utf-8'}
  })
}
