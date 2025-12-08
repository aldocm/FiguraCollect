import { prisma } from '@/lib/db'
import HomePageClient from './HomePageClient'
import type { Metadata } from 'next'
import { calculateAverageRating } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Inicio | FiguraCollect',
  description: 'La plataforma definitiva para coleccionistas de figuras.'
}

// ISR: revalidate every 60 seconds for fresh data with caching
export const revalidate = 60

export default async function HomePage() {
  // 1. Fetch Sections Config from DB
  // Ensure we fetch in correct order
  const sectionsConfig = await prisma.homeSection.findMany({
    where: { isVisible: true },
    orderBy: { order: 'asc' },
  })

  // If no sections exist (first run), fallback or seed? 
  // For now, if empty, the client will just show nothing, which is fine, admin needs to config.
  // OR we could inject defaults in memory if DB is empty, but let's stick to DB truth.
  
  // 2. Process each section to fetch its data
  // We will build an array of resolved sections
  const resolvedSections = await Promise.all(sectionsConfig.map(async (section) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let figures: any[] = []
    const config = JSON.parse(section.config)

    try {
        if (section.type === 'PRESET') {
            // Handle hardcoded logic for presets if migrated, 
            // but ideally we should have migrated them to QUERY types.
            // For legacy support or specific complex logic:
            if (section.title === 'Agregadas Recientemente') { // This is brittle matching by title, better to use a slug or just use QUERY type
                 figures = await prisma.figure.findMany({
                    include: { brand: true, line: true, images: { take: 1 }, reviews: { select: { rating: true } } },
                    orderBy: { createdAt: 'desc' },
                    take: 15
                 })
            }
            // ... handle other presets if we kept them as PRESET type
        } 
        else if (section.type === 'QUERY') {
            // Build WHERE clause
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const where: Record<string, any> = {}
            if (config.brandId) where.brandId = config.brandId
            if (config.lineId) where.lineId = config.lineId
            if (config.characterId) where.characterId = config.characterId
            if (config.seriesId) {
                where.series = {
                    some: {
                        seriesId: config.seriesId
                    }
                }
            }
            if (config.isReleased !== undefined) where.isReleased = config.isReleased
            if (config.search) where.name = { contains: config.search }
            if (config.minPrice || config.maxPrice) {
                const currencyField = config.currency === 'USD' ? 'priceUSD' 
                                    : config.currency === 'YEN' ? 'priceYEN' 
                                    : 'priceMXN';

                if (config.minPrice) where[currencyField] = { gte: config.minPrice }
                if (config.maxPrice) where[currencyField] = { ...where[currencyField], lte: config.maxPrice }
            }

            // Sort logic (default newest)
            const orderBy = { createdAt: 'desc' }

            figures = await prisma.figure.findMany({
                where,
                include: { brand: true, line: true, images: { take: 1 }, reviews: { select: { rating: true } } },
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                orderBy: orderBy as Record<string, any>,
                take: 15
            })
        } 
        else if (section.type === 'LIST') {
            const list = await prisma.list.findUnique({
                where: { id: config.listId },
                include: {
                    items: {
                        include: {
                            figure: {
                                include: { brand: true, line: true, images: { take: 1 }, reviews: { select: { rating: true } } }
                            }
                        },
                        take: 15,
                        orderBy: { order: 'asc' }
                    }
                }
            })
            if (list) {
                // Remap list items to flat figures for the card component
                figures = list.items.map(i => i.figure)
            }
        }
    } catch (e) {
        console.error(`Error fetching data for section ${section.id}`, e)
    }

    // Calculate ratings using centralized function
    const processedFigures = figures.map(f => ({
        ...f,
        averageRating: calculateAverageRating(f.reviews || [])
    }))

    return {
        ...section,
        data: processedFigures
    }
  }))

  return (
    <HomePageClient sections={resolvedSections} />
  )
}