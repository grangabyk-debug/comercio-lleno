import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
import QRCode from 'qrcode'

export type FiscalPdfIssuer={
  name:string
  legalName:string
  taxId:string
  address:string
  vatCondition:string
  grossIncome:string
  activityStart:string
}

export type FiscalPdfInvoice={
  pointOfSale:number
  receiptNumber:number
  cae:string
  caeExpiration:string
  date:string
  amount:number
  client:string
  concept:string
}

function normalizeDate(value:string){
  const v=String(value||'').replace(/\D/g,'')
  if(v.length===8)return `${v.slice(0,4)}-${v.slice(4,6)}-${v.slice(6,8)}`
  return value||new Date().toISOString().slice(0,10)
}

function displayDate(value:string){
  const d=normalizeDate(value)
  const m=d.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  return m?`${m[3]}/${m[2]}/${m[1]}`:d
}

function base64Json(value:unknown){
  const bytes=new TextEncoder().encode(JSON.stringify(value))
  let binary=''
  bytes.forEach(b=>binary+=String.fromCharCode(b))
  return btoa(binary)
}

export function arcaQrUrl(issuer:FiscalPdfIssuer,inv:FiscalPdfInvoice){
  const payload={
    ver:1,
    fecha:normalizeDate(inv.date),
    cuit:Number(issuer.taxId.replace(/\D/g,'')),
    ptoVta:inv.pointOfSale,
    tipoCmp:11,
    nroCmp:inv.receiptNumber,
    importe:Number(inv.amount.toFixed(2)),
    moneda:'PES',
    ctz:1,
    tipoCodAut:'E',
    codAut:Number(inv.cae),
  }
  return `https://www.arca.gob.ar/fe/qr/?p=${base64Json(payload)}`
}

export async function buildFacturaCPdf(issuer:FiscalPdfIssuer,inv:FiscalPdfInvoice){
  const pdf=await PDFDocument.create()
  const page=pdf.addPage([595.28,841.89])
  const regular=await pdf.embedFont(StandardFonts.Helvetica)
  const bold=await pdf.embedFont(StandardFonts.HelveticaBold)
  const dark=rgb(0.08,0.08,0.09)
  const gray=rgb(0.35,0.35,0.38)
  const line=rgb(0.82,0.82,0.84)
  const violet=rgb(0.34,0.18,0.58)
  const w=page.getWidth()
  const left=42
  const right=w-42

  page.drawRectangle({x:left,y:700,width:right-left,height:100,borderColor:dark,borderWidth:1})
  page.drawLine({start:{x:w/2,y:700},end:{x:w/2,y:800},thickness:1,color:dark})
  page.drawRectangle({x:w/2-18,y:765,width:36,height:36,color:rgb(1,1,1),borderColor:dark,borderWidth:1})
  page.drawText('C',{x:w/2-6.5,y:775,size:20,font:bold,color:dark})
  page.drawText('COD. 011',{x:w/2-18,y:752,size:7,font:bold,color:gray})

  page.drawText(issuer.legalName||issuer.name,{x:left+16,y:768,size:15,font:bold,color:dark})
  page.drawText('Domicilio comercial:',{x:left+16,y:741,size:8,font:bold,color:gray})
  page.drawText(issuer.address||'Pendiente de completar',{x:left+16,y:728,size:9,font:regular,color:dark,maxWidth:w/2-left-30})
  page.drawText(issuer.vatCondition||'Responsable Monotributo',{x:left+16,y:710,size:8,font:regular,color:gray})

  const rx=w/2+18
  page.drawText('FACTURA',{x:rx,y:773,size:17,font:bold,color:dark})
  page.drawText(`Punto de Venta: ${String(inv.pointOfSale).padStart(5,'0')}`,{x:rx,y:750,size:9,font:bold,color:dark})
  page.drawText(`Comp. Nro: ${String(inv.receiptNumber).padStart(8,'0')}`,{x:rx,y:735,size:9,font:bold,color:dark})
  page.drawText(`Fecha de Emisión: ${displayDate(inv.date)}`,{x:rx,y:718,size:9,font:regular,color:dark})
  page.drawText(`CUIT: ${issuer.taxId}`,{x:rx,y:703,size:8,font:regular,color:gray})

  let y=675
  page.drawText(`Ingresos Brutos: ${issuer.grossIncome||'Pendiente de completar'}`,{x:left,y,size:8,font:regular,color:gray})
  page.drawText(`Fecha de Inicio de Actividades: ${issuer.activityStart?displayDate(issuer.activityStart):'Pendiente de completar'}`,{x:w/2,y,size:8,font:regular,color:gray})
  y-=22
  page.drawLine({start:{x:left,y},end:{x:right,y},thickness:1,color:line})
  y-=24
  page.drawText('DATOS DEL RECEPTOR',{x:left,y,size:8,font:bold,color:violet})
  y-=20
  page.drawText(`Cliente: ${inv.client||'Consumidor Final'}`,{x:left,y,size:10,font:regular,color:dark})
  y-=28
  page.drawLine({start:{x:left,y},end:{x:right,y},thickness:1,color:line})
  y-=24

  page.drawText('DETALLE',{x:left,y,size:8,font:bold,color:violet})
  page.drawText('IMPORTE',{x:right-65,y,size:8,font:bold,color:violet})
  y-=22
  const concept=(inv.concept||'Productos / servicios').slice(0,110)
  page.drawText(concept,{x:left,y,size:10,font:regular,color:dark,maxWidth:right-left-105})
  page.drawText(`$ ${inv.amount.toLocaleString('es-AR',{minimumFractionDigits:2,maximumFractionDigits:2})}`,{x:right-100,y,size:10,font:bold,color:dark})
  y-=38
  page.drawLine({start:{x:left,y},end:{x:right,y},thickness:1,color:line})
  y-=28
  page.drawText('TOTAL',{x:right-170,y,size:11,font:bold,color:gray})
  page.drawText(`$ ${inv.amount.toLocaleString('es-AR',{minimumFractionDigits:2,maximumFractionDigits:2})}`,{x:right-100,y,size:13,font:bold,color:dark})

  const qrUrl=arcaQrUrl(issuer,inv)
  const qrData=await QRCode.toDataURL(qrUrl,{margin:1,width:260,errorCorrectionLevel:'M'})
  const qrBytes=Uint8Array.from(atob(qrData.split(',')[1]),c=>c.charCodeAt(0))
  const qr=await pdf.embedPng(qrBytes)
  page.drawImage(qr,{x:left,y:118,width:115,height:115})
  page.drawText('ARCA',{x:left+132,y:210,size:20,font:bold,color:dark})
  page.drawText(`CAE N°: ${inv.cae}`,{x:left+132,y:181,size:10,font:bold,color:dark})
  page.drawText(`Fecha Vto. CAE: ${displayDate(inv.caeExpiration)}`,{x:left+132,y:163,size:9,font:regular,color:gray})
  page.drawText('Comprobante autorizado electrónicamente.',{x:left+132,y:143,size:8,font:regular,color:gray})
  page.drawText('FacturaLlena',{x:right-82,y:57,size:9,font:bold,color:gray})

  return new Blob([await pdf.save()],{type:'application/pdf'})
}
