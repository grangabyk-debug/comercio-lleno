'use client'

import {useEffect,useMemo,useState} from 'react'
import styles from './certificate.module.css'

type Result={area:string;score:number;name:string;short:string;description:string;areas:string[];roles:string[]}
const KEY='postula_vocational_result_v1'

function esc(v:string){return v.replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[m]||m))}
function wrap(text:string,max=42){const words=text.split(/\s+/);const out:string[]=[];let line='';for(const word of words){const next=(line+' '+word).trim();if(next.length>max&&line){out.push(line);line=word}else line=next}if(line)out.push(line);return out.slice(0,3)}

export default function VocationalCertificate(){
 const[result,setResult]=useState<Result[]|null>(null)
 useEffect(()=>{
  const read=()=>{try{const raw=localStorage.getItem(KEY);if(!raw)return;const parsed=JSON.parse(raw);if(Array.isArray(parsed)&&parsed.length>=3)setResult(parsed)}catch{}}
  read();const id=window.setInterval(read,400);return()=>window.clearInterval(id)
 },[])
 const top=useMemo(()=>result?.slice(0,3)||[],[result])
 if(!result||top.length<3)return null
 const code=top.map(x=>x.area).join(' · ')
 function download(){
  const date=new Intl.DateTimeFormat('es-AR',{day:'2-digit',month:'long',year:'numeric'}).format(new Date())
  const cards=top.map((x,i)=>{
    const y=395+i*155,areaLines=wrap((x.areas||[]).slice(0,3).join(' · '),54)
    return `<g><rect x="155" y="${y}" width="1290" height="126" rx="24" fill="rgba(255,255,255,.78)" stroke="rgba(17,19,24,.10)"/><circle cx="222" cy="${y+63}" r="37" fill="${i===0?'#d9ff61':i===1?'#ded8ff':'#dcecff'}"/><text x="222" y="${y+75}" text-anchor="middle" font-size="38" font-weight="900" fill="#15171b">${esc(x.area)}</text><text x="285" y="${y+43}" font-size="29" font-weight="900" fill="#15171b">${esc(x.name)}</text><text x="285" y="${y+78}" font-size="21" font-weight="700" fill="#4f5660">${esc(x.short)}</text>${areaLines.map((l,n)=>`<text x="910" y="${y+45+n*27}" font-size="18" font-weight="650" fill="#555c65">${esc(l)}</text>`).join('')}</g>`
  }).join('')
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1000" viewBox="0 0 1600 1000"><defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#fbfff0"/><stop offset=".5" stop-color="#f7f5ff"/><stop offset="1" stop-color="#eef5ff"/></linearGradient><filter id="glow"><feGaussianBlur stdDeviation="22"/></filter></defs><rect width="1600" height="1000" fill="url(#bg)"/><circle cx="128" cy="80" r="170" fill="#d9ff61" opacity=".18" filter="url(#glow)"/><circle cx="1480" cy="180" r="220" fill="#6957ff" opacity=".12" filter="url(#glow)"/><rect x="62" y="62" width="1476" height="876" rx="40" fill="none" stroke="#1a1c21" stroke-width="2" opacity=".18"/><text x="800" y="132" text-anchor="middle" font-family="Arial,sans-serif" font-size="36" font-weight="900" fill="#17191d">postula<tspan fill="#6957ff">mejor</tspan><tspan fill="#555b64">.com</tspan></text><text x="800" y="226" text-anchor="middle" font-family="Arial,sans-serif" font-size="51" font-weight="900" fill="#17191d">Resumen de intereses vocacionales y laborales</text><text x="800" y="280" text-anchor="middle" font-family="Arial,sans-serif" font-size="21" font-weight="600" fill="#545b64">Resultado orientativo basado en el marco RIASEC / Holland</text><rect x="570" y="308" width="460" height="60" rx="30" fill="#17191d"/><text x="800" y="348" text-anchor="middle" font-family="Arial,sans-serif" font-size="28" font-weight="900" fill="#d9ff61">${esc(code)}</text>${cards}<text x="155" y="895" font-family="Arial,sans-serif" font-size="19" font-weight="700" fill="#363c44">Emitido por PostuláMejor.com · ${esc(date)}</text><text x="155" y="928" font-family="Arial,sans-serif" font-size="15" font-weight="500" fill="#6a7078">Herramienta orientativa. No constituye diagnóstico psicológico, certificación profesional ni indica una carrera obligatoria.</text></svg>`
  const blob=new Blob([svg],{type:'image/svg+xml;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`Resumen-vocacional-${top.map(x=>x.area).join('')}-PostulaMejor.svg`;a.click();URL.revokeObjectURL(url)
 }
 function print(){
  const win=window.open('','_blank','noopener,noreferrer');if(!win)return
  const date=new Intl.DateTimeFormat('es-AR',{dateStyle:'long'}).format(new Date())
  win.document.write(`<html><head><title>Resumen vocacional · Postulá Mejor</title><style>body{font-family:Arial,sans-serif;margin:0;background:#f5f5f2;color:#17191d}.sheet{max-width:900px;margin:30px auto;background:white;padding:55px;border:1px solid #ddd;border-radius:24px}.brand{text-align:center;font-size:28px;font-weight:900}.brand b{color:#6957ff}h1{text-align:center;font-size:36px;margin:45px 0 8px}.code{text-align:center;margin:25px auto;background:#17191d;color:#d9ff61;border-radius:99px;padding:12px 20px;width:max-content;font-size:24px;font-weight:900}.row{border:1px solid #ddd;border-radius:16px;padding:18px;margin:10px 0}.row h2{margin:0 0 6px}.row p{margin:4px 0;color:#3d434b}.foot{margin-top:38px;color:#666;font-size:12px;line-height:1.6}@media print{body{background:white}.sheet{border:0;margin:0;max-width:none}}</style></head><body><div class="sheet"><div class="brand">postula<b>mejor</b>.com</div><h1>Resumen de intereses vocacionales y laborales</h1><p style="text-align:center">Resultado orientativo basado en el marco RIASEC / Holland</p><div class="code">${esc(code)}</div>${top.map((x,i)=>`<div class="row"><h2>${i+1}. ${esc(x.name)} · ${esc(x.short)}</h2><p>${esc(x.description)}</p><p><b>Áreas:</b> ${esc((x.areas||[]).join(' · '))}</p></div>`).join('')}<div class="foot">Emitido por PostuláMejor.com · ${esc(date)}<br>Herramienta orientativa. No constituye diagnóstico psicológico, certificación profesional ni indica una carrera obligatoria.</div></div><script>window.onload=()=>window.print()</script></body></html>`);win.document.close()
 }
 return <section className={styles.wrap}><div><span>RESUMEN PERSONAL</span><h2>Llevate tu resultado.</h2><p>Descargá un certificado visual con tu código RIASEC y tus tres intereses predominantes. Es un resumen orientativo para conservar o compartir, no una certificación profesional.</p></div><div className={styles.actions}><button onClick={download}>Descargar certificado</button><button className={styles.secondary} onClick={print}>Guardar / imprimir PDF</button></div></section>
}
