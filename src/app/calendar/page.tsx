import { prisma } from '@/lib/db'
import CalendarClient from './CalendarClient'

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