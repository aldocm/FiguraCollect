import NewListClient from './NewListClient'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Crear Lista | FiguraCollect',
  description: 'Crea una nueva lista de figuras personalizada.'
}

export default function NewListPage() {
  return <NewListClient />
}