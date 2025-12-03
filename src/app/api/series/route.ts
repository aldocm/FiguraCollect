import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession, isAdmin } from '@/lib/auth'
import { slugify } from '@/lib/utils'

export async function GET() {
  try {
    const series = await prisma.series.findMany({
      include: {
        _count: {
          select: { figures: true }
        }
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

    if (!session || !isAdmin(session.role)) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { name, description } = body

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

    const newSeries = await prisma.series.create({
      data: {
        name,
        slug,
        description: description || null
      }
    })

    return NextResponse.json({ series: newSeries }, { status: 201 })
  } catch (error) {
    console.error('Error creando series:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
