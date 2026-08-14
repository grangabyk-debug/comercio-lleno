import type { CashSummary } from './cash-api'

const numberAr=new Intl.NumberFormat('es-AR',{minimumFractionDigits:2,maximumFractionDigits:2})
const dateAr=new Intl.DateTimeFormat('es-AR',{timeZone:'America/Argentina/Buenos_Aires',day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false})

function amount(value:number|undefined|null){const n=Number(value||0);return `${n<0?'-':''}$ ${numberAr.format(Math.abs(n))}`}
function dateTime(value:string){return dateAr.format(new Date(value)).replace(',', ' -')}
function duration(opened:string,closed:string){const ms=Math.max(0,new Date(closed).getTime()-new Date(opened).getTime()),mins=Math.floor(ms/60000),h=Math.floor(mins/60),m=mins%60;return h?`${h} h ${m} min`:`${m} min`}
function paymentName(name:string){const key=name.trim().toLowerCase();if(key==='cash'||key==='efectivo')return 'Efectivo';if(key==='wallet'||key==='billetera'||key==='billetera virtual')return 'Billetera virtual';if(key==='debit'||key==='debito'||key==='débito')return 'Débito';if(key==='credit'||key==='credito'||key==='crédito')return 'Crédito';if(key==='transfer'||key==='transferencia')return 'Transferencia';return name.trim()||'Otro medio'}
function paymentEntries(summary:CashSummary){return Object.entries(summary.payments||{}).map(([name,value])=>({name:paymentName(name),value:Number(value||0)})).sort((a,b)=>b.value-a.value)}
function differenceValue(summary:CashSummary){return Number(summary.difference??(Number(summary.counted_cash??summary.expected_cash??0)-Number(summary.expected_cash||0)))}
function differenceLabel(summary:CashSummary){const diff=differenceValue(summary);return Math.abs(diff)<0.005?'Caja exacta':diff>0?'Sobrante':'Faltante'}

function plainLines(summary:CashSummary,company:string){const payments=paymentEntries(summary);return [
  'CIERRE DE CAJA',
  company,
  `Apertura: ${dateTime(summary.opened_at)}`,
  `Cierre: ${dateTime(summary.closed_at)}`,
  `Duración: ${duration(summary.opened_at,summary.closed_at)}`,
  `Monto inicial: ${amount(summary.opening_amount)}`,
  `Ventas: ${amount(summary.sales_total)} (${summary.sales_count||0} operaciones)`,
  'MEDIOS DE PAGO',
  ...payments.map(p=>`${p.name}: ${amount(p.value)}`),
  `Ingresos de caja: ${amount(summary.income)}`,
  `Gastos: ${amount(summary.expenses)}`,
  `Retiros: ${amount(summary.egress)}`,
  `Efectivo esperado: ${amount(summary.expected_cash)}`,
  `Efectivo contado: ${amount(summary.counted_cash??summary.expected_cash)}`,
  `Diferencia: ${amount(differenceValue(summary))} (${differenceLabel(summary)})`,
]}

export function cashCloseText(summary:CashSummary,company:string){return plainLines(summary,company).join('\n')}
export function cashWhatsAppText(summary:CashSummary,company:string){return `Hola, te envío el cierre de caja de ${company}.\n\n${cashCloseText(summary,company)}`}

