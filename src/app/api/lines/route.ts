import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession, isAdmin } from '@/lib/auth'
import { slugify } from '@/lib/utils'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const brandId = searchParams.get('brandId')

    const lines = await prisma.line.findMany({
      where: brandId ? { brandId } : undefined,
      include: {
        brand: true,
        _count: {
          select: { figures: true }
        }
      },
      orderBy: { name: 'asc' }
    })

    return NextResponse.json({ lines })
  } catch (error) {
    console.error('Error obteniendo lines:', error)
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
    const { name, description, brandId, releaseYear } = body

    if (!name || !brandId) {
      return NextResponse.json(
        { error: 'Nombre y brandId requeridos' },
        { status: 400 }
      )
    }

    const slug = slugify(name)

    const existing = await prisma.line.findUnique({
      where: { slug }
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Ya existe una línea con ese nombre' },
        { status: 400 }
      )
    }

    const line = await prisma.line.create({
      data: {
        name,
        slug,
        description: description || null,
        brandId,
        releaseYear: releaseYear || null
      },
      include: { brand: true }
    })

    return NextResponse.json({ line }, { status: 201 })
  } catch (error) {
    console.error('Error creando line:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
