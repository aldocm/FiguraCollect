import { prisma } from '@/lib/db'
import TimelineClient from './TimelineClient'

export const dynamic = 'force-dynamic'

export default async function TimelinePage() {
  const [lines, seriesRaw, brands] = await Promise.all([
    prisma.line.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, name: true, brandId: true }
    }),
    prisma.series.findMany({
      orderBy: { name: 'asc' },
      include: {
        figures: {
          select: {
            figure: {
              select: {
                brandId: true,
                lineId: true
              }
            }
          }
        }
      }
    }),
    prisma.brand.findMany({ orderBy: { name: 'asc' } })
  ])

  // Transform series to include sets of valid BrandIDs and LineIDs for client-side filtering
  const seriesList = seriesRaw.map(s => {
    const brandIds = new Set<string>()
    const lineIds = new Set<string>()
    
    s.figures.forEach(f => {
      if (f.figure.brandId) brandIds.add(f.figure.brandId)
      if (f.figure.lineId) lineIds.add(f.figure.lineId)
    })

    return {
      id: s.id,
      name: s.name,
      brandIds: Array.from(brandIds),
      lineIds: Array.from(lineIds)
    }
  })

  return (
    <TimelineClient 
      lines={lines} 
      seriesList={seriesList} 
      brands={brands} 
    />
  )
}
