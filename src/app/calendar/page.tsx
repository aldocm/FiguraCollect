import { prisma } from '@/lib/db'
import CalendarClient from './CalendarClient'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Calendario de Lanzamientos | FiguraCollect',
  description: 'Consulta las próximas fechas de lanzamiento de figuras.'
}

export const dynamic = 'force-dynamic'

export default async function CalendarPage() {
  const [brands, lines] = await Promise.all([
    prisma.brand.findMany({ orderBy: { name: 'asc' } }),
    prisma.line.findMany({ 
      orderBy: { name: 'asc' },
      select: { id: true, name: true, brandId: true } 
    })
  ])

  return (
    <CalendarClient 
      brands={brands} 
      lines={lines} 
    />
  )
}