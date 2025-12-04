import TagsClient from './TagsClient'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Gestión de Tags | Admin'
}

export default function AdminTagsPage() {
  return <TagsClient />
}
