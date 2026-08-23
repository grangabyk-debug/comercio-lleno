import type { TenantSession } from './types'

const SUPABASE_URL=process.env.NEXT_PUBLIC_SUPABASE_URL??'https://wtcntclzcubkbtcsqkzc.supabase.co'
const PUBLISHABLE_KEY=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY??'sb_publishable_02U2KDLDTR42KxdcFHtfYw_IDM00Deb'

export type FractionUnit='kg'|'g'|'litro'|'ml'
export type ScaleProtocol='generic'|'systel'|'kretz'
export type ScaleMode='webserial'|'barcode'

export type BusinessModulesSettings={
  fractional:{enabled:boolean;units:FractionUnit[];decimals:number}
  scale:{enabled:boolean;mode:ScaleMode;protocol:ScaleProtocol;baudRate:number;autoRead:boolean}
  apparel:{enabled:boolean;sizes:string[];colors:string[];exchangeTicketDays:number;trackLocation:boolean}
}

export const DEFAULT_BUSINESS_MODULES:BusinessModulesSettings={
  fractional:{enabled:false,units:['kg','g','litro','ml'],decimals:3},
  scale:{enabled:false,mode:'webserial',protocol:'generic',baudRate:9600,autoRead:true},
  apparel:{enabled:false,sizes:['XS','S','M','L','XL'],colors:['Negro','Blanco'],exchangeTicketDays:30,trackLocation:true},
}

function key(companyId:string){return`cl_business_modules_${companyId}`}
function cleanList(value:unknown,fallback:string[]){const rows=Array.isArray(value)?value.map(x=>String(x).trim()).filter(Boolean):fallback;return Array.from(new Set(rows)).slice(0,80)}

export function normalizeBusinessModules(value:Partial<BusinessModulesSettings>|null|undefined):BusinessModulesSettings{
  const fractional=(value as BusinessModulesSettings|undefined)?.fractional
  const scale=(value as BusinessModulesSettings|undefined)?.scale
  const apparel=(value as BusinessModulesSettings|undefined)?.apparel
  const allowed:FractionUnit[]=['kg','g','litro','ml']
  const units=Array.isArray(fractional?.units)?fractional.units.filter(x=>allowed.includes(x)):DEFAULT_BUSINESS_MODULES.fractional.units
  return{
    fractional:{enabled:fractional?.enabled===true,units:units.length?units:DEFAULT_BUSINESS_MODULES.fractional.units,decimals:Math.max(0,Math.min(4,Math.trunc(Number(fractional?.decimals??3)||0)))},
    scale:{enabled:scale?.enabled===true,mode:scale?.mode==='barcode'?'barcode':'webserial',protocol:scale?.protocol==='systel'||scale?.protocol==='kretz'?scale.protocol:'generic',baudRate:[1200,2400,4800,9600,19200,38400,57600,115200].includes(Number(scale?.baudRate))?Number(scale?.baudRate):9600,autoRead:scale?.autoRead!==false},
    apparel:{enabled:apparel?.enabled===true,sizes:cleanList(apparel?.sizes,DEFAULT_BUSINESS_MODULES.apparel.sizes),colors:cleanList(apparel?.colors,DEFAULT_BUSINESS_MODULES.apparel.colors),exchangeTicketDays:Math.max(0,Math.min(365,Math.trunc(Number(apparel?.exchangeTicketDays??30)||0))),trackLocation:apparel?.trackLocation!==false},
  }
}

export function readBusinessModules(companyId:string):BusinessModulesSettings{
  if(typeof window==='undefined')return DEFAULT_BUSINESS_MODULES
  try{return normalizeBusinessModules(JSON.parse(localStorage.getItem(key(companyId))||'null'))}catch{return DEFAULT_BUSINESS_MODULES}
}

function publish(companyId:string,value:BusinessModulesSettings){
  const next=normalizeBusinessModules(value)
  if(typeof window!=='undefined'){
    localStorage.setItem(key(companyId),JSON.stringify(next))
    window.dispatchEvent(new CustomEvent('comercio:business-modules',{detail:next}))
  }
  return next
}

export function saveBusinessModules(companyId:string,value:BusinessModulesSettings){return publish(companyId,value)}

export async function loadBusinessModules(session:TenantSession){
  const cached=readBusinessModules(session.companyId)
  try{
    const response=await fetch(`${SUPABASE_URL}/rest/v1/companies?id=eq.${encodeURIComponent(session.companyId)}&select=business_modules&limit=1`,{headers:{apikey:PUBLISHABLE_KEY,Authorization:`Bearer ${session.token}`},cache:'no-store'})
    const rows=await response.json().catch(()=>[])
    if(!response.ok)return cached
    const remote=Array.isArray(rows)?rows[0]?.business_modules:null
    return publish(session.companyId,remote||cached)
  }catch{return cached}
}

export async function saveBusinessModulesRemote(session:TenantSession,value:BusinessModulesSettings){
  const next=publish(session.companyId,value)
  try{
    const response=await fetch(`${SUPABASE_URL}/rest/v1/companies?id=eq.${encodeURIComponent(session.companyId)}`,{method:'PATCH',headers:{apikey:PUBLISHABLE_KEY,Authorization:`Bearer ${session.token}`,'Content-Type':'application/json',Prefer:'return=minimal'},body:JSON.stringify({business_modules:next}),cache:'no-store'})
    if(response.ok)return{value:next,persisted:true as const}
    const data=await response.json().catch(()=>({}))
    const text=String(data?.message||data?.error||'')
    if(/business_modules|column|schema cache/i.test(text))return{value:next,persisted:false as const}
    throw new Error(text||'No se pudieron guardar los módulos del comercio.')
  }catch(error){
    if(error instanceof Error&&/business_modules|column|schema cache/i.test(error.message))return{value:next,persisted:false as const}
    throw error
  }
}
