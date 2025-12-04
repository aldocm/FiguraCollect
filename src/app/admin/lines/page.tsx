import LinesClient from './LinesClient'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Gestión de Líneas | Admin'
}

export default function AdminLinesPage() {
  return <LinesClient />
}
