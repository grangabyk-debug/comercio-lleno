'use client'

import {useEffect} from 'react'

const CLARITY_ID='y4kvvky3gc'
const SCRIPT_ID='postula-ms-clarity'

type ClarityFn=((...args:unknown[])=>void)&{q?:unknown[][]}
type ClarityWindow=Window&{clarity?:ClarityFn}

function loadClarity(){
  if(document.getElementById(SCRIPT_ID))return
  const w=window as ClarityWindow
  if(!w.clarity){
    const clarity=((...args:unknown[])=>{clarity.q=(clarity.q||[]);clarity.q.push(args)}) as ClarityFn
    w.clarity=clarity
  }
  const script=document.createElement('script')
  script.id=SCRIPT_ID
  script.type='text/javascript'
  script.async=true
  script.src=`https://www.clarity.ms/tag/${CLARITY_ID}`
  document.head.appendChild(script)
}

export default function PostulaAnalytics(){
  useEffect(()=>{loadClarity()},[])
  return null
}
