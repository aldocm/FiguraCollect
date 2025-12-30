import { prisma } from '@/lib/db'
import CatalogClient from './CatalogClient'
import type { Metadata } from 'next'
import { calculateAverageRating } from '@/lib/utils'
import { shouldShowPendingFigures } from '@/lib/config'

export const metadata: Metadata = {
  title: 'Catalog | FiguraCollect',
  description: 'Explore our complete database of figures.'
}

// ISR: revalidate every 60 seconds for fresh data with caching
export const revalidate = 60

interface PageProps {
  searchParams: Promise<{
    brandId?: string
    lineId?: string
    seriesId?: string
    characterId?: string
    search?: string
    isReleased?: string
    page?: string
    sort?: string
  }>
}

export default async function CatalogPage({ searchParams }: PageProps) {
  const params = await searchParams
  const page = parseInt(params.page || '1')
  const limit = 20
  const sort = params.sort || 'newest'

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: Record<string, any> = {}

  // Filter by status - only show APPROVED unless config allows pending
  const showPending = await shouldShowPendingFigures()
  if (!showPending) {
    where.status = 'APPROVED'
  }

  if (params.brandId) where.brandId = params.brandId
  
  // Handle multiple Line IDs (comma separated)
  if (params.lineId) {
    const ids = params.lineId.split(',').filter(Boolean)
    if (ids.length > 0) {
      where.lineId = { in: ids }
    }
  }

  // Handle multiple Series IDs (comma separated)
  if (params.seriesId) {
    const ids = params.seriesId.split(',').filter(Boolean)
    if (ids.length > 0) {
      where.series = {
        some: {
          seriesId: { in: ids }
        }
      }
    }
  }

  // Handle Character ID
  if (params.characterId) {
    where.characterId = params.characterId
  }

  if (params.search) where.name = { contains: params.search }
  if (params.isReleased !== undefined && params.isReleased !== '') {
    where.isReleased = params.isReleased === 'true'
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let orderBy: Record<string, any> | Record<string, any>[] = { createdAt: 'desc' }

  switch (sort) {
    case 'date_asc':
      orderBy = [{ releaseYear: 'asc' }, { releaseMonth: 'asc' }, { releaseDay: 'asc' }]
      break
    case 'date_desc':
      orderBy = [{ releaseYear: 'desc' }, { releaseMonth: 'desc' }, { releaseDay: 'desc' }]
      break
    case 'price_asc':
      orderBy = { priceMXN: 'asc' }
      break
    case 'price_desc':
      orderBy = { priceMXN: 'desc' }
      break
    case 'newest':
    default:
      orderBy = { createdAt: 'desc' }
      break
  }

  const [figuresRaw, total, brands, lines, seriesRaw, characters] = await Promise.all([
    prisma.figure.findMany({
      where,
      include: {
        brand: true,
        line: true,
        images: { take: 1, orderBy: { order: 'asc' } },
        reviews: { select: { rating: true } }
      },
      orderBy: orderBy,
      skip: (page - 1) * limit,
      take: limit
    }),
    prisma.figure.count({ where }),
    prisma.brand.findMany({
      include: { _count: { select: { figures: true } } },
      orderBy: { name: 'asc' }
    }),
    prisma.line.findMany({
      include: { _count: { select: { figures: true } } },
      orderBy: { name: 'asc' }
    }),
    prisma.series.findMany({
      include: {
        _count: { select: { figures: true } },
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
      },
      orderBy: { name: 'asc' }
    }),
    prisma.character.findMany({
      include: {
        series: { select: { id: true, name: true } },
        _count: { select: { figures: true } }
      },
      orderBy: { name: 'asc' }
    })
  ])

  // Calculate average rating for each figure using centralized function
  const figures = figuresRaw.map(figure => ({
    ...figure,
    averageRating: calculateAverageRating(figure.reviews)
  }))

  // Transform series to include sets of valid BrandIDs and LineIDs for client-side filtering
  const series = seriesRaw.map(s => {
    const brandIds = new Set<string>()
    const lineIds = new Set<string>()
    
    s.figures.forEach(f => {
      if (f.figure.brandId) brandIds.add(f.figure.brandId)
      if (f.figure.lineId) lineIds.add(f.figure.lineId)
    })

    return {
      id: s.id,
      name: s.name,
      _count: s._count,
      brandIds: Array.from(brandIds),
      lineIds: Array.from(lineIds)
    }
  })

  const pages = Math.ceil(total / limit)

  return (
    <div>
      <CatalogClient
        figures={figures}
        brands={brands}
        lines={lines}
        series={series}
        characters={characters}
        page={page}
        pages={pages}
      />
    </div>
  )
}