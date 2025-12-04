import SeriesClient from './SeriesClient'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Gestión de Series | Admin'
}

export default function AdminSeriesPage() {
  return <SeriesClient />
}
