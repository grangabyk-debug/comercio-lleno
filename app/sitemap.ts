import type { MetadataRoute } from 'next'
import { solutions } from './soluciones/solutions'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://comerciolleno.com'
  const solutionPages: MetadataRoute.Sitemap = solutions.map(({ slug }) => ({
    url: `${base}/soluciones/${slug}`,
    changeFrequency: 'monthly',
    priority: 0.8,
  }))

  return [
    { url: base, changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/prueba-gratis`, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${base}/soluciones`, changeFrequency: 'monthly', priority: 0.85 },
    ...solutionPages,
    { url: `${base}/terminos`, changeFrequency: 'monthly', priority: 0.3 },
    { url: `${base}/privacidad`, changeFrequency: 'monthly', priority: 0.3 },
  ]
}
