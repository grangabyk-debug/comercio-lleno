'use client'

import {useEffect} from 'react'

const interactiveSelector='a,button,input,select,textarea,label,[role="button"]'

function detailLink(card:HTMLElement){
  return card.querySelector<HTMLAnchorElement>('.pm-job-foot a[href^="/empleos/"]')
}

export default function JobCardLinkBehavior(){
  useEffect(()=>{
    const prepareCards=()=>{
      document.querySelectorAll<HTMLElement>('.pm-job-card').forEach(card=>{
        card.tabIndex=0
        card.setAttribute('role','link')
        const title=card.querySelector('h3')?.textContent?.trim()
        if(title)card.setAttribute('aria-label',`Abrir oferta: ${title}`)
      })
    }

    const openCard=(card:HTMLElement)=>{
      const link=detailLink(card)
      if(link)window.location.assign(link.href)
    }

    const onClick=(event:MouseEvent)=>{
      const target=event.target as HTMLElement|null
      const card=target?.closest<HTMLElement>('.pm-job-card')
      if(!card||target?.closest(interactiveSelector))return
      openCard(card)
    }

    const onKeyDown=(event:KeyboardEvent)=>{
      if(event.key!=='Enter'&&event.key!==' ')return
      const target=event.target as HTMLElement|null
      const card=target?.closest<HTMLElement>('.pm-job-card')
      if(!card||target!==card)return
      event.preventDefault()
      openCard(card)
    }

    prepareCards()
    const observer=new MutationObserver(prepareCards)
    observer.observe(document.body,{childList:true,subtree:true})
    document.addEventListener('click',onClick,true)
    document.addEventListener('keydown',onKeyDown,true)

    return()=>{
      observer.disconnect()
      document.removeEventListener('click',onClick,true)
      document.removeEventListener('keydown',onKeyDown,true)
    }
  },[])

  return null
}
