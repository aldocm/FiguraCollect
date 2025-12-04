import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')?.trim()
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 10

    if (!query || query.length < 1) {
      return NextResponse.json({ results: [] })
    }

    // Search figures only
    const figures = await prisma.figure.findMany({
      where: {
        name: { contains: query }
      },
      select: {
        id: true,
        name: true,
        brand: { select: { name: true } },
        line: { select: { name: true } },
        images: { take: 1, select: { url: true } }
      },
      take: limit
    })

    // Format results
    const results = figures.map(f => ({
      id: f.id,
      name: f.name,
      type: 'figure' as const,
      image: f.images[0]?.url,
      subtitle: `${f.brand.name} • ${f.line?.name || ''}`
    }))

    return NextResponse.json({ results })
  } catch (error) {
    console.error('Error en búsqueda:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
