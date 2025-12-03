import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession, isAdmin } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const brandId = searchParams.get('brandId')
    const lineId = searchParams.get('lineId')
    const seriesId = searchParams.get('seriesId')
    const search = searchParams.get('search')
    const isReleased = searchParams.get('isReleased')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const where: Record<string, unknown> = {}

    if (brandId) where.brandId = brandId
    if (lineId) where.lineId = lineId
    if (seriesId) {
      where.series = {
        some: { seriesId }
      }
    }
    if (search) {
      where.name = { contains: search }
    }
    if (isReleased !== null && isReleased !== undefined) {
      where.isReleased = isReleased === 'true'
    }

    const [figures, total] = await Promise.all([
      prisma.figure.findMany({
        where,
        include: {
          brand: true,
          line: true,
          images: { take: 1, orderBy: { order: 'asc' } },
          tags: { include: { tag: true } },
          series: { include: { series: true } },
          _count: {
            select: { reviews: true, userFigures: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.figure.count({ where })
    ])

    return NextResponse.json({
      figures,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error obteniendo figures:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session || !isAdmin(session.role)) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const {
      name,
      description,
      sku,
      size,
      scale,
      material,
      maker,
      priceMXN,
      priceUSD,
      priceYEN,
      releaseDate,
      isReleased,
      isNSFW,
      brandId,
      lineId,
      images,
      tagIds,
      seriesIds
    } = body

    if (!name || !brandId || !lineId) {
      return NextResponse.json(
        { error: 'Nombre, brandId y lineId son requeridos' },
        { status: 400 }
      )
    }

    const figure = await prisma.figure.create({
      data: {
        name,
        description: description || null,
        sku: sku || null,
        size: size || null,
        scale: scale || null,
        material: material || null,
        maker: maker || null,
        priceMXN: priceMXN || null,
        priceUSD: priceUSD || null,
        priceYEN: priceYEN || null,
        releaseDate: releaseDate || null,
        isReleased: isReleased || false,
        isNSFW: isNSFW || false,
        brandId,
        lineId,
        images: images?.length ? {
          create: images.map((url: string, index: number) => ({
            url,
            order: index
          }))
        } : undefined,
        tags: tagIds?.length ? {
          create: tagIds.map((tagId: string) => ({ tagId }))
        } : undefined,
        series: seriesIds?.length ? {
          create: seriesIds.map((seriesId: string) => ({ seriesId }))
        } : undefined
      },
      include: {
        brand: true,
        line: true,
        images: true,
        tags: { include: { tag: true } },
        series: { include: { series: true } }
      }
    })

    return NextResponse.json({ figure }, { status: 201 })
  } catch (error) {
    console.error('Error creando figure:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
