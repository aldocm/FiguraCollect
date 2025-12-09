import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const month = parseInt(searchParams.get('month') || '')
  const year = parseInt(searchParams.get('year') || '')
  const brandId = searchParams.get('brandId')
  const lineId = searchParams.get('lineId')

  if (isNaN(month) || isNaN(year)) {
    return NextResponse.json({ error: 'Invalid date params' }, { status: 400 })
  }

  // JavaScript months are 0-indexed, so we add 1 to get the actual month
  const actualMonth = month + 1

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: Record<string, any> = {
    releaseYear: year,
    releaseMonth: actualMonth
  }

  if (brandId) where.brandId = brandId
  if (lineId) where.lineId = lineId

  try {
    const figures = await prisma.figure.findMany({
      where,
      include: {
        brand: true,
        line: true,
        images: { take: 1, orderBy: { order: 'asc' } }
      },
      orderBy: [
        { releaseDay: { sort: 'asc', nulls: 'last' } },
        { name: 'asc' }
      ]
    })

    // Transform to include releaseDate string for frontend compatibility
    const transformedFigures = figures.map(fig => ({
      ...fig,
      releaseDate: fig.releaseDay
        ? `${fig.releaseYear}-${String(fig.releaseMonth).padStart(2, '0')}-${String(fig.releaseDay).padStart(2, '0')}`
        : `${fig.releaseYear}-${String(fig.releaseMonth).padStart(2, '0')}`
    }))

    return NextResponse.json({ figures: transformedFigures })
  } catch (error) {
    console.error('Error fetching calendar figures:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
