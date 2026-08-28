'use client'

import {useEffect} from 'react'

const css=`
.pm17-human-card,.pm7-employer-float,.pm17-nexo-phone{-webkit-font-smoothing:antialiased!important;text-rendering:geometricPrecision!important;will-change:auto!important}
.pm17-human-card,.pm7-employer-float{transform-style:flat!important}
.pm17-nexo-phone{transform:rotate(2.2deg)!important}
.pm17-human-card b,.pm17-human-card small,.pm17-human-card span,.pm7-employer-float b,.pm7-employer-float small,.pm7-employer-float span,.pm17-nexo-phone b,.pm17-nexo-phone small,.pm17-nexo-phone span{filter:none!important;text-shadow:none!important}
`

export default function EmployerSharpnessBridge(){
 useEffect(()=>{
  const style=document.createElement('style')
  style.id='pm-employer-sharpness-v58'
  style.textContent=css
  document.head.appendChild(style)
  return()=>style.remove()
 },[])
 return null
}
