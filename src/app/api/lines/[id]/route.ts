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

    const line = await prisma.line.findUnique({
      where: { id },
      include: {
        brand: true,
        figures: {
          include: {
            images: { take: 1 }
          }
        }
      }
    })

    if (!line) {
      return NextResponse.json(
        { error: 'Línea no encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json({ line })
  } catch (error) {
    console.error('Error obteniendo line:', error)
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
    const { name, description, imageUrl, brandId, releaseYear } = body

    const existing = await prisma.line.findUnique({
      where: { id }
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Línea no encontrada' },
        { status: 404 }
      )
    }

    const slug = name ? slugify(name) : existing.slug

    if (name && slug !== existing.slug) {
      const slugExists = await prisma.line.findUnique({
        where: { slug }
      })
      if (slugExists) {
        return NextResponse.json(
          { error: 'Ya existe una línea con ese nombre' },
          { status: 400 }
        )
      }
    }

    const line = await prisma.line.update({
      where: { id },
      data: {
        name: name || existing.name,
        slug,
        description: description !== undefined ? description : existing.description,
        imageUrl: imageUrl !== undefined ? imageUrl : existing.imageUrl,
        brandId: brandId || existing.brandId,
        releaseYear: releaseYear !== undefined ? releaseYear : existing.releaseYear
      },
      include: { brand: true }
    })

    return NextResponse.json({ line })
  } catch (error) {
    console.error('Error actualizando line:', error)
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

    await prisma.line.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Línea eliminada' })
  } catch (error) {
    console.error('Error eliminando line:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
