import { notFound } from 'next/navigation'
import HumanSupportChat from '@/app/redesign/HumanSupportChat'

export const dynamic='force-dynamic'

export default function SupportChatPreviewPage(){
  if(process.env.VERCEL_ENV==='production')notFound()
  return <main style={{minHeight:'100vh',background:'#f4f7f6',padding:'40px 20px',fontFamily:'Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',color:'#15231d'}}>
    <div style={{width:'min(720px,100%)',margin:'0 auto'}}>
      <header style={{marginBottom:18}}><span style={{fontSize:10,fontWeight:900,letterSpacing:'.12em',color:'#168a55'}}>COMERCIO LLENO · PREVIEW</span><h1 style={{margin:'6px 0',fontSize:30}}>Chat humano conectado</h1><p style={{margin:0,color:'#6d7d75',fontSize:13}}>Ingresá primero a Comercio Lleno para enviar mensajes reales a Central Llena.</p></header>
      <div style={{maxWidth:430}}><HumanSupportChat/></div>
    </div>
  </main>
}
