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

    const brand = await prisma.brand.findUnique({
      where: { id },
      include: {
        lines: true,
        figures: {
          include: {
            images: { take: 1 }
          }
        }
      }
    })

    if (!brand) {
      return NextResponse.json(
        { error: 'Marca no encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json({ brand })
  } catch (error) {
    console.error('Error obteniendo brand:', error)
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
    const { name, description, country } = body

    const existing = await prisma.brand.findUnique({
      where: { id }
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Marca no encontrada' },
        { status: 404 }
      )
    }

    const slug = name ? slugify(name) : existing.slug

    if (name && slug !== existing.slug) {
      const slugExists = await prisma.brand.findUnique({
        where: { slug }
      })
      if (slugExists) {
        return NextResponse.json(
          { error: 'Ya existe una marca con ese nombre' },
          { status: 400 }
        )
      }
    }

    const brand = await prisma.brand.update({
      where: { id },
      data: {
        name: name || existing.name,
        slug,
        description: description !== undefined ? description : existing.description,
        country: country !== undefined ? country : existing.country
      }
    })

    return NextResponse.json({ brand })
  } catch (error) {
    console.error('Error actualizando brand:', error)
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

    await prisma.brand.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Marca eliminada' })
  } catch (error) {
    console.error('Error eliminando brand:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
