import { prisma } from '@/lib/db'
import CatalogClient from './CatalogClient'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Catálogo | FiguraCollect',
  description: 'Explora nuestra base de datos completa de figuras.'
}

export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams: Promise<{
    brandId?: string
    lineId?: string
    seriesId?: string
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

  const where: any = {}

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

  if (params.search) where.name = { contains: params.search }
  if (params.isReleased !== undefined && params.isReleased !== '') {
    where.isReleased = params.isReleased === 'true'
  }

  let orderBy: any = { createdAt: 'desc' }

  switch (sort) {
    case 'date_asc':
      orderBy = { releaseDate: 'asc' }
      break
    case 'date_desc':
      orderBy = { releaseDate: 'desc' }
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

  const [figures, total, brands, lines, seriesRaw] = await Promise.all([
    prisma.figure.findMany({
      where,
      include: {
        brand: true,
        line: true,
        images: { take: 1, orderBy: { order: 'asc' } }
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
    })
  ])

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
      <div className="mb-8">
        <h1 className="text-2xl md:text-4xl font-title font-black text-white mb-1 md:mb-2">
          Catálogo de <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-500">Figuras</span>
        </h1>
        <p className="text-gray-400 text-sm">
          Explora nuestra base de datos completa de figuras.
        </p>
      </div>
      <CatalogClient
        figures={figures}
        brands={brands}
        lines={lines}
        series={series}
        page={page}
        pages={pages}
      />
    </div>
  )
}
