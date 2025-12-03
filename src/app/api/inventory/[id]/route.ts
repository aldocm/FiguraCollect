import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'

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
    const { status, userPrice, preorderMonth } = body

    const existing = await prisma.userFigure.findUnique({
      where: { id }
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Entrada no encontrada' },
        { status: 404 }
      )
    }

    if (existing.userId !== session.userId) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 403 }
      )
    }

    if (status && !['WISHLIST', 'PREORDER', 'OWNED'].includes(status)) {
      return NextResponse.json(
        { error: 'Status inválido' },
        { status: 400 }
      )
    }

    const userFigure = await prisma.userFigure.update({
      where: { id },
      data: {
        status: status || existing.status,
        userPrice: userPrice !== undefined ? userPrice : existing.userPrice,
        preorderMonth: preorderMonth !== undefined ? preorderMonth : existing.preorderMonth
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

    return NextResponse.json({ userFigure })
  } catch (error) {
    console.error('Error actualizando inventario:', error)
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

    const existing = await prisma.userFigure.findUnique({
      where: { id }
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Entrada no encontrada' },
        { status: 404 }
      )
    }

    if (existing.userId !== session.userId) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 403 }
      )
    }

    await prisma.userFigure.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Eliminado del inventario' })
  } catch (error) {
    console.error('Error eliminando de inventario:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
