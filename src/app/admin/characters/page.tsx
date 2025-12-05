import CharactersClient from './CharactersClient'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Gestión de Personajes | Admin'
}

export default function AdminCharactersPage() {
  return <CharactersClient />
}
