import BrandsClient from './BrandsClient'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Gestión de Marcas | Admin'
}

export default function AdminBrandsPage() {
  return <BrandsClient />
}
