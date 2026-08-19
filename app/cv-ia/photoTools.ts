'use client'

export const PENDING_PHOTO_KEY='postula_cv_photo_pending_v1'
export const PHOTO_SOURCE_KEY='postula_cv_photo_source_v1'

function dataUrlFromBlob(blob:Blob){return new Promise<string>((resolve,reject)=>{const r=new FileReader();r.onerror=()=>reject(new Error('No pudimos leer la imagen.'));r.onload=()=>resolve(String(r.result||''));r.readAsDataURL(blob)})}
function imageFromBlob(blob:Blob){return new Promise<HTMLImageElement>((resolve,reject)=>{const url=URL.createObjectURL(blob);const img=new Image();img.onload=()=>{URL.revokeObjectURL(url);resolve(img)};img.onerror=()=>{URL.revokeObjectURL(url);reject(new Error('No pudimos procesar la imagen.'))};img.src=url})}

export async function compressPhotoBlob(blob:Blob,maxBytes=700_000,maxSide=1100){
  const img=await imageFromBlob(blob)
  const scale=Math.min(1,maxSide/Math.max(img.naturalWidth,img.naturalHeight))
  const w=Math.max(1,Math.round(img.naturalWidth*scale)),h=Math.max(1,Math.round(img.naturalHeight*scale))
  const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h
  const ctx=canvas.getContext('2d',{alpha:false});if(!ctx)throw new Error('No pudimos optimizar la foto.')
  ctx.fillStyle='#fff';ctx.fillRect(0,0,w,h);ctx.drawImage(img,0,0,w,h)
  let quality=.9,output:Blob|null=null
  for(let i=0;i<7;i++){
    output=await new Promise<Blob|null>(resolve=>canvas.toBlob(resolve,'image/jpeg',quality))
    if(output&&output.size<=maxBytes)break
    quality=Math.max(.5,quality-.08)
  }
  if(!output)throw new Error('No pudimos optimizar la foto.')
  return dataUrlFromBlob(output)
}

export async function compressPhotoFile(file:File){
  if(!file.type.startsWith('image/'))throw new Error('Elegí una imagen válida.')
  return compressPhotoBlob(file)
}

async function docxPhoto(file:File){
  const JSZip=(await import('jszip')).default
  const zip=await JSZip.loadAsync(file)
  const names=Object.keys(zip.files).filter(n=>/^word\/media\//i.test(n)&&/\.(png|jpe?g|webp)$/i.test(n))
  const candidates:{data:string;score:number}[]=[]
  for(const name of names.slice(0,20)){
    try{
      const blob=await zip.file(name)!.async('blob')
      const img=await imageFromBlob(blob)
      const ratio=img.naturalWidth/img.naturalHeight,area=img.naturalWidth*img.naturalHeight
      if(area<12_000||ratio<.48||ratio>1.25)continue
      const score=Math.min(area,1_200_000)/(1+Math.abs(ratio-.75)*3)
      candidates.push({data:await compressPhotoBlob(blob),score})
    }catch{}
  }
  candidates.sort((a,b)=>b.score-a.score)
  return candidates[0]?.data||null
}

function pdfImageToBlob(img:any){
  return new Promise<Blob|null>(resolve=>{
    try{
      const w=Number(img?.width||0),h=Number(img?.height||0);if(!w||!h)return resolve(null)
      const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;const ctx=canvas.getContext('2d');if(!ctx)return resolve(null)
      if(typeof ImageBitmap!=='undefined'&&img?.bitmap instanceof ImageBitmap)ctx.drawImage(img.bitmap,0,0)
      else if(img?.data){
        const raw=img.data as Uint8ClampedArray|Uint8Array
        const rgba=new Uint8ClampedArray(w*h*4)
        if(raw.length===w*h*4)rgba.set(raw as Uint8ClampedArray)
        else if(raw.length===w*h*3){for(let i=0,j=0;i<raw.length;i+=3,j+=4){rgba[j]=raw[i];rgba[j+1]=raw[i+1];rgba[j+2]=raw[i+2];rgba[j+3]=255}}
        else if(raw.length===w*h){for(let i=0,j=0;i<raw.length;i++,j+=4){rgba[j]=rgba[j+1]=rgba[j+2]=raw[i];rgba[j+3]=255}}
        else return resolve(null)
        ctx.putImageData(new ImageData(rgba,w,h),0,0)
      }else return resolve(null)
      canvas.toBlob(resolve,'image/jpeg',.9)
    }catch{resolve(null)}
  })
}

async function pdfPhoto(file:File){
  const pdfjs:any=await import('pdfjs-dist/legacy/build/pdf.mjs')
  if(pdfjs.GlobalWorkerOptions)pdfjs.GlobalWorkerOptions.workerSrc='https://unpkg.com/pdfjs-dist@4.10.38/legacy/build/pdf.worker.min.mjs'
  const data=new Uint8Array(await file.arrayBuffer())
  const pdf=await pdfjs.getDocument({data}).promise
  const page=await pdf.getPage(1)
  const ops=await page.getOperatorList()
  const candidates:{data:string;score:number}[]=[]
  const resolveObj=(id:any)=>new Promise<any>(resolve=>{try{page.objs.get(id,(obj:any)=>resolve(obj))}catch{resolve(null)}})
  for(let i=0;i<ops.fnArray.length&&candidates.length<10;i++){
    const fn=ops.fnArray[i],args=ops.argsArray[i]
    let img:any=null
    if(fn===pdfjs.OPS.paintInlineImageXObject)img=args?.[0]
    else if(fn===pdfjs.OPS.paintImageXObject&&args?.[0])img=await resolveObj(args[0])
    if(!img)continue
    const w=Number(img.width||0),h=Number(img.height||0),ratio=w/h,area=w*h
    if(area<14_000||area>1_400_000||w>1400||h>1700||ratio<.48||ratio>1.25)continue
    const blob=await pdfImageToBlob(img);if(!blob)continue
    const score=area/(1+Math.abs(ratio-.75)*3)
    try{candidates.push({data:await compressPhotoBlob(blob),score})}catch{}
  }
  candidates.sort((a,b)=>b.score-a.score)
  return candidates[0]?.data||null
}

export async function extractPhotoFromCv(file:File){
  try{
    const name=file.name.toLowerCase()
    if(name.endsWith('.docx'))return await docxPhoto(file)
    if(name.endsWith('.pdf'))return await pdfPhoto(file)
  }catch{}
  return null
}

export function savePendingPhoto(data:string,source:'auto'|'manual'){
  try{localStorage.setItem(PENDING_PHOTO_KEY,data);localStorage.setItem(PHOTO_SOURCE_KEY,source)}catch{}
}

export function getPendingPhoto(){try{return localStorage.getItem(PENDING_PHOTO_KEY)||null}catch{return null}}
export function getPendingPhotoSource(){try{return localStorage.getItem(PHOTO_SOURCE_KEY)||null}catch{return null}}
export function dataUrlParts(data:string){const m=data.match(/^data:([^;]+);base64,(.+)$/);return m?{mime:m[1],data:m[2]}:null}
