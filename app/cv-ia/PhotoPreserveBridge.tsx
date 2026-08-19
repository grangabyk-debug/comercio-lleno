'use client'

import { useEffect } from 'react'
import { extractPhotoFromCv, savePendingPhoto } from './photoTools'
import { trackCvEvent } from './cvAuth'

export default function PhotoPreserveBridge(){
  useEffect(()=>{
    const form=document.getElementById('analisis') as HTMLFormElement|null
    if(!form)return
    const input=form.querySelector<HTMLInputElement>('input[type="file"]')
    if(!input)return
    let run=0
    const onChange=async()=>{
      const file=input.files?.[0];if(!file)return
      const current=++run
      const data=await extractPhotoFromCv(file)
      if(current!==run||!data)return
      savePendingPhoto(data,'auto')
      void trackCvEvent('photo_uploaded',{source:'auto',file_type:file.type||'cv'},'/')
    }
    input.addEventListener('change',onChange)
    return()=>{run++;input.removeEventListener('change',onChange)}
  },[])
  return null
}
