'use client'

import dynamic from 'next/dynamic'
import {useEffect,useState} from 'react'

const FreeCareerTools=dynamic(()=>import('./FreeCareerTools'),{ssr:false})
const ConsentBridge=dynamic(()=>import('./ConsentBridge'),{ssr:false})
const OrientationBridge=dynamic(()=>import('./OrientationBridge'),{ssr:false})
const PhotoPreserveBridge=dynamic(()=>import('./PhotoPreserveBridge'),{ssr:false})
const DesignPreferenceBridge=dynamic(()=>import('./DesignPreferenceBridge'),{ssr:false})
const FirstCvBridge=dynamic(()=>import('./FirstCvBridge'),{ssr:false})
const CommentPolicyBridge=dynamic(()=>import('./CommentPolicyBridge'),{ssr:false})
const OwnerTestBridge=dynamic(()=>import('./OwnerTestBridge'),{ssr:false})
const FlexPlanBenefitsBridge=dynamic(()=>import('../postula-preview/FlexPlanBenefitsBridge'),{ssr:false})

export default function CvDeferredEnhancements(){
 const[ready,setReady]=useState(false)
 useEffect(()=>{
  let cancelled=false
  let idleId:number|undefined
  const w=window as any
  const timer=window.setTimeout(()=>{
   const start=()=>{if(!cancelled)setReady(true)}
   if(typeof w.requestIdleCallback==='function')idleId=w.requestIdleCallback(start,{timeout:1100})
   else start()
  },320)
  return()=>{
   cancelled=true
   window.clearTimeout(timer)
   if(idleId!==undefined&&typeof w.cancelIdleCallback==='function')w.cancelIdleCallback(idleId)
  }
 },[])
 if(!ready)return null
 return <><FreeCareerTools/><ConsentBridge/><OrientationBridge/><PhotoPreserveBridge/><DesignPreferenceBridge/><FirstCvBridge/><CommentPolicyBridge/><OwnerTestBridge/><FlexPlanBenefitsBridge/></>
}
