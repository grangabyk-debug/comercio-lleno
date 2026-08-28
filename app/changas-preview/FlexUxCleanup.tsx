'use client'

import {useEffect} from 'react'

const interactive='button,a,input,select,textarea,label,[role="button"]'

export default function FlexUxCleanup(){
 useEffect(()=>{
  const enhance=()=>{
   const search=document.querySelector<HTMLElement>('.pm38-flex-search')
   const action=search?.querySelector<HTMLElement>(':scope > div:last-child')
   if(action&&!action.querySelector('.pm41-search-btn')){
    action.dataset.pm42Search='1'
    const button=document.createElement('button')
    button.type='button';button.className='pm41-search-btn';button.textContent='Buscar';button.setAttribute('aria-label','Buscar Servicios Flex')
    button.addEventListener('click',()=>{(document.activeElement as HTMLElement|null)?.blur?.();document.querySelector<HTMLElement>('.pm7-gig-grid,.pm38-flex-empty')?.scrollIntoView({behavior:'smooth',block:'start'})})
    action.appendChild(button)
   }

   document.querySelectorAll<HTMLElement>('.pm39-market-card').forEach(card=>{
    if(card.dataset.pm42Card)return
    card.dataset.pm42Card='1';card.tabIndex=0;card.setAttribute('role','button')
    const title=card.querySelector('h3')?.textContent?.trim();if(title)card.setAttribute('aria-label',`Abrir Servicio Flex: ${title}`)
   })
   const chat=document.querySelector<HTMLElement>('.pm7-mini-chat')
   if(chat&&!chat.querySelector('.pm41-message-title')){
    const head=document.createElement('div');head.className='pm41-message-title';head.innerHTML='<b>Enviar mensaje</b><small>Escribí tu consulta y seguí la conversación desde Mensajes.</small>';chat.prepend(head)
   }
  }
  const openCard=(card:HTMLElement)=>card.querySelector<HTMLButtonElement>('.pm7-gig-foot button')?.click()
  const onClick=(event:MouseEvent)=>{const target=event.target as HTMLElement|null;const card=target?.closest<HTMLElement>('.pm39-market-card');if(!card||target?.closest(interactive))return;openCard(card)}
  const onKey=(event:KeyboardEvent)=>{if(event.key!=='Enter'&&event.key!==' ')return;const target=event.target as HTMLElement|null;const card=target?.closest<HTMLElement>('.pm39-market-card');if(!card||target!==card)return;event.preventDefault();openCard(card)}
  enhance()
  const observer=new MutationObserver(enhance);observer.observe(document.body,{childList:true,subtree:true})
  document.addEventListener('click',onClick,true);document.addEventListener('keydown',onKey,true)
  return()=>{observer.disconnect();document.removeEventListener('click',onClick,true);document.removeEventListener('keydown',onKey,true)}
 },[])
 return null
}
