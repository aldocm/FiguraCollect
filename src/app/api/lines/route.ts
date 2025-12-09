import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession, isAdmin } from '@/lib/auth'
import { slugify } from '@/lib/utils'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const brandId = searchParams.get('brandId')
    const includeAll = searchParams.get('includeAll') === 'true'
    const session = await getSession()

    // Filtrar por status según contexto
    const where: Record<string, unknown> = {}
    if (!includeAll || !session || !isAdmin(session.role)) {
      where.status = 'APPROVED'
    }
    if (brandId) where.brandId = brandId

    const lines = await prisma.line.findMany({
      where,
      include: {
        brand: true,
        _count: {
          select: { figures: true }
        },
        createdBy: { select: { id: true, username: true } }
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

    // Cualquier usuario autenticado puede crear líneas
    if (!session) {
      return NextResponse.json(
        { error: 'Debes iniciar sesión para crear líneas' },
        { status: 401 }
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

    // Determinar status según rol
    const status = isAdmin(session.role) ? 'APPROVED' : 'PENDING'

    const line = await prisma.line.create({
      data: {
        name,
        slug,
        description: description || null,
        brandId,
        releaseYear: releaseYear || null,
        status,
        createdById: session.userId
      },
      include: { brand: true }
    })

    return NextResponse.json({
      line,
      message: status === 'PENDING'
        ? 'Línea creada. Pendiente de aprobación.'
        : 'Línea creada exitosamente.'
    }, { status: 201 })
  } catch (error) {
    console.error('Error creando line:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
