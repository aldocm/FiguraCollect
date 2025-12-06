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

  // releaseDate is stored as "YYYY-MM" or "YYYY-MM-DD" string format
  // JavaScript months are 0-indexed, so we add 1
  const monthStr = String(month + 1).padStart(2, '0')
  const releaseDatePattern = `${year}-${monthStr}`

  const where: Record<string, unknown> = {
    releaseDate: { startsWith: releaseDatePattern }
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
      orderBy: {
        releaseDate: 'asc'
      }
    })

    return NextResponse.json({ figures })
  } catch (error) {
    console.error('Error fetching calendar figures:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
