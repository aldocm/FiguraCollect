import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession, isAdmin } from '@/lib/auth'
import { slugify } from '@/lib/utils'

export async function GET() {
  try {
    const brands = await prisma.brand.findMany({
      include: {
        _count: {
          select: { lines: true, figures: true }
        }
      },
      orderBy: { name: 'asc' }
    })

    return NextResponse.json({ brands })
  } catch (error) {
    console.error('Error obteniendo brands:', error)
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
    const { name, description, country } = body

    if (!name) {
      return NextResponse.json(
        { error: 'Nombre requerido' },
        { status: 400 }
      )
    }

    const slug = slugify(name)

    const existing = await prisma.brand.findUnique({
      where: { slug }
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Ya existe una marca con ese nombre' },
        { status: 400 }
      )
    }

    const brand = await prisma.brand.create({
      data: {
        name,
        slug,
        description: description || null,
        country: country || null
      }
    })

    return NextResponse.json({ brand }, { status: 201 })
  } catch (error) {
    console.error('Error creando brand:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
