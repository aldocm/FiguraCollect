import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession, isAdmin, isSuperAdmin } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const list = await prisma.list.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: { id: true, username: true, name: true }
        },
        items: {
          include: {
            figure: {
              include: {
                brand: true,
                line: true,
                images: { take: 1, orderBy: { order: 'asc' } }
              }
            }
          },
          orderBy: { order: 'asc' }
        }
      }
    })

    if (!list) {
      return NextResponse.json(
        { error: 'Lista no encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json({ list })
  } catch (error) {
    console.error('Error obteniendo list:', error)
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

    if (!session) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      )
    }

    const { id } = await params
    const body = await request.json()
    const { name, description, isFeatured, isOfficial } = body

    const existing = await prisma.list.findUnique({
      where: { id }
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Lista no encontrada' },
        { status: 404 }
      )
    }

    // Only owner or admin can update
    if (existing.createdById !== session.userId && !isAdmin(session.role)) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 403 }
      )
    }

    // Only superadmin can set featured
    const featured = isFeatured !== undefined && isSuperAdmin(session.role)
      ? isFeatured
      : existing.isFeatured

    // Only admin can set official
    const official = isOfficial !== undefined && isAdmin(session.role)
      ? isOfficial
      : existing.isOfficial

    const list = await prisma.list.update({
      where: { id },
      data: {
        name: name || existing.name,
        description: description !== undefined ? description : existing.description,
        isFeatured: featured,
        isOfficial: official
      },
      include: {
        createdBy: {
          select: { id: true, username: true, name: true }
        }
      }
    })

    return NextResponse.json({ list })
  } catch (error) {
    console.error('Error actualizando list:', error)
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

    const existing = await prisma.list.findUnique({
      where: { id }
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Lista no encontrada' },
        { status: 404 }
      )
    }

    // Only owner or admin can delete
    if (existing.createdById !== session.userId && !isAdmin(session.role)) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 403 }
      )
    }

    await prisma.list.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Lista eliminada' })
  } catch (error) {
    console.error('Error eliminando list:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
