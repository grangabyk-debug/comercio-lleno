'use client'

import { useEffect,useRef,useState } from 'react'
import { createPortal } from 'react-dom'
import SettingsTenant from './SettingsTenantNext'
import MobileSettingsPanel from './MobileSettingsPanel'
import ArcaSetupPanel from './ArcaSetupPanel'
import DesignSettingsPanel from './DesignSettingsPanel'
import wrap from './settings-with-mobile.module.css'
import type { ArcaHealth } from '@/lib/comercio/api'
import type { CommerceSnapshot, DeviceSettings, TenantSession } from '@/lib/comercio/types'

type Props={data:CommerceSnapshot;session:TenantSession;device:DeviceSettings;setDevice:(d:DeviceSettings)=>void;arca:ArcaHealth|null;buildVersion:string;refresh:()=>Promise<void>;message:(m:string)=>void}
type Special='none'|'mobile'|'arca'|'design'
const SETTINGS_TABS=new Set(['Comercio','Ventas y caja','Diseño','ARCA','Impresora y tickets','Stock','Usuarios','Actualizaciones','Mantenimiento'])

export default function SettingsWithMobile(props:Props){
  const[special,setSpecial]=useState<Special>('none'),[tabHost,setTabHost]=useState<HTMLElement|null>(null)
  const root=useRef<HTMLDivElement|null>(null),owner=props.session.role==='owner'
  useEffect(()=>{const find=()=>{const buttons=Array.from(root.current?.querySelectorAll('button')||[]);const arca=buttons.find(b=>(b.textContent||'').trim()==='ARCA');if(arca?.parentElement)setTabHost(arca.parentElement)};find();const t=window.setTimeout(find,40);return()=>window.clearTimeout(t)},[owner])
  function capture(e:React.MouseEvent<HTMLDivElement>){const button=(e.target as HTMLElement).closest('button');if(!button)return;const text=(button.textContent||'').trim();if(!SETTINGS_TABS.has(text))return;if(text==='ARCA'&&owner)setSpecial('arca');else if(text==='Diseño'&&owner)setSpecial('design');else setSpecial('none')}
  const showSpecial=special!=='none'
  return <div className={wrap.host} ref={root} onClickCapture={capture}>
    <div className={showSpecial?wrap.specialLegacy:''}><SettingsTenant {...props}/></div>
    {owner&&tabHost&&createPortal(<button type="button" className={`${wrap.mobileTab} ${special==='mobile'?wrap.mobileTabActive:''}`} onClick={()=>setSpecial('mobile')}>Móvil</button>,tabHost)}
    {owner&&special==='mobile'&&<div className={wrap.specialPanel}><MobileSettingsPanel session={props.session} message={props.message}/></div>}
    {owner&&special==='design'&&<div className={wrap.specialPanel}><DesignSettingsPanel session={props.session} message={props.message}/></div>}
    {owner&&special==='arca'&&<div className={wrap.specialPanel}><ArcaSetupPanel session={props.session} companyName={props.data.company.name} companyTaxId={props.data.company.tax_id} message={props.message}/></div>}
  </div>
}
