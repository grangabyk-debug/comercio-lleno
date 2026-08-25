'use client'

import { useEffect, useRef, useState } from 'react'
import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from 'pdf-lib'
import { loadCommerceSnapshot } from '@/lib/comercio/api'
import { readTenantSession } from '@/lib/comercio/session'
import type { CompanyProfile, Sale, SaleItem } from '@/lib/comercio/types'

const money = new Intl.NumberFormat('es-AR', { style:'currency', currency:'ARS', maximumFractionDigits:0 })
const A4:[number,number]=[595.28,841.89]

function text(node:Element|null){return(node?.textContent||'').replace(/\s+/g,' ').trim()}
function dayKey(value:Date|string){
  const d=typeof value==='string'?new Date(value):value
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
}
function safePdfText(value:string){return String(value||'').replace(/[^\u0009\u000A\u000D\u0020-\u00FF]/g,' ')}
function safeDate(value?:string|null){
  if(!value)return''
  if(/^\d{8}$/.test(value))return`${value.slice(6,8)}/${value.slice(4,6)}/${value.slice(0,4)}`
  const parsed=new Date(value)
  return Number.isNaN(parsed.getTime())?value:parsed.toLocaleDateString('es-AR')
}
function authorized(sale:Sale){return sale.fiscal_status==='authorized'&&Boolean(sale.cae)}
function saleItems(sale:Sale):SaleItem[]{return Array.isArray(sale.details?.items)?sale.details!.items!:[]}
function invoiceName(sale:Sale){return `${authorized(sale)?'Factura':'Comprobante'}-${sale.receiptNumber||sale.id.slice(0,8)}.pdf`}
function htmlEscape(value:string){return String(value||'').replace(/[&<>"']/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[char]||char))}
function wrap(value:string,font:PDFFont,size:number,maxWidth:number){
  const words=safePdfText(value).split(/\s+/).filter(Boolean)
  if(!words.length)return['']
  const lines:string[]=[]
  let line=''
  for(const word of words){
    const candidate=line?`${line} ${word}`:word
    if(font.widthOfTextAtSize(candidate,size)<=maxWidth){line=candidate;continue}
    if(line)lines.push(line)
    line=word
  }
  if(line)lines.push(line)
  return lines
}

async function buildA4Pdf(sale:Sale,company:CompanyProfile|null){
  const pdf=await PDFDocument.create()
  const regular=await pdf.embedFont(StandardFonts.Helvetica)
  const bold=await pdf.embedFont(StandardFonts.HelveticaBold)
  const dark=rgb(.12,.09,.14)
  const muted=rgb(.42,.38,.45)
  const violet=rgb(.43,.19,.86)
  const orange=rgb(1,.34,.08)
  const line=rgb(.86,.84,.88)
  const pale=rgb(.97,.96,.98)
  const fiscal=authorized(sale)
  const items=saleItems(sale)
  let page:PDFPage
  let y=0
  let pageNumber=0

  const drawHeader=()=>{
    page=pdf.addPage(A4)
    pageNumber+=1
    const width=A4[0]
    page.drawText(safePdfText(company?.legal_name||company?.name||'Comercio Lleno'),{x:42,y:792,size:17,font:bold,color:dark})
    page.drawText('ComercioLleno.com',{x:42,y:773,size:9.5,font:regular,color:violet})
    if(company?.tax_id)page.drawText(`CUIT: ${safePdfText(company.tax_id)}`,{x:42,y:755,size:9.5,font:regular,color:muted})

    page.drawRectangle({x:420,y:754,width:133,height:58,borderColor:fiscal?violet:muted,borderWidth:1.3,color:rgb(1,1,1)})
    page.drawText(fiscal?'FACTURA C':'COMPROBANTE',{x:fiscal?445:430,y:785,size:fiscal?18:13,font:bold,color:fiscal?violet:dark})
    page.drawText(fiscal&&sale.receiptNumber?`Nro. ${sale.receiptNumber}`:'Venta registrada',{x:438,y:765,size:8.5,font:regular,color:muted})

    page.drawLine({start:{x:42,y:734},end:{x:553,y:734},thickness:1,color:line})
    page.drawText('Fecha',{x:42,y:713,size:8.5,font:bold,color:muted})
    page.drawText(safePdfText(new Date(sale.date).toLocaleString('es-AR')),{x:42,y:698,size:10,font:regular,color:dark})
    page.drawText('Medio de pago',{x:240,y:713,size:8.5,font:bold,color:muted})
    page.drawText(safePdfText(sale.payment),{x:240,y:698,size:10,font:regular,color:dark})
    page.drawText('Estado',{x:430,y:713,size:8.5,font:bold,color:muted})
    page.drawText(fiscal?'Autorizada por ARCA':'Factura pendiente',{x:430,y:698,size:9.5,font:regular,color:fiscal?violet:orange})

    if(pageNumber>1)page.drawText(`Continuación - página ${pageNumber}`,{x:42,y:675,size:8,font:regular,color:muted})
    page.drawRectangle({x:42,y:648,width:511,height:27,color:pale})
    page.drawText('Descripción',{x:50,y:658,size:9,font:bold,color:dark})
    page.drawText('Cant.',{x:354,y:658,size:9,font:bold,color:dark})
    page.drawText('Precio',{x:407,y:658,size:9,font:bold,color:dark})
    page.drawText('Subtotal',{x:487,y:658,size:9,font:bold,color:dark})
    y=630
  }

  drawHeader()
  const rows=items.length?items:[{product_id:'sale',name:'Venta',qty:1,unit_price:sale.total,line_total:sale.total}]
  for(const item of rows){
    const description=wrap(String(item.name||'Producto'),regular,9.2,285)
    const rowHeight=Math.max(25,description.length*12+7)
    if(y-rowHeight<205)drawHeader()
    description.forEach((value,index)=>page.drawText(value,{x:50,y:y-index*12,size:9.2,font:regular,color:dark}))
    page.drawText(String(item.qty),{x:360,y,size:9.2,font:regular,color:dark})
    const unit=money.format(Number(item.unit_price||0))
    const subtotal=money.format(Number(item.line_total||Number(item.unit_price||0)*Number(item.qty||0)))
    page.drawText(safePdfText(unit),{x:472-regular.widthOfTextAtSize(safePdfText(unit),9.2),y,size:9.2,font:regular,color:dark})
    page.drawText(safePdfText(subtotal),{x:548-regular.widthOfTextAtSize(safePdfText(subtotal),9.2),y,size:9.2,font:regular,color:dark})
    y-=rowHeight
    page.drawLine({start:{x:42,y:y+7},end:{x:553,y:y+7},thickness:.5,color:line})
  }

  if(y<190)drawHeader()
  page.drawRectangle({x:354,y:y-64,width:199,height:54,color:pale,borderColor:line,borderWidth:.8})
  page.drawText('TOTAL',{x:369,y:y-35,size:10,font:bold,color:muted})
  const total=safePdfText(money.format(sale.total))
  page.drawText(total,{x:539-bold.widthOfTextAtSize(total,18),y:y-39,size:18,font:bold,color:dark})
  y-=92

  if(fiscal){
    page.drawLine({start:{x:42,y},end:{x:553,y},thickness:1,color:line})
    y-=24
    page.drawText('Datos fiscales',{x:42,y,size:10,font:bold,color:dark})
    y-=20
    page.drawText(`CAE: ${safePdfText(sale.cae||'')}`,{x:42,y,size:10,font:regular,color:dark})
    if(sale.caeExpiration)page.drawText(`Vencimiento CAE: ${safePdfText(safeDate(sale.caeExpiration))}`,{x:310,y,size:10,font:regular,color:dark})
    y-=24
    page.drawText('Comprobante electrónico autorizado. Conserve este archivo como respaldo de la operación.',{x:42,y,size:8.5,font:regular,color:muted})
  }else{
    page.drawRectangle({x:42,y:y-48,width:511,height:42,color:rgb(1,.96,.91),borderColor:rgb(1,.72,.45),borderWidth:.8})
    page.drawText('Esta venta todavía no posee una factura fiscal autorizada.',{x:54,y:y-30,size:9.5,font:bold,color:orange})
  }

  page.drawText(`Generado desde ComercioLleno.com - Página ${pageNumber}`,{x:42,y:34,size:7.5,font:regular,color:muted})
  const bytes=await pdf.save()
  return new Blob([bytes.slice().buffer as ArrayBuffer],{type:'application/pdf'})
}

function printHtml(sale:Sale,company:CompanyProfile|null){
  const fiscal=authorized(sale)
  const items=saleItems(sale)
  const rows=(items.length?items:[{name:'Venta',qty:1,unit_price:sale.total,line_total:sale.total}]).map(item=>`<tr><td>${htmlEscape(String(item.name||'Producto'))}</td><td class="center">${item.qty}</td><td class="right">${htmlEscape(money.format(Number(item.unit_price||0)))}</td><td class="right">${htmlEscape(money.format(Number(item.line_total||Number(item.unit_price||0)*Number(item.qty||0))))}</td></tr>`).join('')
  return `<!doctype html><html><head><meta charset="utf-8"><title>${fiscal?'Factura C':'Comprobante de venta'}</title><style>@page{size:A4;margin:12mm}*{box-sizing:border-box}body{font-family:Arial,Helvetica,sans-serif;color:#1d1821;margin:0;background:#fff}.sheet{width:100%;min-height:273mm;padding:4mm}.top{display:flex;justify-content:space-between;gap:20px;border-bottom:1px solid #ddd;padding-bottom:18px}.brand h1{font-size:21px;margin:0 0 5px}.brand p,.meta span,.small{font-size:12px;color:#706874;margin:3px 0}.kind{border:1.5px solid #6d36d8;border-radius:5px;width:150px;padding:15px 10px;text-align:center}.kind b{display:block;font-size:22px;color:#6d36d8}.kind span{font-size:11px;color:#706874}.meta{display:grid;grid-template-columns:1.2fr 1fr 1fr;gap:16px;padding:18px 0}.meta b{display:block;font-size:13px;margin-top:4px}.table{width:100%;border-collapse:collapse;margin-top:8px}.table th{background:#f4f1f6;text-align:left;padding:10px 8px;font-size:12px}.table td{padding:10px 8px;border-bottom:1px solid #e8e3ea;font-size:12px}.center{text-align:center}.right{text-align:right}.total{margin:24px 0 0 auto;width:220px;background:#f4f1f6;padding:16px;text-align:right;border-radius:5px}.total span{font-size:12px;color:#706874}.total b{display:block;font-size:25px;margin-top:5px}.fiscal{border-top:1px solid #ddd;margin-top:28px;padding-top:18px;font-size:12px;line-height:1.7}.pending{background:#fff4e8;border:1px solid #ffc98f;padding:14px;margin-top:28px;font-size:12px}.foot{margin-top:28px;font-size:10px;color:#7b7380}</style></head><body><div class="sheet"><div class="top"><div class="brand"><h1>${htmlEscape(company?.legal_name||company?.name||'Comercio Lleno')}</h1><p>ComercioLleno.com</p>${company?.tax_id?`<p>CUIT: ${htmlEscape(company.tax_id)}</p>`:''}</div><div class="kind"><b>${fiscal?'FACTURA C':'COMPROBANTE'}</b><span>${fiscal&&sale.receiptNumber?`Nro. ${sale.receiptNumber}`:'Venta registrada'}</span></div></div><div class="meta"><div><span>Fecha</span><b>${htmlEscape(new Date(sale.date).toLocaleString('es-AR'))}</b></div><div><span>Medio de pago</span><b>${htmlEscape(sale.payment)}</b></div><div><span>Estado</span><b>${fiscal?'Autorizada por ARCA':'Factura pendiente'}</b></div></div><table class="table"><thead><tr><th>Descripción</th><th class="center">Cant.</th><th class="right">Precio</th><th class="right">Subtotal</th></tr></thead><tbody>${rows}</tbody></table><div class="total"><span>TOTAL</span><b>${htmlEscape(money.format(sale.total))}</b></div>${fiscal?`<div class="fiscal"><b>Datos fiscales</b><br>CAE: ${htmlEscape(sale.cae||'')}<br>Vencimiento CAE: ${htmlEscape(safeDate(sale.caeExpiration))}</div>`:`<div class="pending"><b>Factura pendiente</b><br>Esta venta todavía no posee una factura fiscal autorizada.</div>`}<div class="foot">Comprobante generado desde ComercioLleno.com</div></div><script>setTimeout(function(){window.print()},250)<\/script></body></html>`
}

export default function MobileInvoiceExperience(){
  const[selectedSale,setSelectedSale]=useState<Sale|null>(null)
  const[company,setCompany]=useState<CompanyProfile|null>(null)
  const[message,setMessage]=useState('')
  const refreshOnCloseRef=useRef(false)
  const timerRef=useRef<number|undefined>(undefined)

  function show(value:string,ms=2800){
    setMessage(value)
    if(timerRef.current)window.clearTimeout(timerRef.current)
    if(ms>0)timerRef.current=window.setTimeout(()=>setMessage(''),ms)
  }

  useEffect(()=>{
    let disposed=false
    let frame=0
    const syncRows=()=>{
      if(disposed)return
      let index=0
      Array.from(document.querySelectorAll('[class*="saleHistory"]')).forEach(node=>{
        const row=node as HTMLElement
        if(/preview/i.test(text(row)))return
        row.dataset.mobileSaleHistoryIndex=String(index++)
        row.setAttribute('role','button')
        row.setAttribute('tabindex','0')
        row.setAttribute('title','Tocar para abrir la venta')
        row.style.setProperty('cursor','pointer','important')
        row.style.setProperty('transition','transform .15s ease,background .15s ease','important')
      })
    }
    const schedule=()=>{
      if(disposed||frame)return
      frame=window.requestAnimationFrame(()=>{frame=0;syncRows()})
    }
    syncRows()
    const observer=new MutationObserver(schedule)
    observer.observe(document.body,{childList:true,subtree:true})

    const openByIndex=async(index:number)=>{
      const session=readTenantSession()
      if(!session)return
      show('Abriendo venta…',1200)
      try{
        const snapshot=await loadCommerceSnapshot(session)
        const today=dayKey(new Date())
        const sales=snapshot.sales.filter(sale=>dayKey(sale.date)===today).slice(0,8)
        const sale=sales[index]
        if(!sale){show('No encontramos esa venta. Actualizá la pantalla e intentá otra vez.',3200);return}
        setCompany(snapshot.company)
        refreshOnCloseRef.current=false
        setSelectedSale(sale)
        setMessage('')
      }catch(error){show(error instanceof Error?error.message:'No se pudo abrir la venta.',3200)}
    }

    const click=(event:MouseEvent)=>{
      const target=event.target as HTMLElement|null
      const row=target?.closest?.('[data-mobile-sale-history-index]') as HTMLElement|null
      if(!row)return
      event.preventDefault()
      void openByIndex(Number(row.dataset.mobileSaleHistoryIndex||0))
    }
    const keydown=(event:KeyboardEvent)=>{
      if(event.key!=='Enter'&&event.key!==' ')return
      const target=event.target as HTMLElement|null
      const row=target?.closest?.('[data-mobile-sale-history-index]') as HTMLElement|null
      if(!row)return
      event.preventDefault()
      void openByIndex(Number(row.dataset.mobileSaleHistoryIndex||0))
    }
    const completed=(event:Event)=>{
      const detail=(event as CustomEvent<{sale?:Sale;company?:CompanyProfile}>).detail
      if(!detail?.sale)return
      setCompany(detail.company||null)
      refreshOnCloseRef.current=true
      setSelectedSale(detail.sale)
      setMessage('')
    }
    document.addEventListener('click',click,true)
    document.addEventListener('keydown',keydown,true)
    window.addEventListener('comercio:mobile-sale-completed',completed)
    return()=>{
      disposed=true
      observer.disconnect()
      document.removeEventListener('click',click,true)
      document.removeEventListener('keydown',keydown,true)
      window.removeEventListener('comercio:mobile-sale-completed',completed)
      if(frame)window.cancelAnimationFrame(frame)
      if(timerRef.current)window.clearTimeout(timerRef.current)
    }
  },[])

  async function downloadPdf(){
    if(!selectedSale)return
    try{
      const blob=await buildA4Pdf(selectedSale,company)
      const url=URL.createObjectURL(blob)
      const anchor=document.createElement('a')
      anchor.href=url
      anchor.download=invoiceName(selectedSale)
      document.body.appendChild(anchor)
      anchor.click()
      anchor.remove()
      window.setTimeout(()=>URL.revokeObjectURL(url),1800)
      show('PDF A4 descargado.')
    }catch(error){show(error instanceof Error?error.message:'No se pudo generar el PDF.',3400)}
  }

  async function shareWhatsapp(){
    if(!selectedSale)return
    try{
      const blob=await buildA4Pdf(selectedSale,company)
      const file=new File([blob],invoiceName(selectedSale),{type:'application/pdf'})
      const label=authorized(selectedSale)?'factura':'comprobante'
      const shareText=`Te envío ${label} de ${company?.name||'Comercio Lleno'} por ${money.format(selectedSale.total)}.`
      if(typeof navigator.share==='function'){
        try{
          if(typeof navigator.canShare!=='function'||navigator.canShare({files:[file]})){
            show('Se abre el selector del teléfono con el PDF adjunto. Elegí WhatsApp.',3500)
            await navigator.share({title:`${authorized(selectedSale)?'Factura':'Comprobante'} ${selectedSale.receiptNumber||''}`.trim(),text:shareText,files:[file]})
            return
          }
        }catch(error){
          if(error instanceof DOMException&&error.name==='AbortError')return
        }
      }
      const url=URL.createObjectURL(blob)
      const anchor=document.createElement('a')
      anchor.href=url
      anchor.download=invoiceName(selectedSale)
      anchor.click()
      window.setTimeout(()=>URL.revokeObjectURL(url),1800)
      window.open(`https://wa.me/?text=${encodeURIComponent(`${shareText}\nEl PDF A4 quedó descargado para adjuntarlo.`)}`,'_blank')
      show('Tu navegador no permite adjuntar el PDF directamente. Lo descargué y abrí WhatsApp.',4300)
    }catch(error){show(error instanceof Error?error.message:'No se pudo preparar la factura para WhatsApp.',3600)}
  }

  function printInvoice(){
    if(!selectedSale)return
    const popup=window.open('','_blank','noopener,noreferrer')
    if(!popup){show('El navegador bloqueó la ventana de impresión. Habilitá ventanas emergentes e intentá otra vez.',4200);return}
    popup.document.open()
    popup.document.write(printHtml(selectedSale,company))
    popup.document.close()
  }

  function closeModal(){
    setSelectedSale(null)
    if(refreshOnCloseRef.current){
      refreshOnCloseRef.current=false
      window.setTimeout(()=>window.location.reload(),120)
    }
  }

  const fiscal=selectedSale?authorized(selectedSale):false
  const items=selectedSale?saleItems(selectedSale):[]

  return <>
    {selectedSale&&<div role="dialog" aria-modal="true" style={{position:'fixed',inset:0,zIndex:13000,background:'rgba(8,6,10,.78)',backdropFilter:'blur(9px)',display:'grid',placeItems:'center',padding:14}} onMouseDown={event=>{if(event.target===event.currentTarget)closeModal()}}>
      <div style={{width:'min(94vw,480px)',maxHeight:'92vh',overflowY:'auto',background:'#18141c',border:'1px solid rgba(255,255,255,.12)',borderRadius:24,padding:16,color:'#fff',boxShadow:'0 30px 100px rgba(0,0,0,.52)'}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:12,marginBottom:12}}>
          <div><span style={{display:'block',fontSize:9,fontWeight:900,letterSpacing:'.13em',color:fiscal?'#a879ff':'#ff9a67'}}>{fiscal?'FACTURA EMITIDA':'VENTA REGISTRADA'}</span><b style={{display:'block',fontSize:20,marginTop:3}}>{fiscal?'Factura lista':'Factura pendiente'}</b></div>
          <button type="button" onClick={closeModal} aria-label="Cerrar" style={{width:40,height:40,borderRadius:13,border:'1px solid #423849',background:'#251f29',color:'#fff',fontSize:22}}>×</button>
        </div>

        <div style={{background:'#fff',color:'#201a23',borderRadius:12,padding:'17px 15px',boxShadow:'0 14px 38px rgba(0,0,0,.24)',aspectRatio:'210 / 155',overflow:'hidden',position:'relative'}}>
          <div style={{display:'flex',justifyContent:'space-between',gap:12,paddingBottom:10,borderBottom:'1px solid #ddd7e0'}}>
            <div style={{minWidth:0}}><b style={{display:'block',fontSize:13,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{company?.legal_name||company?.name||'Comercio Lleno'}</b><span style={{display:'block',fontSize:7,color:'#786f7c',marginTop:3}}>ComercioLleno.com</span>{company?.tax_id&&<span style={{display:'block',fontSize:7,color:'#786f7c',marginTop:2}}>CUIT {company.tax_id}</span>}</div>
            <div style={{flex:'0 0 auto',border:`1px solid ${fiscal?'#6d36d8':'#8b818f'}`,borderRadius:5,padding:'7px 9px',textAlign:'center'}}><b style={{display:'block',fontSize:11,color:fiscal?'#6d36d8':'#3d3541'}}>{fiscal?'FACTURA C':'COMPROBANTE'}</b><span style={{fontSize:6,color:'#766d79'}}>{fiscal&&selectedSale.receiptNumber?`Nro. ${selectedSale.receiptNumber}`:'Venta registrada'}</span></div>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1.2fr 1fr',gap:8,padding:'10px 0 8px',fontSize:7,color:'#776f7b'}}><div>Fecha<br/><b style={{color:'#241d27'}}>{new Date(selectedSale.date).toLocaleString('es-AR')}</b></div><div>Medio de pago<br/><b style={{color:'#241d27'}}>{selectedSale.payment}</b></div></div>
          <div style={{fontSize:7,borderTop:'1px solid #eee9ef',borderBottom:'1px solid #eee9ef',padding:'6px 0'}}>{items.slice(0,3).map((item,index)=><div key={`${item.product_id}-${index}`} style={{display:'grid',gridTemplateColumns:'1fr auto',gap:8,padding:'2px 0'}}><span>{item.qty} × {item.name}</span><b>{money.format(item.line_total)}</b></div>)}{items.length>3&&<span style={{color:'#7a717e'}}>+ {items.length-3} ítems más</span>}</div>
          <div style={{display:'flex',alignItems:'flex-end',justifyContent:'space-between',gap:8,paddingTop:9}}><span style={{fontSize:7,color:fiscal?'#6d36d8':'#e76325'}}>{fiscal?`CAE ${selectedSale.cae}`:'Sin CAE · factura pendiente'}</span><div style={{textAlign:'right'}}><span style={{display:'block',fontSize:6,color:'#817986'}}>TOTAL</span><b style={{fontSize:16}}>{money.format(selectedSale.total)}</b></div></div>
          <span style={{position:'absolute',right:8,bottom:5,fontSize:5,color:'#aaa2ac'}}>A4</span>
        </div>

        <p style={{margin:'11px 2px 12px',fontSize:11,lineHeight:1.45,color:'#bfb5c3'}}>{fiscal?'El comprobante fiscal quedó autorizado. Podés enviarlo, guardarlo o imprimirlo en formato A4.':'La venta quedó registrada, pero todavía no tiene CAE. Podés abrirla desde Movimientos; cuando tenga factura fiscal aparecerán sus datos.'}</p>

        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8}}>
          <button type="button" onClick={()=>void shareWhatsapp()} style={{minHeight:58,border:0,borderRadius:14,background:'#25D366',color:'#082d18',fontWeight:950,fontSize:11,padding:'8px 5px'}}>WhatsApp</button>
          <button type="button" onClick={()=>void downloadPdf()} style={{minHeight:58,border:0,borderRadius:14,background:'#7a35ef',color:'#fff',fontWeight:950,fontSize:11,padding:'8px 5px'}}>Descargar PDF</button>
          <button type="button" onClick={printInvoice} style={{minHeight:58,border:0,borderRadius:14,background:'#ff641d',color:'#fff',fontWeight:950,fontSize:11,padding:'8px 5px'}}>Imprimir</button>
        </div>
        <button type="button" onClick={closeModal} style={{width:'100%',minHeight:44,marginTop:9,border:'1px solid #43394a',borderRadius:13,background:'#251f29',color:'#e8e0eb',fontWeight:850}}>Listo</button>
      </div>
    </div>}
    {message&&<div style={{position:'fixed',zIndex:13100,left:'50%',top:18,transform:'translateX(-50%)',width:'max-content',maxWidth:'calc(100vw - 28px)',padding:'11px 14px',borderRadius:13,background:'#171218',color:'#fff',fontSize:11,fontWeight:850,boxShadow:'0 12px 34px rgba(0,0,0,.3)',textAlign:'center'}}>{message}</div>}
  </>
}
