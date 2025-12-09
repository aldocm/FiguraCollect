import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession, isAdmin } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session || !isAdmin(session.role)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') // figures, brands, lines, series, characters, all

    const where = { status: 'PENDING' }

    // Contadores para todos los tipos
    const [
      figuresCount,
      brandsCount,
      linesCount,
      seriesCount,
      charactersCount
    ] = await Promise.all([
      prisma.figure.count({ where }),
      prisma.brand.count({ where }),
      prisma.line.count({ where }),
      prisma.series.count({ where }),
      prisma.character.count({ where })
    ])

    const counts = {
      figures: figuresCount,
      brands: brandsCount,
      lines: linesCount,
      series: seriesCount,
      characters: charactersCount,
      total: figuresCount + brandsCount + linesCount + seriesCount + charactersCount
    }

    // Si solo quieren conteos
    if (type === 'counts') {
      return NextResponse.json({ counts })
    }

    // Obtener datos según el tipo solicitado
    let data: Record<string, unknown> = {}

    if (!type || type === 'all') {
      const [figures, brands, lines, series, characters] = await Promise.all([
        prisma.figure.findMany({
          where,
          include: {
            brand: true,
            line: true,
            images: { take: 1, orderBy: { order: 'asc' } },
            createdBy: { select: { id: true, username: true, email: true } }
          },
          orderBy: { createdAt: 'desc' }
        }),
        prisma.brand.findMany({
          where,
          include: { createdBy: { select: { id: true, username: true, email: true } } },
          orderBy: { createdAt: 'desc' }
        }),
        prisma.line.findMany({
          where,
          include: {
            brand: true,
            createdBy: { select: { id: true, username: true, email: true } }
          },
          orderBy: { createdAt: 'desc' }
        }),
        prisma.series.findMany({
          where,
          include: { createdBy: { select: { id: true, username: true, email: true } } },
          orderBy: { createdAt: 'desc' }
        }),
        prisma.character.findMany({
          where,
          include: {
            series: true,
            createdBy: { select: { id: true, username: true, email: true } }
          },
          orderBy: { createdAt: 'desc' }
        })
      ])

      data = { figures, brands, lines, series, characters }
    } else {
      // Obtener solo un tipo específico
      switch (type) {
        case 'figures':
          data.figures = await prisma.figure.findMany({
            where,
            include: {
              brand: true,
              line: true,
              images: { take: 1, orderBy: { order: 'asc' } },
              createdBy: { select: { id: true, username: true, email: true } }
            },
            orderBy: { createdAt: 'desc' }
          })
          break
        case 'brands':
          data.brands = await prisma.brand.findMany({
            where,
            include: { createdBy: { select: { id: true, username: true, email: true } } },
            orderBy: { createdAt: 'desc' }
          })
          break
        case 'lines':
          data.lines = await prisma.line.findMany({
            where,
            include: {
              brand: true,
              createdBy: { select: { id: true, username: true, email: true } }
            },
            orderBy: { createdAt: 'desc' }
          })
          break
        case 'series':
          data.series = await prisma.series.findMany({
            where,
            include: { createdBy: { select: { id: true, username: true, email: true } } },
            orderBy: { createdAt: 'desc' }
          })
          break
        case 'characters':
          data.characters = await prisma.character.findMany({
            where,
            include: {
              series: true,
              createdBy: { select: { id: true, username: true, email: true } }
            },
            orderBy: { createdAt: 'desc' }
          })
          break
      }
    }

    return NextResponse.json({ ...data, counts })
  } catch (error) {
    console.error('Error obteniendo contenido pendiente:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
