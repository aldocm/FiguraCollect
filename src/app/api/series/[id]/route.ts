import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession, isAdmin } from '@/lib/auth'
import { slugify } from '@/lib/utils'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const series = await prisma.series.findUnique({
      where: { id },
      include: {
        figures: {
          include: {
            figure: {
              include: {
                images: { take: 1 }
              }
            }
          }
        }
      }
    })

    if (!series) {
      return NextResponse.json(
        { error: 'Serie no encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json({ series })
  } catch (error) {
    console.error('Error obteniendo series:', error)
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
    const { name, description } = body

    const existing = await prisma.series.findUnique({
      where: { id }
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Serie no encontrada' },
        { status: 404 }
      )
    }

    const slug = name ? slugify(name) : existing.slug

    if (name && slug !== existing.slug) {
      const slugExists = await prisma.series.findUnique({
        where: { slug }
      })
      if (slugExists) {
        return NextResponse.json(
          { error: 'Ya existe una serie con ese nombre' },
          { status: 400 }
        )
      }
    }

    const series = await prisma.series.update({
      where: { id },
      data: {
        name: name || existing.name,
        slug,
        description: description !== undefined ? description : existing.description
      }
    })

    return NextResponse.json({ series })
  } catch (error) {
    console.error('Error actualizando series:', error)
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

    await prisma.series.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Serie eliminada' })
  } catch (error) {
    console.error('Error eliminando series:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
