'use client'
import {useRef,useState} from 'react'
import {cvAuthClient} from '../cv-ia/cvAuth'
import {flexCategoryImage} from './flexVisuals'

type Props={category:string;imagePath:string;imageUrl:string;onChange:(value:{path:string;url:string})=>void;onReset:()=>void}
function extFor(file:File){if(file.type==='image/png')return'png';if(file.type==='image/webp')return'webp';return'jpg'}
async function functionError(error:any){try{const response=error?.context;if(response&&typeof response.json==='function'){const body=await response.json();return String(body?.error||'')}}catch{}return String(error?.message||'')}

export default function FlexImagePicker({category,imagePath,imageUrl,onChange,onReset}:Props){
 const input=useRef<HTMLInputElement>(null);const[busy,setBusy]=useState(false),[notice,setNotice]=useState('')
 const preview=imagePath&&imageUrl?imageUrl:flexCategoryImage(category||'Otros')
 async function upload(file:File){
  if(busy)return;setNotice('')
  if(file.size>2*1024*1024){setNotice('La imagen puede pesar hasta 2 MB.');return}
  if(!['image/jpeg','image/png','image/webp'].includes(file.type)){setNotice('Usá JPG, PNG o WEBP.');return}
  setBusy(true);const client=cvAuthClient();let temp=''
  try{
   const{data}=await client.auth.getSession();const user=data.session?.user;if(!user){location.assign('/login?next=/trabajos-flex');return}
   temp=`${user.id}/flex-review/${crypto.randomUUID()}.${extFor(file)}`
   const{error:uploadError}=await client.storage.from('postula-private').upload(temp,file,{upsert:false,contentType:file.type});if(uploadError)throw uploadError
   setNotice('Revisando la imagen antes de publicarla…')
   const{data:review,error}=await client.functions.invoke('postula-flex-image-review',{body:{path:temp,mode:'flex'}})
   if(error)throw new Error((await functionError(error))||'La imagen no pudo pasar la revisión automática.')
   if(!review?.ok||!review?.path||!review?.url)throw new Error(String(review?.error||'La imagen no pudo pasar la revisión automática.'))
   onChange({path:String(review.path),url:String(review.url)});setNotice('Imagen aprobada. Se va a usar en esta publicación.')
  }catch(e){if(temp)await client.storage.from('postula-private').remove([temp]).catch(()=>{});setNotice(e instanceof Error?e.message:'No pudimos revisar la imagen.')}
  finally{setBusy(false);if(input.current)input.current.value=''}
 }
 return <div className="pm33-flex-media"><div className="pm33-flex-media-preview" style={{backgroundImage:`url(${preview})`}}><span>{imagePath?'IMAGEN PROPIA APROBADA':'IMAGEN SEGÚN CATEGORÍA'}</span></div><div className="pm33-flex-media-copy"><b>{imagePath?'Tu imagen está lista':'Podés dejar esta imagen o subir una propia.'}</b><p>La imagen predeterminada cambia según la categoría. Si subís una foto, primero pasa por un control automático de seguridad y datos sensibles.</p><div><button type="button" onClick={()=>input.current?.click()} disabled={busy}>{busy?'Revisando…':imagePath?'Cambiar imagen':'Subir imagen propia'}</button>{imagePath&&<button type="button" className="quiet" onClick={()=>{onReset();setNotice('Volvimos a la imagen de la categoría.')}}>Usar predeterminada</button>}</div>{notice&&<small>{notice}</small>}<input ref={input} hidden type="file" accept="image/jpeg,image/png,image/webp" onChange={e=>e.target.files?.[0]&&void upload(e.target.files[0])}/></div></div>
}
