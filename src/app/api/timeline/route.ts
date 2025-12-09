import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const lineId = searchParams.get('lineId')
  const seriesId = searchParams.get('seriesId')
  const brandId = searchParams.get('brandId')

  if (!lineId && !seriesId && !brandId) {
    return NextResponse.json({ figures: [] })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: Record<string, any> = {
    // Only show figures that have a release year for the timeline to make sense
    releaseYear: { not: null }
  }

  if (lineId) where.lineId = lineId
  if (seriesId) where.series = { some: { seriesId: seriesId } }
  if (brandId) where.brandId = brandId

  try {
    const figures = await prisma.figure.findMany({
      where,
      include: {
        brand: true,
        line: true,
        series: { include: { series: true } },
        images: { take: 1, orderBy: { order: 'asc' } }
      },
      orderBy: [
        { releaseYear: 'asc' },
        { releaseMonth: { sort: 'asc', nulls: 'last' } },
        { releaseDay: { sort: 'asc', nulls: 'last' } }
      ]
    })

    // Transform to include releaseDate string for frontend compatibility
    const transformedFigures = figures.map(fig => ({
      ...fig,
      releaseDate: fig.releaseMonth
        ? (fig.releaseDay
            ? `${fig.releaseYear}-${String(fig.releaseMonth).padStart(2, '0')}-${String(fig.releaseDay).padStart(2, '0')}`
            : `${fig.releaseYear}-${String(fig.releaseMonth).padStart(2, '0')}`)
        : `${fig.releaseYear}`
    }))

    return NextResponse.json({ figures: transformedFigures })
  } catch (error) {
    console.error('Error fetching timeline figures:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
