import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession, isAdmin } from '@/lib/auth'
import { slugify } from '@/lib/utils'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const includeAll = searchParams.get('includeAll') === 'true'
    const session = await getSession()

    // Filtrar por status según contexto
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let where: Record<string, any> = {}

    if (includeAll && session && isAdmin(session.role)) {
      // Admin viendo todo (panel de admin)
      where = {}
    } else if (session) {
      // Usuario autenticado: ve APPROVED + sus propios PENDING
      where = {
        OR: [
          { status: 'APPROVED' },
          { status: 'PENDING', createdById: session.userId }
        ]
      }
    } else {
      // Usuario no autenticado: solo APPROVED
      where = { status: 'APPROVED' }
    }

    const series = await prisma.series.findMany({
      where,
      include: {
        _count: {
          select: { figures: true }
        },
        createdBy: { select: { id: true, username: true } }
      },
      orderBy: { name: 'asc' }
    })

    return NextResponse.json({ series })
  } catch (error) {
    console.error('Error obteniendo series:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()

    // Cualquier usuario autenticado puede crear series
    if (!session) {
      return NextResponse.json(
        { error: 'Debes iniciar sesión para crear series' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { name, description, imageUrl } = body

    if (!name) {
      return NextResponse.json(
        { error: 'Nombre requerido' },
        { status: 400 }
      )
    }

    const slug = slugify(name)

    const existing = await prisma.series.findUnique({
      where: { slug }
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Ya existe una serie con ese nombre' },
        { status: 400 }
      )
    }

    // Determinar status según rol
    const status = isAdmin(session.role) ? 'APPROVED' : 'PENDING'

    const newSeries = await prisma.series.create({
      data: {
        name,
        slug,
        description: description || null,
        imageUrl: imageUrl || null,
        status,
        createdById: session.userId
      }
    })

    return NextResponse.json({
      series: newSeries,
      message: status === 'PENDING'
        ? 'Serie creada. Pendiente de aprobación.'
        : 'Serie creada exitosamente.'
    }, { status: 201 })
  } catch (error) {
    console.error('Error creando series:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
