import type { Metadata } from 'next'
import CvIaExperience from './CvIaExperience'

export const metadata: Metadata = {
  title: 'CV IA | Prepará una candidatura que compita mejor',
  description: 'Analizá tu CV, comparalo con una búsqueda laboral y prepará una candidatura más clara, relevante y lista para entrevistas.',
  robots: { index: false, follow: false },
}

export default function CvIaPage() {
  return <CvIaExperience />
}
