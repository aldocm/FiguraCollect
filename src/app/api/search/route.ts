import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { SearchResult, SearchResultType } from '@/lib/search'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')?.trim()
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 10

    if (!query || query.length < 1) {
      return NextResponse.json({ results: [] })
    }

    // Search all types in parallel (case-insensitive)
    const [figures, brands, lines, series] = await Promise.all([
      // Figures
      prisma.figure.findMany({
        where: { name: { contains: query, mode: 'insensitive' } },
        select: {
          id: true,
          name: true,
          brand: { select: { name: true } },
          line: { select: { name: true } },
          images: { take: 1, select: { url: true } }
        },
        take: Math.ceil(limit / 2) // Give more weight to figures
      }),
      // Brands
      prisma.brand.findMany({
        where: { name: { contains: query, mode: 'insensitive' } },
        select: {
          id: true,
          name: true,
          _count: { select: { figures: true } }
        },
        take: Math.ceil(limit / 4)
      }),
      // Lines
      prisma.line.findMany({
        where: { name: { contains: query, mode: 'insensitive' } },
        select: {
          id: true,
          name: true,
          brand: { select: { name: true } },
          _count: { select: { figures: true } }
        },
        take: Math.ceil(limit / 4)
      }),
      // Series
      prisma.series.findMany({
        where: { name: { contains: query, mode: 'insensitive' } },
        select: {
          id: true,
          name: true,
          _count: { select: { figures: true } }
        },
        take: Math.ceil(limit / 4)
      })
    ])

    // Format and combine results
    const results: SearchResult[] = [
      // Figures first (higher priority)
      ...figures.map(f => ({
        id: f.id,
        name: f.name,
        type: 'figure' as SearchResultType,
        image: f.images[0]?.url,
        subtitle: `${f.brand.name} • ${f.line?.name || ''}`
      })),
      // Brands
      ...brands.map(b => ({
        id: b.id,
        name: b.name,
        type: 'brand' as SearchResultType,
        subtitle: `${b._count.figures} figura${b._count.figures !== 1 ? 's' : ''}`
      })),
      // Lines
      ...lines.map(l => ({
        id: l.id,
        name: l.name,
        type: 'line' as SearchResultType,
        subtitle: `${l.brand.name} • ${l._count.figures} figura${l._count.figures !== 1 ? 's' : ''}`
      })),
      // Series
      ...series.map(s => ({
        id: s.id,
        name: s.name,
        type: 'series' as SearchResultType,
        subtitle: `${s._count.figures} figura${s._count.figures !== 1 ? 's' : ''}`
      }))
    ].slice(0, limit) // Limit total results

    return NextResponse.json({ results })
  } catch (error) {
    console.error('Error en búsqueda:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
