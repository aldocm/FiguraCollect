import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession, isAdmin } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const figure = await prisma.figure.findUnique({
      where: { id },
      include: {
        brand: true,
        line: true,
        images: { orderBy: { order: 'asc' } },
        tags: { include: { tag: true } },
        series: { include: { series: true } },
        variants: {
          include: { images: true }
        },
        reviews: {
          include: {
            user: {
              select: { id: true, username: true, name: true }
            },
            images: true
          },
          orderBy: { createdAt: 'desc' }
        },
        _count: {
          select: { userFigures: true, reviews: true }
        }
      }
    })

    if (!figure) {
      return NextResponse.json(
        { error: 'Figura no encontrada' },
        { status: 404 }
      )
    }

    // Calculate average rating
    const avgRating = figure.reviews.length > 0
      ? figure.reviews.reduce((sum, r) => sum + r.rating, 0) / figure.reviews.length
      : null

    return NextResponse.json({ figure, avgRating })
  } catch (error) {
    console.error('Error obteniendo figure:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()

    if (!session || !isAdmin(session.role)) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 403 }
      )
    }

    const { id } = await params
    const body = await request.json()

    const existing = await prisma.figure.findUnique({
      where: { id }
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Figura no encontrada' },
        { status: 404 }
      )
    }

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
      releaseDate,
      isReleased,
      isNSFW,
      brandId,
      lineId,
      images,
      tagIds,
      seriesIds
    } = body

    // Update images if provided
    if (images !== undefined) {
      await prisma.figureImage.deleteMany({ where: { figureId: id } })
      if (images.length > 0) {
        await prisma.figureImage.createMany({
          data: images.map((url: string, index: number) => ({
            figureId: id,
            url,
            order: index
          }))
        })
      }
    }

    // Update tags if provided
    if (tagIds !== undefined) {
      await prisma.figureTag.deleteMany({ where: { figureId: id } })
      if (tagIds.length > 0) {
        await prisma.figureTag.createMany({
          data: tagIds.map((tagId: string) => ({
            figureId: id,
            tagId
          }))
        })
      }
    }

    // Update series if provided
    if (seriesIds !== undefined) {
      await prisma.figureSeries.deleteMany({ where: { figureId: id } })
      if (seriesIds.length > 0) {
        await prisma.figureSeries.createMany({
          data: seriesIds.map((seriesId: string) => ({
            figureId: id,
            seriesId
          }))
        })
      }
    }

    const figure = await prisma.figure.update({
      where: { id },
      data: {
        name: name !== undefined ? name : existing.name,
        description: description !== undefined ? description : existing.description,
        sku: sku !== undefined ? sku : existing.sku,
        heightCm: heightCm !== undefined ? heightCm : existing.heightCm,
        widthCm: widthCm !== undefined ? widthCm : existing.widthCm,
        depthCm: depthCm !== undefined ? depthCm : existing.depthCm,
        scale: scale !== undefined ? scale : existing.scale,
        material: material !== undefined ? material : existing.material,
        maker: maker !== undefined ? maker : existing.maker,
        priceMXN: priceMXN !== undefined ? priceMXN : existing.priceMXN,
        priceUSD: priceUSD !== undefined ? priceUSD : existing.priceUSD,
        priceYEN: priceYEN !== undefined ? priceYEN : existing.priceYEN,
        originalPriceCurrency: originalPriceCurrency !== undefined ? originalPriceCurrency : existing.originalPriceCurrency,
        releaseDate: releaseDate !== undefined ? releaseDate : existing.releaseDate,
        isReleased: isReleased !== undefined ? isReleased : existing.isReleased,
        isNSFW: isNSFW !== undefined ? isNSFW : existing.isNSFW,
        brandId: brandId !== undefined ? brandId : existing.brandId,
        lineId: lineId !== undefined ? lineId : existing.lineId
      },
      include: {
        brand: true,
        line: true,
        images: true,
        tags: { include: { tag: true } },
        series: { include: { series: true } }
      }
    })

    return NextResponse.json({ figure })
  } catch (error) {
    console.error('Error actualizando figure:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// PATCH - Actualización parcial simple (ej: marcar como lanzada)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()

    if (!session || !isAdmin(session.role)) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 403 }
      )
    }

    const { id } = await params
    const body = await request.json()

    const existing = await prisma.figure.findUnique({
      where: { id }
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Figura no encontrada' },
        { status: 404 }
      )
    }

    // Check if figure is being marked as released (was false, now true)
    const isBeingReleased = body.isReleased === true && !existing.isReleased

    // Solo permite actualizar campos específicos
    const allowedFields = ['isReleased', 'isNSFW']
    const updateData: Record<string, any> = {}

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field]
      }
    }

    const figure = await prisma.figure.update({
      where: { id },
      data: updateData
    })

    // If figure was just released, create notifications for users who have it in wishlist or preorder
    if (isBeingReleased) {
      const usersWithFigure = await prisma.userFigure.findMany({
        where: {
          figureId: id,
          status: { in: ['WISHLIST', 'PREORDER'] }
        },
        select: { userId: true, status: true }
      })

      if (usersWithFigure.length > 0) {
        await prisma.notification.createMany({
          data: usersWithFigure.map(uf => ({
            userId: uf.userId,
            type: 'FIGURE_RELEASED',
            title: '¡Figura lanzada!',
            message: `${existing.name} ya está disponible.`,
            link: `/catalog/${id}`,
            figureId: id
          }))
        })
      }
    }

    return NextResponse.json({ figure })
  } catch (error) {
    console.error('Error actualizando figure:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()

    if (!session || !isAdmin(session.role)) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 403 }
      )
    }

    const { id } = await params

    await prisma.figure.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Figura eliminada' })
  } catch (error) {
    console.error('Error eliminando figure:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
