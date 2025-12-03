import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession, isAdmin } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const featured = searchParams.get('featured')
    const official = searchParams.get('official')
    const userId = searchParams.get('userId')

    const where: Record<string, unknown> = {}

    if (featured === 'true') where.isFeatured = true
    if (official === 'true') where.isOfficial = true
    if (userId) where.createdById = userId

    const lists = await prisma.list.findMany({
      where,
      include: {
        createdBy: {
          select: { id: true, username: true, name: true }
        },
        items: {
          include: {
            figure: {
              include: {
                images: { take: 1, orderBy: { order: 'asc' } }
              }
            }
          },
          take: 5,
          orderBy: { order: 'asc' }
        },
        _count: {
          select: { items: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ lists })
  } catch (error) {
    console.error('Error obteniendo lists:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { name, description, isOfficial } = body

    if (!name) {
      return NextResponse.json(
        { error: 'Nombre requerido' },
        { status: 400 }
      )
    }

    // Only admins can create official lists
    const official = isOfficial && isAdmin(session.role)

    const list = await prisma.list.create({
      data: {
        name,
        description: description || null,
        isOfficial: official,
        createdById: session.userId
      },
      include: {
        createdBy: {
          select: { id: true, username: true, name: true }
        }
      }
    })

    return NextResponse.json({ list }, { status: 201 })
  } catch (error) {
    console.error('Error creando list:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
