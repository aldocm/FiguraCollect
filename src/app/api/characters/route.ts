import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession, isAdmin } from '@/lib/auth'
import { slugify } from '@/lib/utils'

export async function GET() {
  try {
    const characters = await prisma.character.findMany({
      include: {
        series: {
          select: { id: true, name: true }
        },
        _count: {
          select: { figures: true }
        }
      },
      orderBy: { name: 'asc' }
    })

    return NextResponse.json({ characters })
  } catch (error) {
    console.error('Error obteniendo characters:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session || !isAdmin(session.role)) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { name, description, imageUrl, seriesId } = body

    if (!name) {
      return NextResponse.json(
        { error: 'Nombre requerido' },
        { status: 400 }
      )
    }

    const slug = slugify(name)

    const existing = await prisma.character.findUnique({
      where: { slug }
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Ya existe un personaje con ese nombre' },
        { status: 400 }
      )
    }

    const character = await prisma.character.create({
      data: {
        name,
        slug,
        description: description || null,
        imageUrl: imageUrl || null,
        seriesId: seriesId || null
      },
      include: {
        series: {
          select: { id: true, name: true }
        }
      }
    })

    return NextResponse.json({ character }, { status: 201 })
  } catch (error) {
    console.error('Error creando character:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
