import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession, isAdmin } from '@/lib/auth'
import { shouldShowPendingFigures } from '@/lib/config'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const brandId = searchParams.get('brandId')
    const lineId = searchParams.get('lineId')
    const seriesId = searchParams.get('seriesId')
    const search = searchParams.get('search')
    const isReleased = searchParams.get('isReleased')
    const includeAll = searchParams.get('includeAll') === 'true' // Para admin
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const session = await getSession()
    const where: Record<string, unknown> = {}

    // Filtrar por status según contexto
    if (!includeAll || !session || !isAdmin(session.role)) {
      // Para usuarios normales: solo mostrar aprobadas (o pendientes si está habilitado)
      const showPending = await shouldShowPendingFigures()
      if (showPending) {
        where.status = { in: ['APPROVED', 'PENDING'] }
      } else {
        where.status = 'APPROVED'
      }
    }
    // Si es admin con includeAll=true, no filtrar por status

    if (brandId) where.brandId = brandId
    if (lineId) where.lineId = lineId
    if (seriesId) {
      where.series = {
        some: { seriesId }
      }
    }
    if (search) {
      where.name = { contains: search, mode: 'insensitive' }
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
          character: true,
          images: { take: 1, orderBy: { order: 'asc' } },
          tags: { include: { tag: true } },
          series: { include: { series: true } },
          createdBy: { select: { id: true, username: true } },
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

    // Ahora cualquier usuario autenticado puede crear figuras
    if (!session) {
      return NextResponse.json(
        { error: 'Debes iniciar sesión para crear figuras' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const {
      name,
      description,
      sku,
      heightCm,
      widthCm,
      depthCm,
      scale,
      material,
      maker,
      priceMXN,
      priceUSD,
      priceYEN,
      originalPriceCurrency,
      releaseYear,
      releaseMonth,
      releaseDay,
      isReleased,
      isNSFW,
      brandId,
      lineId,
      characterId,
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

    // Determinar status según el rol del usuario
    const status = isAdmin(session.role) ? 'APPROVED' : 'PENDING'

    const figure = await prisma.figure.create({
      data: {
        name,
        description: description || null,
        sku: sku || null,
        heightCm: heightCm || null,
        widthCm: widthCm || null,
        depthCm: depthCm || null,
        scale: scale || null,
        material: material || null,
        maker: maker || null,
        priceMXN: priceMXN || null,
        priceUSD: priceUSD || null,
        priceYEN: priceYEN || null,
        originalPriceCurrency: originalPriceCurrency || null,
        releaseYear: releaseYear ? parseInt(releaseYear) : null,
        releaseMonth: releaseMonth ? parseInt(releaseMonth) : null,
        releaseDay: releaseDay ? parseInt(releaseDay) : null,
        isReleased: isReleased || false,
        isNSFW: isNSFW || false,
        status,
        createdById: session.userId,
        // Si es admin, también marcar como aprobado por él mismo
        approvedById: isAdmin(session.role) ? session.userId : null,
        approvedAt: isAdmin(session.role) ? new Date() : null,
        brandId,
        lineId,
        characterId: characterId || null,
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
        character: true,
        images: true,
        tags: { include: { tag: true } },
        series: { include: { series: true } }
      }
    })

    return NextResponse.json({
      figure,
      message: status === 'PENDING'
        ? 'Figura creada. Pendiente de aprobación por un administrador.'
        : 'Figura creada exitosamente.'
    }, { status: 201 })
  } catch (error) {
    console.error('Error creando figure:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
