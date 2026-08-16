'use client'

import { useRef,useState } from 'react'
import SettingsTenant from './SettingsTenantNext'
import MobileSettingsPanel from './MobileSettingsPanel'
import ArcaSetupPanel from './ArcaSetupPanel'
import DesignSettingsPanel from './DesignSettingsPanel'
import WholesalePricingSettingsPanel from './WholesalePricingSettingsPanel'
import StockControlSettingsPanel from './StockControlSettingsPanel'
import MercadoPagoPointSettings from './MercadoPagoPointSettings'
import HumanSupportChat from './HumanSupportChat'
import wrap from './settings-with-mobile.module.css'
import type { ArcaHealth } from '@/lib/comercio/api'
import type { CommerceSnapshot, DeviceSettings, TenantSession } from '@/lib/comercio/types'

type Props={data:CommerceSnapshot;session:TenantSession;device:DeviceSettings;setDevice:(d:DeviceSettings)=>void;arca:ArcaHealth|null;buildVersion:string;refresh:()=>Promise<void>;message:(m:string)=>void}
type Special='none'|'mobile'|'arca'|'design'|'mercadopago'
type Group='commerce'|'sales'|'integrations'|'devices'|'access'|'system'
const SETTINGS_TABS=new Set(['Comercio','Ventas y caja','Diseño','ARCA','Impresora y tickets','Stock','Usuarios','Actualizaciones','Mantenimiento'])
const GROUPS:Array<{key:Group;label:string;owner?:boolean;items:Array<{key:string;label:string;special?:Special;legacy?:string}>}>=[
  {key:'commerce',label:'Comercio',items:[{key:'commerce',label:'Datos y sucursales',legacy:'Comercio'}]},
  {key:'sales',label:'Ventas y facturación',items:[{key:'sales',label:'Ventas y caja',legacy:'Ventas y caja'},{key:'arca',label:'ARCA',special:'arca'},{key:'stock',label:'Stock',legacy:'Stock'}]},
  {key:'integrations',label:'Integraciones',owner:true,items:[{key:'mercadopago',label:'Mercado Pago',special:'mercadopago'}]},
  {key:'devices',label:'Equipos y dispositivos',items:[{key:'printer',label:'Impresora y tickets',legacy:'Impresora y tickets'},{key:'mobile',label:'Móvil',special:'mobile'}]},
  {key:'access',label:'Usuarios y permisos',owner:true,items:[{key:'users',label:'Usuarios',legacy:'Usuarios'}]},
  {key:'system',label:'Sistema',owner:true,items:[{key:'design',label:'Diseño',special:'design'},{key:'updates',label:'Actualizaciones',legacy:'Actualizaciones'},{key:'maintenance',label:'Mantenimiento',legacy:'Mantenimiento'}]},
]

export default function SettingsWithMobile(props:Props){
  const[special,setSpecial]=useState<Special>('none'),[legacyTab,setLegacyTab]=useState('Comercio'),[group,setGroup]=useState<Group>('commerce')
  const root=useRef<HTMLDivElement|null>(null),owner=props.session.role==='owner'

  function capture(e:React.MouseEvent<HTMLDivElement>){
    const button=(e.target as HTMLElement).closest('button');if(!button)return
    const text=(button.textContent||'').trim();if(!SETTINGS_TABS.has(text))return
    setLegacyTab(text);if(text==='ARCA'&&owner)setSpecial('arca');else if(text==='Diseño'&&owner)setSpecial('design');else setSpecial('none')
  }

  function openLegacy(label:string){
    const button=Array.from(root.current?.querySelectorAll('button')||[]).find(b=>(b.textContent||'').trim()===label && b.closest(`.${wrap.legacyWrap}`))
    if(button instanceof HTMLButtonElement){button.click();setLegacyTab(label);setSpecial('none')}
  }

  function openItem(item:{special?:Special;legacy?:string}){if(item.special)setSpecial(item.special);else if(item.legacy)openLegacy(item.legacy)}
  function selectGroup(next:Group){setGroup(next);const definition=GROUPS.find(x=>x.key===next);const first=definition?.items.find(item=>owner||!['arca','mobile'].includes(item.key))||definition?.items[0];if(first)openItem(first)}

  const visibleGroups=GROUPS.filter(x=>owner||!x.owner)
  const currentGroup=visibleGroups.find(x=>x.key===group)||visibleGroups[0]
  const showSpecial=special!=='none'
  const salesActive=special==='none'&&legacyTab==='Ventas y caja'
  const activeKey=special!=='none'?special:legacyTab

  return <div className={wrap.host} ref={root} onClickCapture={capture}>
    <div style={{display:'none'}} aria-hidden="true"><HumanSupportChat/></div>

    <div className={wrap.settingsNav}>
      <div className={wrap.groupNav}>{visibleGroups.map(item=><button type="button" key={item.key} className={currentGroup?.key===item.key?wrap.groupActive:''} onClick={()=>selectGroup(item.key)}>{item.label}</button>)}</div>
      <div className={wrap.subNav}>{currentGroup?.items.filter(item=>owner||!['arca','mobile'].includes(item.key)).map(item=>{
        const active=item.special?activeKey===item.special:activeKey===item.legacy
        return <button type="button" key={item.key} className={active?wrap.subActive:''} onClick={()=>openItem(item)}>{item.label}</button>
      })}</div>
    </div>

    <div className={`${wrap.legacyWrap} ${showSpecial?wrap.specialLegacy:''} ${salesActive?wrap.salesLegacy:''}`}><SettingsTenant {...props}/></div>
    {salesActive&&<StockControlSettingsPanel session={props.session} message={props.message}/>} 
    {salesActive&&<WholesalePricingSettingsPanel session={props.session} message={props.message}/>} 
    {owner&&special==='mobile'&&<div className={wrap.specialPanel}><MobileSettingsPanel session={props.session} message={props.message}/></div>}
    {owner&&special==='mercadopago'&&<div className={wrap.specialPanel}><MercadoPagoPointSettings session={props.session} message={props.message}/></div>}
    {owner&&special==='design'&&<div className={wrap.specialPanel}><DesignSettingsPanel session={props.session} message={props.message}/></div>}
    {owner&&special==='arca'&&<div className={wrap.specialPanel}><ArcaSetupPanel session={props.session} companyName={props.data.company.name} companyTaxId={props.data.company.tax_id} message={props.message}/></div>}
  </div>
}
