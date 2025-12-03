import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession, isAdmin } from '@/lib/auth'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      )
    }

    const { id } = await params
    const body = await request.json()
    const { rating, title, description, images } = body

    const existing = await prisma.review.findUnique({
      where: { id }
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Review no encontrada' },
        { status: 404 }
      )
    }

    if (existing.userId !== session.userId && !isAdmin(session.role)) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 403 }
      )
    }

    if (rating !== undefined && (rating < 1 || rating > 5)) {
      return NextResponse.json(
        { error: 'Rating debe estar entre 1 y 5' },
        { status: 400 }
      )
    }

    // Update images if provided
    if (images !== undefined) {
      await prisma.reviewImage.deleteMany({ where: { reviewId: id } })
      if (images.length > 0) {
        const imageUrls = images.slice(0, 5)
        await prisma.reviewImage.createMany({
          data: imageUrls.map((url: string, index: number) => ({
            reviewId: id,
            url,
            order: index
          }))
        })
      }
    }

    const review = await prisma.review.update({
      where: { id },
      data: {
        rating: rating !== undefined ? rating : existing.rating,
        title: title !== undefined ? title : existing.title,
        description: description !== undefined ? description : existing.description
      },
      include: {
        user: {
          select: { id: true, username: true, name: true }
        },
        images: true
      }
    })

    return NextResponse.json({ review })
  } catch (error) {
    console.error('Error actualizando review:', error)
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

    if (!session) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      )
    }

    const { id } = await params

    const existing = await prisma.review.findUnique({
      where: { id }
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Review no encontrada' },
        { status: 404 }
      )
    }

    if (existing.userId !== session.userId && !isAdmin(session.role)) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 403 }
      )
    }

    await prisma.review.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Review eliminada' })
  } catch (error) {
    console.error('Error eliminando review:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