function esc(s:string){return s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]||c))}
function row(label:string,value:string,extraClass=''){return `<div class="row ${extraClass}"><span>${esc(label)}</span><strong>${esc(value)}</strong></div>`}
function ticketHtml(summary:CashSummary,company:string,paper:'58'|'80'){
  const payments=paymentEntries(summary),diff=differenceValue(summary),status=differenceLabel(summary)
  const paymentRows=payments.length?payments.map(p=>row(p.name,amount(p.value))).join(''):row('Medios registrados','Sin ventas')
  const font=paper==='58'?'11px':'12px'
  return `<!doctype html><html><head><meta charset="utf-8"><style>
    @page{size:${paper}mm auto;margin:0}
    html,body{width:${paper}mm;margin:0;padding:0;background:#fff;color:#000}
    *{box-sizing:border-box}
    body{font-family:Arial,Helvetica,sans-serif;font-size:${font};line-height:1.28;padding:2.3mm}
    .receipt{width:100%}.brand{text-align:center;font-size:${paper==='58'?'15px':'17px'};font-weight:900;letter-spacing:.25px;text-transform:uppercase;overflow-wrap:anywhere}
    .doc{text-align:center;font-size:10px;font-weight:800;letter-spacing:.65px;margin-top:2px}.sub{text-align:center;font-size:9px;margin-top:2px}
    .rule{border-top:1px dashed #000;margin:6px 0}.section{font-size:9px;font-weight:900;letter-spacing:.55px;margin:7px 0 3px;text-transform:uppercase}
    .row{display:flex;align-items:flex-start;justify-content:space-between;gap:5px;margin:2px 0}.row span{min-width:0}.row strong{text-align:right;white-space:nowrap;font-weight:800}
    .sales{font-size:12px;margin:4px 0}.box{border:1px solid #000;padding:5px;margin-top:6px}.box .row{margin:3px 0}.difference{font-size:12px;padding-top:4px;border-top:1px solid #000;margin-top:4px}
    .status{text-align:center;font-weight:900;font-size:12px;margin-top:5px;padding:4px 2px;border:1px solid #000}.footer{text-align:center;font-size:8.5px;margin-top:7px}
  </style></head><body><div class="receipt">
    <div class="brand">${esc(company)}</div><div class="doc">CIERRE DE CAJA</div><div class="sub">Documento interno - no fiscal</div>
    <div class="rule"></div>
    ${row('Apertura',dateTime(summary.opened_at))}${row('Cierre',dateTime(summary.closed_at))}${row('Duración',duration(summary.opened_at,summary.closed_at))}${row('Monto inicial',amount(summary.opening_amount))}
    <div class="rule"></div>${row('VENTAS',amount(summary.sales_total),'sales')}${row('Operaciones',String(summary.sales_count||0))}
    <div class="section">Medios de pago</div>${paymentRows}
    <div class="section">Movimientos de caja</div>${row('Ingresos',amount(summary.income))}${row('Gastos',amount(summary.expenses))}${row('Retiros',amount(summary.egress))}
    <div class="box">${row('Efectivo esperado',amount(summary.expected_cash))}${row('Efectivo contado',amount(summary.counted_cash??summary.expected_cash))}${row('Diferencia',amount(diff),'difference')}<div class="status">${esc(status.toUpperCase())}</div></div>
    <div class="footer">Comercio Lleno - Cierre generado automáticamente</div>
  </div></body></html>`
}

export async function printCashClose(summary:CashSummary,company:string,paper:'58'|'80'='58',printerName=''){
  const html=ticketHtml(summary,company,paper)
  if(typeof window!=='undefined'&&window.ComercioLlenoPrintBridge?.printHtml){await window.ComercioLlenoPrintBridge.printHtml({html,printerName,paper,copies:1});return}
  const frame=document.createElement('iframe');frame.style.cssText='position:fixed;width:1px;height:1px;opacity:0;border:0';document.body.appendChild(frame);const doc=frame.contentDocument;if(!doc){frame.remove();return}doc.open();doc.write(html);doc.close();await new Promise(r=>setTimeout(r,180));frame.contentWindow?.print();setTimeout(()=>frame.remove(),1000)
}

