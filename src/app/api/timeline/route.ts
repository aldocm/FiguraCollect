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

  const where: any = {
    // Only show figures that have a release date for the timeline to make sense
    releaseDate: { not: null }
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
      orderBy: {
        releaseDate: 'asc'
      }
    })

    return NextResponse.json({ figures })
  } catch (error) {
    console.error('Error fetching timeline figures:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
