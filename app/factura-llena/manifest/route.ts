import { NextResponse } from 'next/server'

export function GET(){
  return NextResponse.json({
    name:'FacturaLlena',
    short_name:'FacturaLlena',
    description:'Facturación electrónica ARCA simple desde el celular.',
    start_url:'/factura-llena',
    scope:'/factura-llena',
    display:'standalone',
    background_color:'#050505',
    theme_color:'#050505',
    icons:[
      {src:'/factura-llena-icon.svg',sizes:'any',type:'image/svg+xml',purpose:'any maskable'}
    ]
  },{headers:{'Content-Type':'application/manifest+json; charset=utf-8'}})
}
