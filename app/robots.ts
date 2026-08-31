import type {MetadataRoute} from 'next'

export default function robots():MetadataRoute.Robots{
  return{
    rules:{userAgent:'*',allow:'/',disallow:['/api/','/redesign/','/settings','/cash','/sales','/products','/customers','/import']},
    sitemap:'https://comerciolleno.com/sitemap.xml',
    host:'https://comerciolleno.com',
  }
}
