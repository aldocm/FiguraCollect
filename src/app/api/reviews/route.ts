import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const figureId = searchParams.get('figureId')
    const userId = searchParams.get('userId')

    const where: Record<string, unknown> = {}

    if (figureId) where.figureId = figureId
    if (userId) where.userId = userId

    const reviews = await prisma.review.findMany({
      where,
      include: {
        user: {
          select: { id: true, username: true, name: true }
        },
        figure: {
          include: {
            images: { take: 1 }
          }
        },
        images: { orderBy: { order: 'asc' } }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ reviews })
  } catch (error) {
    console.error('Error obteniendo reviews:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { figureId, rating, title, description, images } = body

    if (!figureId || !rating || !title || !description) {
      return NextResponse.json(
        { error: 'figureId, rating, title y description son requeridos' },
        { status: 400 }
      )
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating debe estar entre 1 y 5' },
        { status: 400 }
      )
    }

    // Check if user owns the figure
    const userFigure = await prisma.userFigure.findUnique({
      where: {
        userId_figureId: {
          userId: session.userId,
          figureId
        }
      }
    })

    if (!userFigure || userFigure.status !== 'OWNED') {
      return NextResponse.json(
        { error: 'Solo puedes hacer reviews de figuras que tienes (OWNED)' },
        { status: 403 }
      )
    }

    // Check if already reviewed
    const existing = await prisma.review.findUnique({
      where: {
        userId_figureId: {
          userId: session.userId,
          figureId
        }
      }
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Ya tienes una review para esta figura' },
        { status: 400 }
      )
    }

    // Limit images to 5
    const imageUrls = images?.slice(0, 5) || []

    const review = await prisma.review.create({
      data: {
        userId: session.userId,
        figureId,
        rating,
        title,
        description,
        images: imageUrls.length ? {
          create: imageUrls.map((url: string, index: number) => ({
            url,
            order: index
          }))
        } : undefined
      },
      include: {
        user: {
          select: { id: true, username: true, name: true }
        },
        images: true
      }
    })

    return NextResponse.json({ review }, { status: 201 })
  } catch (error) {
    console.error('Error creando review:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
