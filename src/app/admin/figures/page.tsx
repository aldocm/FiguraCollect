import FiguresClient from './FiguresClient'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Gestión de Figuras | Admin'
}

export default function AdminFiguresPage() {
  return <FiguresClient />
}
