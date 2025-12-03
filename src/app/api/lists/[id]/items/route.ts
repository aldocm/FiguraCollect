import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession, isAdmin } from '@/lib/auth'

export async function POST(
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
    const { figureId } = body

    if (!figureId) {
      return NextResponse.json(
        { error: 'figureId requerido' },
        { status: 400 }
      )
    }

    const list = await prisma.list.findUnique({
      where: { id }
    })

    if (!list) {
      return NextResponse.json(
        { error: 'Lista no encontrada' },
        { status: 404 }
      )
    }

    // Only owner or admin can add items
    if (list.createdById !== session.userId && !isAdmin(session.role)) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 403 }
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

    // Check if already in list
    const existing = await prisma.listItem.findUnique({
      where: {
        listId_figureId: { listId: id, figureId }
      }
    })

    if (existing) {
      return NextResponse.json(
        { error: 'La figura ya está en esta lista' },
        { status: 400 }
      )
    }

    // Get current max order
    const maxOrder = await prisma.listItem.findFirst({
      where: { listId: id },
      orderBy: { order: 'desc' },
      select: { order: true }
    })

    const item = await prisma.listItem.create({
      data: {
        listId: id,
        figureId,
        order: (maxOrder?.order || 0) + 1
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

    return NextResponse.json({ item }, { status: 201 })
  } catch (error) {
    console.error('Error agregando item a lista:', error)
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
    const { searchParams } = new URL(request.url)
    const figureId = searchParams.get('figureId')

    if (!figureId) {
      return NextResponse.json(
        { error: 'figureId requerido' },
        { status: 400 }
      )
    }

    const list = await prisma.list.findUnique({
      where: { id }
    })

    if (!list) {
      return NextResponse.json(
        { error: 'Lista no encontrada' },
        { status: 404 }
      )
    }

    // Only owner or admin can remove items
    if (list.createdById !== session.userId && !isAdmin(session.role)) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 403 }
      )
    }

    await prisma.listItem.delete({
      where: {
        listId_figureId: { listId: id, figureId }
      }
    })

    return NextResponse.json({ message: 'Item eliminado de la lista' })
  } catch (error) {
    console.error('Error eliminando item de lista:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
