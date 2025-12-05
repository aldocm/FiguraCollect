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

    const character = await prisma.character.findUnique({
      where: { id },
      include: {
        series: {
          select: { id: true, name: true }
        },
        figures: {
          include: {
            images: { take: 1 },
            brand: { select: { name: true } },
            line: { select: { name: true } }
          }
        }
      }
    })

    if (!character) {
      return NextResponse.json(
        { error: 'Personaje no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({ character })
  } catch (error) {
    console.error('Error obteniendo character:', error)
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
    const { name, description, imageUrl, seriesId } = body

    const existing = await prisma.character.findUnique({
      where: { id }
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Personaje no encontrado' },
        { status: 404 }
      )
    }

    const slug = name ? slugify(name) : existing.slug

    if (name && slug !== existing.slug) {
      const slugExists = await prisma.character.findUnique({
        where: { slug }
      })
      if (slugExists) {
        return NextResponse.json(
          { error: 'Ya existe un personaje con ese nombre' },
          { status: 400 }
        )
      }
    }

    const character = await prisma.character.update({
      where: { id },
      data: {
        name: name || existing.name,
        slug,
        description: description !== undefined ? description : existing.description,
        imageUrl: imageUrl !== undefined ? imageUrl : existing.imageUrl,
        seriesId: seriesId !== undefined ? seriesId : existing.seriesId
      },
      include: {
        series: {
          select: { id: true, name: true }
        }
      }
    })

    return NextResponse.json({ character })
  } catch (error) {
    console.error('Error actualizando character:', error)
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

    await prisma.character.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Personaje eliminado' })
  } catch (error) {
    console.error('Error eliminando character:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
