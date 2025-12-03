import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession, isAdmin } from '@/lib/auth'

export async function GET() {
  try {
    const tags = await prisma.tag.findMany({
      include: {
        _count: {
          select: { figures: true }
        }
      },
      orderBy: { name: 'asc' }
    })

    return NextResponse.json({ tags })
  } catch (error) {
    console.error('Error obteniendo tags:', error)
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
    const { name } = body

    if (!name) {
      return NextResponse.json(
        { error: 'Nombre requerido' },
        { status: 400 }
      )
    }

    const existing = await prisma.tag.findUnique({
      where: { name }
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Ya existe un tag con ese nombre' },
        { status: 400 }
      )
    }

    const tag = await prisma.tag.create({
      data: { name }
    })

    return NextResponse.json({ tag }, { status: 201 })
  } catch (error) {
    console.error('Error creando tag:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
