import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    const where: Record<string, unknown> = { userId: session.userId }

    if (status && ['WISHLIST', 'PREORDER', 'OWNED'].includes(status)) {
      where.status = status
    }

    const inventory = await prisma.userFigure.findMany({
      where,
      include: {
        figure: {
          include: {
            brand: true,
            line: true,
            images: { take: 1, orderBy: { order: 'asc' } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Calculate totals
    const totals = await prisma.userFigure.groupBy({
      by: ['status'],
      where: { userId: session.userId },
      _count: true
    })

    return NextResponse.json({ inventory, totals })
  } catch (error) {
    console.error('Error obteniendo inventario:', error)
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
    const { figureId, status, userPrice, preorderMonth } = body

    if (!figureId || !status) {
      return NextResponse.json(
        { error: 'figureId y status son requeridos' },
        { status: 400 }
      )
    }

    if (!['WISHLIST', 'PREORDER', 'OWNED'].includes(status)) {
      return NextResponse.json(
        { error: 'Status inválido' },
        { status: 400 }
      )
    }

    // Check if figure exists
    const figure = await prisma.figure.findUnique({
      where: { id: figureId }
    })

    if (!figure) {
      return NextResponse.json(
        { error: 'Figura no encontrada' },
        { status: 404 }
      )
    }

    // Check if already in inventory
    const existing = await prisma.userFigure.findUnique({
      where: {
        userId_figureId: {
          userId: session.userId,
          figureId
        }
      }
    })

    if (existing) {
      return NextResponse.json(
        { error: 'La figura ya está en tu inventario' },
        { status: 400 }
      )
    }

    const userFigure = await prisma.userFigure.create({
      data: {
        userId: session.userId,
        figureId,
        status,
        userPrice: userPrice || null,
        preorderMonth: status === 'PREORDER' ? (preorderMonth || figure.releaseDate) : null
      },
      include: {
        figure: {
          include: {
            brand: true,
            line: true,
            images: { take: 1 }
          }
        }
      }
    })

    return NextResponse.json({ userFigure }, { status: 201 })
  } catch (error) {
    console.error('Error agregando a inventario:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