const winAnsiExtra:Record<number,number>={0x20ac:128,0x201a:130,0x0192:131,0x201e:132,0x2026:133,0x2020:134,0x2021:135,0x02c6:136,0x2030:137,0x0160:138,0x2039:139,0x0152:140,0x017d:142,0x2018:145,0x2019:146,0x201c:147,0x201d:148,0x2022:149,0x2013:150,0x2014:151,0x02dc:152,0x2122:153,0x0161:154,0x203a:155,0x0153:156,0x017e:158,0x0178:159}
function pdfEsc(value:string){let out='';for(const ch of value.normalize('NFC')){const cp=ch.codePointAt(0)??63,byte=cp<=255?cp:(winAnsiExtra[cp]??63);if(byte===92)out+='\\\\';else if(byte===40)out+='\\(';else if(byte===41)out+='\\)';else if(byte>=32&&byte<=126)out+=String.fromCharCode(byte);else out+=`\\${byte.toString(8).padStart(3,'0')}`}return out}
function clip(value:string,max:number){return value.length<=max?value:`${value.slice(0,Math.max(0,max-1))}…`}
function pdfDocument(summary:CashSummary,company:string){
  const c:string[]=[]
  const text=(x:number,y:number,size:number,value:string,bold=false,color='0.08 0.12 0.20')=>c.push(`${color} rg BT /${bold?'F2':'F1'} ${size} Tf 1 0 0 1 ${x} ${y} Tm (${pdfEsc(value)}) Tj ET`)
  const line=(x1:number,y1:number,x2:number,y2:number,color='0.84 0.87 0.91',width=1)=>c.push(`${color} RG ${width} w ${x1} ${y1} m ${x2} ${y2} l S`)
  const rect=(x:number,y:number,w:number,h:number,fill:string,stroke?:string)=>c.push(`${fill} rg ${stroke?`${stroke} RG 1 w `:''}${x} ${y} ${w} ${h} re ${stroke?'B':'f'}`)
  const diff=differenceValue(summary),payments=paymentEntries(summary),visiblePayments=payments.length>8?[...payments.slice(0,7),{name:'Otros medios',value:payments.slice(7).reduce((a,p)=>a+p.value,0)}]:payments

  rect(0,0,595,842,'0.975 0.98 0.988')
  rect(0,700,595,142,'0.055 0.09 0.17')
  text(45,810,10,'COMERCIO LLENO',true,'0.52 0.84 0.69')
  text(45,781,23,clip(company,34),true,'1 1 1')
  text(45,753,15,'Cierre de caja',true,'1 1 1')
  text(45,730,9,'Documento interno - no fiscal',false,'0.82 0.86 0.92')
  text(410,810,8,'FECHA DE CIERRE',true,'0.82 0.86 0.92')
  text(410,794,9,dateTime(summary.closed_at),true,'1 1 1')

  const cards=[{x:45,label:'Ventas',value:amount(summary.sales_total)},{x:215,label:'Operaciones',value:String(summary.sales_count||0)},{x:385,label:'Diferencia',value:amount(diff)}]
  cards.forEach(card=>{rect(card.x,622,150,58,'1 1 1','0.88 0.90 0.93');text(card.x+14,659,8,card.label.toUpperCase(),true,'0.34 0.40 0.49');text(card.x+14,636,15,card.value,true)})

  text(45,585,13,'Resumen del turno',true)
  line(45,575,550,575)
  const left=[['Apertura',dateTime(summary.opened_at)],['Cierre',dateTime(summary.closed_at)]]
  const right=[['Monto inicial',amount(summary.opening_amount)],['Duración',duration(summary.opened_at,summary.closed_at)]]
  left.forEach(([label,value],i)=>{const y=548-i*28;text(45,y,8,label.toUpperCase(),true,'0.40 0.45 0.52');text(45,y-14,10,value,true)})
  right.forEach(([label,value],i)=>{const y=548-i*28;text(310,y,8,label.toUpperCase(),true,'0.40 0.45 0.52');text(310,y-14,10,value,true)})

  let y=468
  text(45,y,13,'Medios de pago',true);line(45,y-10,550,y-10);y-=34
  if(!visiblePayments.length){text(45,y,10,'Sin medios de pago registrados',false,'0.40 0.45 0.52');y-=22}else visiblePayments.forEach(p=>{text(45,y,10,p.name);text(440,y,10,amount(p.value),true);y-=22})

  y-=4;text(45,y,13,'Movimientos de caja',true);line(45,y-10,550,y-10);y-=34
  ;[['Ingresos',amount(summary.income)],['Gastos',amount(summary.expenses)],['Retiros',amount(summary.egress)]].forEach(([label,value])=>{text(45,y,10,label);text(440,y,10,value,true);y-=22})

  const boxY=Math.max(58,y-104);rect(45,boxY,505,96,'1 1 1','0.84 0.87 0.91')
  text(61,boxY+72,8,'ARQUEO DE EFECTIVO',true,'0.34 0.40 0.49')
  text(61,boxY+50,10,'Esperado');text(202,boxY+50,11,amount(summary.expected_cash),true)
  text(61,boxY+27,10,'Contado');text(202,boxY+27,11,amount(summary.counted_cash??summary.expected_cash),true)
  line(355,boxY+16,355,boxY+80)
  text(376,boxY+66,8,differenceLabel(summary).toUpperCase(),true,diff<0?'0.70 0.16 0.18':diff>0?'0.10 0.48 0.28':'0.20 0.45 0.35')
  text(376,boxY+40,16,amount(diff),true)

  text(45,28,8,'Comercio Lleno - Cierre generado automáticamente',false,'0.45 0.49 0.56')
  text(456,28,8,'Página 1 de 1',false,'0.45 0.49 0.56')

  const stream=c.join('\n'),objects=[
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>',
    `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`,
  ]
  let pdf='%PDF-1.4\n',offsets=[0]
  objects.forEach((obj,i)=>{offsets.push(pdf.length);pdf+=`${i+1} 0 obj\n${obj}\nendobj\n`})
  const xref=pdf.length;pdf+=`xref\n0 ${objects.length+1}\n0000000000 65535 f \n`;offsets.slice(1).forEach(offset=>pdf+=`${String(offset).padStart(10,'0')} 00000 n \n`);pdf+=`trailer\n<< /Size ${objects.length+1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`
  return new TextEncoder().encode(pdf)
}

export function cashClosePdf(summary:CashSummary,company:string){return new Blob([pdfDocument(summary,company)],{type:'application/pdf'})}
export function downloadCashClosePdf(summary:CashSummary,company:string){const blob=cashClosePdf(summary,company),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`cierre-caja-${new Date(summary.closed_at).toISOString().slice(0,10)}.pdf`;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1200)}
export function openCashWhatsApp(phone:string|undefined|null,summary:CashSummary,company:string){const digits=String(phone||'').replace(/\D/g,'');if(!digits)throw new Error('El propietario todavía no tiene un WhatsApp cargado en Configuración.');window.open(`https://wa.me/${digits}?text=${encodeURIComponent(cashWhatsAppText(summary,company))}`,'_blank','noopener,noreferrer')}
