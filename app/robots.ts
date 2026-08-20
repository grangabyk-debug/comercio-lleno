import type {MetadataRoute} from 'next'
import {headers} from 'next/headers'

export const dynamic='force-dynamic'

function isPostulaHost(host:string){const clean=host.split(':')[0].toLowerCase();return clean==='postulamejor.com'||clean==='www.postulamejor.com'}

export default async function robots():Promise<MetadataRoute.Robots>{
  const h=await headers()
  const host=h.get('x-forwarded-host')||h.get('host')||''
  if(isPostulaHost(host))return{
    rules:{
      userAgent:'*',
      allow:'/',
      disallow:['/api/','/cuenta','/acceso','/mi-cuenta','/mensajes','/empresas/panel','/empresas/movil','/empresas/configuracion','/empresas/registro','/empresas/publicar','/postula-preview','/empleos-preview','/changas-preview','/mi-postula-preview','/postula-acceso-preview','/empresas-preview'],
    },
    sitemap:'https://postulamejor.com/sitemap.xml',
    host:'https://postulamejor.com',
  }
  return{
    rules:{userAgent:'*',allow:'/',disallow:['/api/','/redesign/','/settings','/cash','/sales','/products','/customers','/import']},
    sitemap:'https://comerciolleno.com/sitemap.xml',
    host:'https://comerciolleno.com',
  }
}
