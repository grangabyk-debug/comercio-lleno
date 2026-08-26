import type {PublicReputation} from './publicReputation'
import {reputationText} from './publicReputation'

export default function PublicReputationBadge({reputation,compact=false}:{reputation:PublicReputation;compact?:boolean}){
 const active=reputation.count>=3
 return <span
  title={active?'Indicador construido únicamente con experiencias laborales cerradas.':'El indicador público se activa al completar 3 experiencias laborales cerradas.'}
  style={{display:'inline-flex',alignItems:'center',gap:6,width:'fit-content',maxWidth:'100%',padding:compact?'5px 8px':'7px 10px',borderRadius:999,border:'1px solid rgba(17,31,45,.11)',background:active?(reputation.indicator==='favorable'?'#efffdc':reputation.indicator==='unfavorable'?'#fff0ed':'#fff8dd'):'#f4f6f8',color:'#142130',fontSize:compact?10:11,fontWeight:850,lineHeight:1.15,letterSpacing:'-.01em'}}
 >{reputationText(reputation)}</span>
}
