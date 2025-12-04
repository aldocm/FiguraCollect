import AboutClient from './AboutClient'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Nosotros | FiguraCollect',
  description: 'Conoce más sobre FiguraCollect y nuestra misión.'
}

export default function AboutPage() {
  return <AboutClient />
}
