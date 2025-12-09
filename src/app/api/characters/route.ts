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

    const characters = await prisma.character.findMany({
      where,
      include: {
        series: {
          select: { id: true, name: true }
        },
        _count: {
          select: { figures: true }
        },
        createdBy: { select: { id: true, username: true } }
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

    // Cualquier usuario autenticado puede crear personajes
    if (!session) {
      return NextResponse.json(
        { error: 'Debes iniciar sesión para crear personajes' },
        { status: 401 }
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

    // Determinar status según rol
    const status = isAdmin(session.role) ? 'APPROVED' : 'PENDING'

    const character = await prisma.character.create({
      data: {
        name,
        slug,
        description: description || null,
        imageUrl: imageUrl || null,
        seriesId: seriesId || null,
        status,
        createdById: session.userId
      },
      include: {
        series: {
          select: { id: true, name: true }
        }
      }
    })

    return NextResponse.json({
      character,
      message: status === 'PENDING'
        ? 'Personaje creado. Pendiente de aprobación.'
        : 'Personaje creado exitosamente.'
    }, { status: 201 })
  } catch (error) {
    console.error('Error creando character:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
