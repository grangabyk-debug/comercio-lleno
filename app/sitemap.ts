import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://comerciolleno.com'
  return [
    { url: base, changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/prueba-gratis`, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${base}/terminos`, changeFrequency: 'monthly', priority: 0.3 },
    { url: `${base}/privacidad`, changeFrequency: 'monthly', priority: 0.3 },
  ]
}
