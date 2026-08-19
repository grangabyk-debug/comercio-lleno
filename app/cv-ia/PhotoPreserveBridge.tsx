'use client'

import { useEffect } from 'react'
import { extractPhotoFromCv, savePendingPhoto } from './photoTools'
import { trackCvEvent } from './cvAuth'

const PENDING_PHOTO_KEY='postula_cv_photo_pending_v1'
const PHOTO_SOURCE_KEY='postula_cv_photo_source_v1'

function clearPendingPhoto(){
  try{
    localStorage.removeItem(PENDING_PHOTO_KEY)
    localStorage.removeItem(PHOTO_SOURCE_KEY)
  }catch{}
}

export default function PhotoPreserveBridge(){
  useEffect(()=>{
    const form=document.getElementById('analisis') as HTMLFormElement|null
    if(!form)return
    const input=form.querySelector<HTMLInputElement>('input[type="file"]')
    if(!input)return
    let run=0
    const onChange=async()=>{
      // Cada CV nuevo parte sin foto. Sólo se aplica una imagen si pertenece
      // al archivo recién elegido o si el usuario la carga manualmente después.
      clearPendingPhoto()
      const current=++run
      const file=input.files?.[0]
      if(!file)return
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
